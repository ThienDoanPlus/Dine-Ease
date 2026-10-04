package com.dineease.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

//Khách điền Form đặt bàn gửi lên
public record ReservationRequest(
    @NotNull(message = "Vui lòng chọn nhà hàng")
    Long restaurantId,

    @NotNull(message = "Ngày đăt bàn không được để trống")
    @FutureOrPresent(message = "Ngày đặt bàn phải là ngày hôm nay hoặc trong tương lai")
    LocalDate reservationDate,

    @NotNull(message = "Giờ đặt bàn không được để trống")
    LocalTime reservationTime,

    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải lớn hơn hoặc bằng 1")
    Integer guestCount,


    String notes
) {}
