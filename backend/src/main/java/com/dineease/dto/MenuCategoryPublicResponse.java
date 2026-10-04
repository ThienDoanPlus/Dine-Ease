package com.dineease.dto;

import java.util.List;

//Gom nhóm món ăn theo danh mục: Khai vị, Tráng miệng...
public record MenuCategoryPublicResponse(
    Long categoryId,
    String categoryName,
    List<MenuItemPublicResponse> items
) {
}