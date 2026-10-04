package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName; 

    @Column(nullable = false)
    private Integer capacity; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TableStatus status = TableStatus.AVAILABLE;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    // ==========================================
    // [TỪ CODE CỦA ĐOAN]: CÁC TRƯỜNG DÀNH CHO SƠ ĐỒ BÀN (DRAG & DROP)
    // ==========================================
    @Column(name = "pos_x")
    private Double x;

    @Column(name = "pos_y")
    private Double y;

    @Column(name = "width")
    private Double width;

    @Column(name = "height")
    private Double height;  

    @Column(name = "shape")
    private String shape;

    @Column(name = "rotation")
    private Double rotation;

    @Column(name = "floor_name")
    private String floorName;

    @Column(name = "merged_id")
    private Long mergedId;
}