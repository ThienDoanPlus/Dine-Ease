package com.dineease.service;

import org.springframework.stereotype.Component;
import com.dineease.dto.UserResponse;
import com.dineease.entity.User;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        // ==========================================
        // [CỦA YẾN]: LẤY ĐIỂM TỪ PROFILE 
        // ==========================================
        Integer points = 0;
        if (user.getCustomerProfile() != null && user.getCustomerProfile().getLoyaltyPoints() != null) {
            points = user.getCustomerProfile().getLoyaltyPoints();
        }

        // ==========================================
        // [CỦA KHOA]: LẤY TRẠNG THÁI NHÀ HÀNG
        // ==========================================
        String resStatus = null;
        if (user.getRestaurant() != null && user.getRestaurant().getStatus() != null) {
            resStatus = user.getRestaurant().getStatus().name();
        }

        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            user.getAvatarUrl(),
            user.getRoles(),
            user.getStatus(),
            user.getCreatedAt(),
            points,                  // Truyền điểm vào DTO
            calculateRank(points),   // Tính hạng và truyền vào DTO
            resStatus                // Truyền trạng thái nhà hàng
        );
    }

    // ==========================================
    // [CỦA YẾN]: LOGIC PHÂN HẠNG THÀNH VIÊN
    // ==========================================
    private String calculateRank(int points) {
        if (points >= 2000) return "VVIP Member";
        if (points >= 1000) return "Gold Member";
        if (points >= 500)  return "Silver Member";
        return "Member";
    }
}