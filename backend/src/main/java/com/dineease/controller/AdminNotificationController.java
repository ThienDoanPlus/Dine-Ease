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

import com.dineease.dto.NotificationRequest;
import com.dineease.dto.NotificationResponse;
import com.dineease.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Admin - Notifications", description = "Quản trị viên: Tạo & Gửi thông báo hệ thống")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Tạo chiến dịch thông báo mới")
    @PostMapping
    public ResponseEntity<NotificationResponse> createCampaign(
            @Valid @RequestBody NotificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Lấy adminId từ user đang đăng nhập (SecurityContext) thông qua email
        String adminEmail = userDetails.getUsername();
        
        NotificationResponse created = notificationService.createCampaign(request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Lấy danh sách các chiến dịch đã tạo (Lịch sử)")
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getAllCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationResponse> response = notificationService.getAllCampaigns(pageable);
        
        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // THÊM API HỦY CHIẾN DỊCH
    // ==========================================================
    @Operation(summary = "Hủy chiến dịch đã lên lịch", description = "Chỉ áp dụng cho các chiến dịch đang ở trạng thái SCHEDULED")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        notificationService.cancelCampaign(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}