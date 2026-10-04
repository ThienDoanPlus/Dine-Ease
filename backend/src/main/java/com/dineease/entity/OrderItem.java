package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    // [ÉP DÙNG BIGDECIMAL THEO CHUẨN CỦA BẠN]
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price; // Giá tại thời điểm gọi món (Tránh lạm phát đổi giá sau này)

    @Column(length = 255)
    private String note; // Ghi chú: "Ít cay", "Không hành"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderItemStatus status = OrderItemStatus.PENDING;

    // ==========================================
    // [VÁ LỖ HỔNG F&B]: THÊM MÃ KOT ĐỂ TÁCH PHIẾU BẾP
    // ==========================================
    @Column(name = "kot_code", length = 20)
    private String kotCode; // VD: KOT-123456

    @Column(name = "sent_at")
    private Instant sentAt; // Thời gian gửi lệnh xuống bếp
    // ==========================================

    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<OrderItemChoice> selectedChoices = new java.util.ArrayList<>();
}
