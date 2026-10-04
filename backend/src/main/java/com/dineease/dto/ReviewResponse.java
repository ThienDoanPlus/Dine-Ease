package com.dineease.dto;

import java.time.Instant;

public record ReviewResponse(
    Long id,
    String customerName,
    String customerAvatar,
    Integer rating,
    String comment,
    String replyFromRestaurant,
    Instant createdAt
) {}
