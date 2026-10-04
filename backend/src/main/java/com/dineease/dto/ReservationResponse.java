package com.dineease.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDate;
import com.dineease.entity.ReservationStatus;

public record ReservationResponse(
    Long id,
    Long restaurantId,
    String restaurantName,
    LocalDate reservationDate,
    LocalTime reservationTime,
    Integer guestCount,
    String notes,
    String cancelReason,
    BigDecimal depositAmount,
    ReservationStatus status,
    
    // [VÁ LỖ HỔNG UX]: Báo cho Frontend biết đơn này đã đánh giá chưa
    Boolean isReviewed 
) {}
