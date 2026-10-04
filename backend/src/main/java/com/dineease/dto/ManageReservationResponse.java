package com.dineease.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.dineease.entity.ReservationStatus;

public record ManageReservationResponse(
    Long id,
    String customerName,
    String customerPhone,
    String customerAvatar, // ĐÃ THÊM TỪ ĐOAN
    LocalDate reservationDate,
    LocalTime reservationTime,
    Integer guestCount,
    String notes,
    String cancelReason,   // ĐÃ THÊM: Truyền lý do hủy lên cho Chủ quán xem
    ReservationStatus status,
    String assignedTableName
) {}
