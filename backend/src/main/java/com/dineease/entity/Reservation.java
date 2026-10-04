package com.dineease.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "reservations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;

    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    @Column(columnDefinition = "TEXT")
    private String notes; 

    @Column(name = "cancel_reason")
    private String cancelReason;

    // Tiền cọc (Lấy từ Yến)
    @Column(name = "deposit_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    // [CỦA KHOA]: Tiền thực tế thanh toán + Hoa hồng
    @Column(name = "final_total_amount", precision = 15, scale = 2)
    private BigDecimal finalTotalAmount;

    @Column(name = "commission_amount", precision = 15, scale = 2)
    private BigDecimal commissionAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    // ==========================================
    // [GIẢI QUYẾT XUNG ĐỘT KHOA & YẾN]
    // ==========================================
    // Khách hàng App (Tích điểm của Yến)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id") // BẮT BUỘC ĐỂ NULLABLE = TRUE CHO POS CỦA KHOA CHẠY
    private CustomerProfile customer;
    
    // Khách vãng lai POS (Của Khoa)
    @Column(name = "walk_in_customer_name", length = 100)
    private String walkInCustomerName;

    @Column(name = "walk_in_customer_phone", length = 15)
    private String walkInCustomerPhone;

    // Bàn được xếp (Của Khoa)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_table_id")
    private RestaurantTable assignedTable;

    // ==========================================
    // [TÍCH HỢP]: DANH SÁCH LIÊN KẾT
    // ==========================================
    // [CỦA YẾN]: Lịch sử các lần nạp/rút tiền liên quan đến Đơn này
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    // Đánh giá 1-1
    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Review review;

    @Column(name = "created_at", updatable = false)
    private java.time.Instant createdAt;

    @Column(name = "updated_at")
    private java.time.Instant updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = java.time.Instant.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = java.time.Instant.now(); }
}