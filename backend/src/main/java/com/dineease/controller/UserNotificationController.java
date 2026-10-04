package com.dineease.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.UserNotificationResponse;
import com.dineease.service.UserNotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "User - Notifications", description = "Lấy thông báo In-App (Quả chuông)")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/my-notifications")
public class UserNotificationController {

    private final UserNotificationService notificationService;

    public UserNotificationController(UserNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Lấy danh sách thông báo của tôi")
    @GetMapping
    public ResponseEntity<List<UserNotificationResponse>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getMyNotifications(auth.getName()));
    }

    @Operation(summary = "Đánh dấu 1 thông báo là đã đọc")
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication auth) {
        notificationService.markAsRead(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Đánh dấu tất cả là đã đọc")
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok().build();
    }
}
