package com.dineease.dto;

import jakarta.validation.constraints.NotBlank;

public record RequestUpdateMessageRequest(
    @NotBlank(message = "Nội dung yêu cầu bổ sung không được để trống")
    String message
) {}
