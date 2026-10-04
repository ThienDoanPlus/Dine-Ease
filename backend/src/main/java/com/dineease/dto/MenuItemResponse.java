package com.dineease.dto;
import java.math.BigDecimal;
import java.util.List;
import com.dineease.entity.MenuItemStatus;

public record MenuItemResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    List<String> imageUrls, // Đã sửa
    Boolean isBestseller,
    MenuItemStatus status,
    String categoryName 
) {}