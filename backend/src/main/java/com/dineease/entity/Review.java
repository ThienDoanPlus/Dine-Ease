package com.dineease.entity;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer rating; // 1 đến 5 sao

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "reply_from_restaurant", columnDefinition = "TEXT")
    private String replyFromRestaurant;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Đánh giá cho Đơn đặt bàn nào? (1-1)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Reservation reservation;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}