package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "restaurants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "phone_contact", nullable = false, length = 15)
    private String phoneContact;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("15.0");

    @Column(name = "avg_rating")
    private Double avgRating;

    @Column(name = "image_main", length = 500)
    private String imageMain;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "deposit_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = new BigDecimal("100000");

    @Column(name = "max_pax")
    @Builder.Default
    private Integer maxPax = 20;

    @Lob
    @Column(name = "operating_hours", columnDefinition = "LONGTEXT")
    private String operatingHours;

    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: PHỤC VỤ PUBLIC DISCOVERY
    // ==========================================
    @Column(name = "avg_price", precision = 10, scale = 2)
    private BigDecimal avgPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuisine_id")
    private Cuisine cuisine;

    @ManyToMany
    @JoinTable(
        name = "restaurant_amenities",
        joinColumns = @JoinColumn(name = "restaurant_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    @Builder.Default
    private Set<Amenity> amenities = new HashSet<>();

    // ==========================================
    // [CỦA KHOA]: TRẠNG THÁI VÀ CHỦ SỞ HỮU
    // ==========================================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RestaurantStatus status = RestaurantStatus.PENDING;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", referencedColumnName = "id", nullable = false)
    private User owner;

    // ==========================================
    // [CỦA KHOA]: CÁC MODULE QUẢN LÝ NHÀ HÀNG NÂNG CAO
    // ==========================================
    @Lob
    @Column(name = "architectural_data", columnDefinition = "LONGTEXT")
    private String architecturalData;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RestaurantTable> tables = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MenuCategory> categories = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MenuItem> menuItems = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RestaurantImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LegalDocument> legalDocuments = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private java.time.Instant createdAt;

    @Column(name = "updated_at")
    private java.time.Instant updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = java.time.Instant.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = java.time.Instant.now(); }
}