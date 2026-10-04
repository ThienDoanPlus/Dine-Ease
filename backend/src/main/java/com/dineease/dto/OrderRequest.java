package com.dineease.dto;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record OrderRequest(
    Long tableId,
    
    @NotEmpty(message = "Giỏ hàng không được để trống")
    @Valid
    List<OrderItemRequest> items
) {}

