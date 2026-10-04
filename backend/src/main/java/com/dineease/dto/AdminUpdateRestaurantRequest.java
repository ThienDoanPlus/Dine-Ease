package com.dineease.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminUpdateRestaurantRequest(
    String name,
    String phoneContact,
    String address,
    String description,
    BigDecimal commissionRate,
    Long cuisineId,
    List<Long> amenityIds,
    String newPassword // Tùy chọn: Nếu Admin bấm tạo mật khẩu mới
) {}
