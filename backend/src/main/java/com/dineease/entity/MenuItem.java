package com.dineease.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    // THÊM MỚI: Danh sách hình ảnh
    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<MenuItemImage> images = new java.util.ArrayList<>();

    @Column(name = "is_bestseller")
    @Builder.Default
    private Boolean isBestseller = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MenuItemStatus status = MenuItemStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private MenuCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "created_at", updatable = false)
    private java.time.Instant createdAt;

    @Column(name = "updated_at")
    private java.time.Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.Instant.now();
        updatedAt = java.time.Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.Instant.now();
    }

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<MenuItemOptionGroup> optionGroups = new java.util.ArrayList<>();
}