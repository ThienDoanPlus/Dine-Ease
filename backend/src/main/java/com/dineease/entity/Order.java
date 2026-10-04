package com.dineease.entity;

import jakarta.persistence.*;
import jakarta.persistence.Version; // Thêm import này
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // THÊM DÒNG NÀY: Biến này để Hibernate theo dõi sự thay đổi (Chống Data Race)
    @Version
    private Long version;

    @Column(name = "order_code", unique = true, length = 20)
    private String orderCode; // VD: KOT-015 (Map trực tiếp ra Frontend)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id") // Nullable (dành cho mang đi - Takeaway sau này)
    private RestaurantTable table;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id") // Nullable (Khách vãng lai sẽ ko có)
    private Reservation reservation;

    // [ÉP DÙNG BIGDECIMAL THEO CHUẨN CỦA BẠN]
    @Column(name = "sub_total", precision = 15, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    // ==========================================
    // THÊM: CỘT LƯU PHỤ PHÍ (Surcharge)
    // ==========================================
    @Column(name = "surcharge_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal surchargeAmount = BigDecimal.ZERO;

    @Column(name = "surcharge_note", length = 255)
    private String surchargeNote; // VD: "Phí phòng VIP", "Phí mang rượu"

    // ==========================================
    // THÊM: CÁC TRƯỜNG GIẢM GIÁ (Discount/Voucher)
    // ==========================================
    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "discount_reason", length = 255)
    private String discountReason;

    // ==========================================================
    // [VÁ LỖ HỔNG THẤT THOÁT]: THÊM CỘT LƯU HOA HỒNG CHO ĐƠN POS
    // ==========================================================
    @Column(name = "commission_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.OPEN;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;

    // [BỔ SUNG VÁ LỖ HỔNG MỒ CÔI]: Map thêm danh sách Payment
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new java.util.ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (orderCode == null) {
            // Tự sinh mã KOT (Ví dụ: KOT-171402)
            orderCode = "KOT-" + (System.currentTimeMillis() % 1000000); 
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
