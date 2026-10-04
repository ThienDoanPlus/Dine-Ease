package com.dineease.dto;

import java.math.BigDecimal;
import java.util.List;

public record TableBillResponse(
    Long id,
    String orderCode,
    BigDecimal subTotal,
    BigDecimal surchargeAmount, // <--- THÊM MỚI
    String surchargeNote,       // <--- THÊM MỚI
    BigDecimal taxAmount,   
    BigDecimal totalAmount, 
    BigDecimal depositAmount, // <--- THÊM DÒNG NÀY ĐỂ CHỨA TIỀN CỌC
    BigDecimal discountAmount, // <--- THÊM MỚI
    String voucherCode,        // <--- THÊM MỚI
    List<String> tableGroupNames, // <--- THÊM MỚI: Danh sách tên các bàn gộp (VD: ["Bàn 1", "Bàn 2"])
    List<BillItem> items
) {
    public record BillItem(
        Long id,
        String name,
        Integer qty,
        BigDecimal price,
        String status // <--- THÊM TRẠNG THÁI MÓN
    ) {}
}
