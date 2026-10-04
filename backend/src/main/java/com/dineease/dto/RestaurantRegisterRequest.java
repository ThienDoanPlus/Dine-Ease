package com.dineease.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RestaurantRegisterRequest(
    @NotBlank(message = "Tên nhà hàng không được để trống")
    String restaurantName,
    
    @NotBlank(message = "Số điện thoại nhà hàng không được để trống")
    String phoneContact,
    
    @NotBlank(message = "Địa chỉ không được để trống")
    String address,
    
    String description,
    
    @NotBlank(message = "Họ tên người đại diện không được để trống")
    String ownerFullName,
    
    @NotBlank(message = "Email liên hệ không được để trống")
    @Email(message = "Email không hợp lệ")
    String ownerEmail
) {}
