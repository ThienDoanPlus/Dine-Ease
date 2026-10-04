package com.dineease.entity;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 20)
    private PaymentType paymentType; // VD: DEPOSIT (Của Yến), FINAL_PAYMENT (Của Khoa)

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod; // CASH, MOMO, VNPAY

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // [CỦA YẾN]: Lưu mã GD từ VNPay trả về
    @Column(name = "transaction_code", length = 100)
    private String transactionCode; 
     
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ==========================================
    // [ĐẢM BẢO BẢO MẬT & TOÀN VẸN DỮ LIỆU]
    // ==========================================
    // 1. Payment cho tiền cọc đặt bàn (Của Yến)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Reservation reservation;
    
    // 2. Payment cho thu ngân quầy POS (Của Khoa)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Order order;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}