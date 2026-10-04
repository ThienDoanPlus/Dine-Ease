package com.dineease.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.CancelReservationRequest;
import com.dineease.dto.ReservationRequest;
import com.dineease.dto.ReservationResponse;
import com.dineease.service.CustomerReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

//Api đặt bàn (Yêu cầu token)
@Tag(name = "Customer - Reservation", description = "Khách hàng đặt bàn và xem lịch sử đặt bàn của mình")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/reservations")
public class CustomerReservationController {

    private final CustomerReservationService reservationService;

    public CustomerReservationController(CustomerReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Operation(summary = "Tạo đơn đặt bàn mới", description = "Hệ thống sẽ tự động tính toán tổng số người đã đặt ở khung giờ đó. Nếu vượt quá sức chứa của nhà hàng, API sẽ trả về lỗi 409 Conflict (DuplicateResourceException).")
    @PostMapping
    public ResponseEntity<ReservationResponse> createBooking(
        @Valid @RequestBody ReservationRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        ReservationResponse response = reservationService.createReservation(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Lấy lịch sử đặt bàn của tôi")
    @GetMapping
    public ResponseEntity<Page<ReservationResponse>> getMyHistory(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        
        String email = userDetails.getUsername();
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservationDate").descending());
        return ResponseEntity.ok(reservationService.getMyReservations(email,pageable));
    }

    @Operation(summary = "Hủy đơn đặt bàn", description = "Chỉ cho phép khách tự hủy khi đơn đang ở trạng thái PENDING hoặc CONFIRMED. Bắt buộc nhập lý do hủy.")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelBooking(
        @PathVariable Long id,
        @Valid @RequestBody CancelReservationRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        ReservationResponse response = reservationService.cancelReservation(id, request,email);
        return ResponseEntity.ok(response);
    }
}
