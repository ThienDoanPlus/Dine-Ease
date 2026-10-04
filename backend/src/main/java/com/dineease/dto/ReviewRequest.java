package com.dineease.dto;

import jakarta.validation.constraints.*;

public record ReviewRequest(
    @NotNull(message = "Mã đơn đặt bàn không được để trống")
    Long reservationId,

    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    Integer rating,

    @NotBlank(message = "Vui lòng nhập nội dung đánh giá")
    @Size(max = 1000, message = "Nội dung đánh giá không quá 1000 ký tự")
    String comment
) {}
