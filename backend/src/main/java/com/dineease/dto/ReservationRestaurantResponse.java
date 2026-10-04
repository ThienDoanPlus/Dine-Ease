package com.dineease.dto;
import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalTime;
import com.dineease.entity.ReservationStatus;
public record ReservationRestaurantResponse(
    Long id,
    String customerName, 
    String customerPhone,
    LocalDate reservationDate,
    LocalTime reservationTime,
    Integer guestCount,
    String notes,
    BigDecimal depositAmount,
    ReservationStatus status
) {}
