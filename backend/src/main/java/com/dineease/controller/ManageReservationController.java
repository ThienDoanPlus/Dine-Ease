package com.dineease.controller;
import com.dineease.dto.ManageReservationResponse;
import com.dineease.dto.KanbanBoardResponse;
import com.dineease.dto.UpdateManageReservationStatusRequest;
import com.dineease.service.ManageReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Restaurant - Reservation Management", description = "Chủ nhà hàng: Quản lý Đơn đặt bàn & Check-in")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/manage/reservations")
public class ManageReservationController {
    private final ManageReservationService manageReservationService;

    public ManageReservationController(ManageReservationService manageReservationService) {
        this.manageReservationService = manageReservationService;
    }

    @Operation(summary = "Lấy danh sách Đơn đặt bàn của Quán", description = "Chỉ trả về các đơn thuộc nhà hàng của User đang đăng nhập")
    @GetMapping
    public ResponseEntity<Page<ManageReservationResponse>> getMyReservations(
    Authentication auth,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size,
        Sort.by("reservationDate").ascending().and(Sort.by("reservationTime").ascending()));
        Page<ManageReservationResponse> responses = manageReservationService.getMyReservations(auth.getName(), pageable);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Cập nhật trạng thái đơn (Duyệt / Check-in)", description = "Truyền status = CONFIRMED để duyệt đơn. Truyền status = CHECKED_IN kèm tableId để xếp bàn đón khách.")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ManageReservationResponse> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateManageReservationStatusRequest request, Authentication auth) {
        ManageReservationResponse response =
        manageReservationService.updateReservationStatus(id, request, auth.getName());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy dữ liệu bảng Kanban", description = "Backend tự động gom nhóm trạng thái thành 3 cột và xử lý tìm kiếm. Đã chặn lỗi tràn RAM bằng cách ép lọc theo ngày.")
    @GetMapping("/kanban")
    public ResponseEntity<KanbanBoardResponse> getKanbanBoard(
        Authentication auth,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) java.time.LocalDate date) { // <--- THÊM PARAM NÀY
        
        // Nếu Frontend không gửi ngày lên -> Mặc định lấy ngày hôm nay theo giờ VN
        java.time.LocalDate targetDate = date != null ? date : java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        
        return ResponseEntity.ok(manageReservationService.getKanbanBoardData(auth.getName(), keyword, targetDate));
    }

}