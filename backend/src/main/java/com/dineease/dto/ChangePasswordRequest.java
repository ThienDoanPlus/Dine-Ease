package com.dineease.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại")
    String oldPassword,

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
    String newPassword,

    @NotBlank(message = "Vui lòng xác nhận mật khẩu mới")
    String confirmPassword
) {}
