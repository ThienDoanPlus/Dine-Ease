package com.dineease.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TableRequest(
    String id, 
    
    @NotBlank(message = "Tên/Ký hiệu bàn không được để trống")
    String tableName,
    
    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
    Integer capacity, 
    
    // [TỪ CODE CỦA ĐOAN]: Các trường Canvas đồ họa
    Double x, 
    Double y, 
    Double width, 
    Double height, 
    String shape, 
    Double rotation, 
    String floorName,
    Long mergedId,
    
    // [VÁ LỖ HỔNG MẤT DATA STATUS]: Nhận status từ FE gửi lên
    String status
) {}