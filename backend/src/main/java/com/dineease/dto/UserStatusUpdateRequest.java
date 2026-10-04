package com.dineease.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserStatusUpdateRequest(
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(ACTIVE|BANNED)$", message = "Trạng thái chỉ có thể là ACTIVE hoặc BANNED")
    String status
) {}
