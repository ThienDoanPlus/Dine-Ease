package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_item_option_choices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItemOptionChoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // VD: "Trân châu đen", "Size L"

    @Column(name = "additional_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal additionalPrice = BigDecimal.ZERO; // Phụ thu tiền (VD: +10,000)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private MenuItemOptionGroup optionGroup;
}
