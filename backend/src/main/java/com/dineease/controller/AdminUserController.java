package com.dineease.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import com.dineease.dto.UserResponse;
import com.dineease.dto.UserStatusUpdateRequest;
import com.dineease.entity.Role;
import com.dineease.service.UserService;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Admin - Users Management", description = "Quản trị viên: Xem danh sách người dùng")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {
    
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Lấy danh sách người dùng (Phân trang, Lọc)")
    @GetMapping()
    public ResponseEntity<Page<UserResponse>> listUsers(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Role role,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sort,
        @RequestParam(defaultValue = "desc") String order
    ) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC; 
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(direction, sort));
        
        Page<UserResponse> users = userService.findAll(keyword, role, pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Khóa / Mở khóa tài khoản người dùng")
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Lấy email của Admin đang thao tác để check bảo mật
        String adminEmail = userDetails.getUsername();
        
        UserResponse updatedUser = userService.updateUserStatus(id, request.status(), adminEmail);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Xóa tài khoản người dùng (Xóa mềm / Soft Delete)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminEmail = userDetails.getUsername();
        userService.softDeleteUser(id, adminEmail);
        
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Phân quyền người dùng (Cập nhật Roles)")
    @PutMapping("/{id}/roles")
    public ResponseEntity<com.dineease.dto.UserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody com.dineease.dto.UserRoleUpdateRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        String adminEmail = userDetails.getUsername(); // Lấy email của người đang thao tác
        
        com.dineease.dto.UserResponse updatedUser = userService.updateUserRoles(id, request.roles(), adminEmail);
        return ResponseEntity.ok(updatedUser);
    }
}