package com.dineease.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.ChangePasswordRequest;
import com.dineease.dto.UpdateProfileRequest;
import com.dineease.dto.UserResponse;
import com.dineease.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Customer - Profile", description = "Khách hàng quản lý thông tin cá nhân")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final UserService userService;

    public CustomerController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Cập nhật thông tin cá nhân")
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication auth) {
        
        // auth.getName() chính là Email của User đang đăng nhập từ Token
        UserResponse updatedUser = userService.updateProfile(auth.getName(), request);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Đổi mật khẩu tài khoản")
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication auth) {
        
        // auth.getName() chính là Email của User đang đăng nhập từ Token
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.ok().build();
    }
}
