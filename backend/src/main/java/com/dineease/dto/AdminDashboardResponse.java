package com.dineease.dto;
import java.math.BigDecimal;

public record AdminDashboardResponse(
    Long totalRestaurants,        // Tổng số nhà hàng đang Active
    Long totalReservations,       // Tổng số đơn đặt bàn (toàn hệ thống)
    Long successfulReservations,  // Số đơn đã hoàn thành (Thành công)
    BigDecimal totalCommissionRevenue // Tổng doanh thu hoa hồng của nền tảng
) {}