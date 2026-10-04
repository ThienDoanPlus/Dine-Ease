package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_item_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    // Quan hệ N-1: Nhiều hình ảnh thuộc về 1 món ăn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;
}
