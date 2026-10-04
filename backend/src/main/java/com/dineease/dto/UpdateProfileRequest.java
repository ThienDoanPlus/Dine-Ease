package com.dineease.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
    @NotBlank(message = "Họ tên không được để trống")
    String fullName,
    
    String phone,
    String avatarUrl
) {}
