package com.dineease.dto;

import java.time.Instant;
import java.util.Set;
import com.dineease.entity.Role;

public record UserResponse(
    Long id,
    String email,
    String fullName,
    String phone,
    String avatarUrl,
    Set<Role> roles,
    String status,
    Instant createdAt,
    
    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: ĐIỂM VÀ HẠNG THÀNH VIÊN
    // ==========================================
    Integer loyaltyPoints, 
    String memberRank,

    // ==========================================
    // [CỦA KHOA]: BẢO MẬT & ĐIỀU HƯỚNG ROUTE
    // ==========================================
    // Dành cho Chủ quán: Frontend đọc biến này để cấm vào Dashboard nếu chưa duyệt
    String restaurantStatus 
){}