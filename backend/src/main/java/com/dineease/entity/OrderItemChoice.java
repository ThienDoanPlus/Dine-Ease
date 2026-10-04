package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item_choices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItemChoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Column(nullable = false)
    private String groupName; // Lưu cứng: "Size"

    @Column(nullable = false)
    private String choiceName; // Lưu cứng: "Size L"

    @Column(precision = 15, scale = 2)
    private BigDecimal additionalPrice; // Lưu cứng: 15000
}
