package com.dineease.entity;

public enum PaymentMethod {
    CASH, 
    MOMO, 
    VNPAY, 
    CARD,       // Bổ sung Quẹt thẻ
    QR_CODE,    // Bổ sung Quét QR chuyển khoản
    VOUCHER     // Bổ sung cho trường hợp Hóa đơn 0 đồng
}

