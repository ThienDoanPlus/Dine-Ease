package com.dineease.dto;

import java.math.BigDecimal;

public record TransactionHistoryResponse(
    String id,        // Mã KOT
    String method,    // VNPay, Cash...
    String type,      // Dùng để render icon (card, momo, cash)
    String time,      // Giờ thanh toán
    String items,     // Tóm tắt tên món
    BigDecimal amount,
    String status
) {}
