package com.dineease.dto;

import java.math.BigDecimal;
import com.dineease.entity.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateManageReservationStatusRequest(
    @NotNull(message = "Trạng thái không được để trống")
    ReservationStatus status,
    
    // Chỉ bắt buộc khi status = CHECKED_IN
    Long tableId,
    
    // ĐÃ THÊM: Bắt buộc khi status = COMPLETE (Hoàn tất thanh toán)
    @PositiveOrZero(message = "Tổng tiền hóa đơn không được là số âm")
    BigDecimal finalTotalAmount
) {}