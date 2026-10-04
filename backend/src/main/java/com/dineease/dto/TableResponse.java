package com.dineease.dto;

import com.dineease.entity.TableStatus;

public record TableResponse(
    Long id,
    String tableName,
    Integer capacity,
    TableStatus status,
    
    // [TỪ CODE CỦA ĐOAN]: Các trường Canvas đồ họa
    Double x, 
    Double y, 
    Double width, 
    Double height, 
    String shape, 
    Double rotation, 
    String floorName,
    Long mergedId // <--- THÊM DÒNG NÀY ĐỂ TRẢ VỀ TRẠNG THÁI GỘP BÀN
) {}