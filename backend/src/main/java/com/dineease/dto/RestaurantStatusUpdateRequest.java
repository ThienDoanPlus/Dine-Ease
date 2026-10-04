package com.dineease.dto;
import java.math.BigDecimal;

import com.dineease.entity.RestaurantStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record RestaurantStatusUpdateRequest(
    @NotNull(message = "Trạng thái không được để trống")
    RestaurantStatus status,

    // Mức hoa hồng Admin cấu hình khi duyệt quán (chỉ áp dụng nếu status = APPROVED)
    @PositiveOrZero(message = "Mức chiết khấu không được là số âm")
    BigDecimal commissionRate 
) {}