package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // [CỦA YẾN]: Điểm tích lũy hạng thành viên
    @Column(name = "loyalty_points")
    @Builder.Default
    private Integer loyaltyPoints = 0; 

    // [CỦA YẾN]: Tổng số lần đặt bàn
    @Column(name = "total_bookings")
    @Builder.Default
    private Integer totalBookings = 0; 

    // Khóa ngoại trỏ về bảng User (Mỗi User KH chỉ có 1 Profile)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;
}