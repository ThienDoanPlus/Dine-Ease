package com.dineease.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateCommissionRequest(
    @NotNull(message = "Mức hoa hồng mới không được để trống")
    String newCommissionRate,
    
    @NotBlank(message = "Lý do không được để trống")
    String reason,

    // [BỔ SUNG]: Biến cờ (Flag) báo hiệu có áp dụng hồi tố hay không
    @jakarta.validation.constraints.NotNull(message = "Thiếu tùy chọn áp dụng hồi tố")
    Boolean applyToExisting
) {}
