package com.dineease.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng Email không hợp lệ")
    String email,

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    String password,
    
    @NotBlank(message = "Họ và tên không được để trống")
    String fullName,
    
    @NotBlank(message = "Số điện thoại không được để trống")
    String phone,

    // [TÍCH HỢP TỪ YẾN]: Tùy chọn (Optional) - Dùng khi Login/Register bằng Google
    String avatarUrl
){}