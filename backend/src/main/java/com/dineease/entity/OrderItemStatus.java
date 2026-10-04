package com.dineease.entity;
public enum OrderItemStatus {
    PENDING,    // Chờ chế biến
    COOKING,    // Đang nấu
    READY,      // Đã xong (Bếp gọi phục vụ lấy)
    SERVED,     // Đã mang ra bàn
    REJECTED    // [VÁ LỖ HỔNG]: Bếp từ chối (Hết nguyên liệu)
}

