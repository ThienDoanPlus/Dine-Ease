package com.dineease.dto;

import java.math.BigDecimal;

// DTO dùng cho List quán trên trang chủ
public record RestaurantPublicResponse (
    Long id,
    String name,
    String address,
    String imageMain,
    Double avgRating,
    
    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: GIÁ VÀ ẨM THỰC
    // ==========================================
    BigDecimal avgPrice,  
    String cuisineName    
) {}
