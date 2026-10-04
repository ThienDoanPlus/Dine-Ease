package com.dineease.dto;

import com.dineease.entity.MenuItemStatus;
import jakarta.validation.constraints.NotNull;

public record MenuItemStatusUpdateRequest(
    @NotNull(message = "Trạng thái không được để trống")
    MenuItemStatus status
) {}
