package com.dineease.dto;
import java.math.BigDecimal;
import java.util.List;

//Hiển thị món ăn cho khách xem
public record MenuItemPublicResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    List<String> imageUrls, // Đã sửa
    Boolean isBestseller
) {}
