package com.dineease.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CuisineRequest(
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 2, max = 50, message = "Tên danh mục phải từ 2 đến 50 ký tự để đảm bảo giao diện")
    @Pattern(regexp = "^[\\p{L}0-9\\s\\-]+$", message = "Tên danh mục không được chứa ký tự đặc biệt")
    String name,
    
    @NotBlank(message = "Biểu tượng (Icon) không được để trống")
    @Size(max = 10, message = "Icon không hợp lệ (Quá dài)")
    String iconUrl
){}