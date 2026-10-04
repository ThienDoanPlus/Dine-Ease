package com.dineease.dto;
import java.util.List;

public record KitchenOrderResponse(
    String id,       // Trả về orderCode (VD: KOT-015)
    String table,    // Trả về tên bàn
    String time,     // Giờ order (VD: 19:05)
    String status,   // Trạng thái TỔNG THỂ của cả Bill
    List<KitchenItem> items
) {
    public record KitchenItem(
        Long id,        // ID của chính OrderItem (Quan trọng để Bếp update)
        String name, 
        Integer qty, 
        String note, 
        List<String> options,
        String status   // <-- THÊM MỚI: Trạng thái của từng món lẻ (pending, cooking, ready)
    ) {}
}
