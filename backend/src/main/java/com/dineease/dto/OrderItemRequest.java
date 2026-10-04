package com.dineease.dto;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
    @NotNull(message = "Mã món ăn không được để trống")
    Long menuItemId,

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng món ăn phải từ 1 trở lên")
    Integer quantity,

    String note,
    List<Long> selectedChoiceIds
) {}

