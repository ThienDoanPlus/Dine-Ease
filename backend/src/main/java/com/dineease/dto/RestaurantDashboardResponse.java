package com.dineease.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record RestaurantDashboardResponse(
    BigDecimal totalRevenue,
    Integer totalGuests,
    Long newOrders,
    Integer occupancyRate, // Tỷ lệ lấp đầy (%)
    List<Map<String, Object>> chartData // Dữ liệu cho biểu đồ
) {}
