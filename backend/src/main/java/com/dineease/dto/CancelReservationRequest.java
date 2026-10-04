package com.dineease.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelReservationRequest(
    @NotBlank(message = "Vui lòng cung cấp lý do hủy đặt bàn")
    String cancelReason
) {
}