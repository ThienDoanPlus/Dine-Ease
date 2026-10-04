package com.dineease.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.AuthResponse;
import com.dineease.dto.LoginRequest;
import com.dineease.dto.RegisterRequest;
import com.dineease.dto.UserResponse;
import com.dineease.service.AuthService;
import com.dineease.dto.RefreshTokenRequest;
import jakarta.servlet.http.HttpServletRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "1. Authentication", description = "Xác thực người dùng (Đăng ký, Đăng nhập)")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Đăng ký Khách hàng mới (Customer)")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse created = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Đăng nhập hệ thống", description = "Dùng Email và Password. Trả về Access Token.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(auth);
    }

    @Operation(summary = "Lấy thông tin tài khoản đang đăng nhập", description = "Bắt buộc truyền Bearer Token")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        if(userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Đăng xuất", description = "Đưa Token hiện tại vào Danh sách đen (Blacklist)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            authService.logout(bearerToken.substring(7));
        }
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Refresh Token", description = "Đổi Refresh Token lấy Access Token mới")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Đối tác nộp đơn đăng ký nhà hàng")
    @PostMapping(value = "/partner-register", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> registerPartner(
            @RequestPart("data") @Valid com.dineease.dto.RestaurantRegisterRequest request,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image,
            
            // [VÁ LỖ HỔNG THIẾU DATA]: Nhận thêm giấy tờ pháp lý
            @RequestPart(value = "license", required = false) org.springframework.web.multipart.MultipartFile license,
            @RequestPart(value = "idCard", required = false) org.springframework.web.multipart.MultipartFile idCard) {
        
        authService.registerPartner(request, image, license, idCard);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }


    @Operation(summary = "Khôi phục dữ liệu đăng ký nhà hàng cũ bằng Email và SĐT")

    @GetMapping("/partner-register/draft")
    public ResponseEntity<?> getPartnerDraft(@RequestParam String email, @RequestParam String phone) {
        java.util.Map<String, Object> draft = authService.getPartnerDraft(email, phone);
        if (draft == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(draft);
    }
}