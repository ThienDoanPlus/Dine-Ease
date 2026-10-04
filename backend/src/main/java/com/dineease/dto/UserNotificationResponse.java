package com.dineease.dto;

import java.time.Instant;
import com.dineease.entity.NotificationType;

public record UserNotificationResponse(
    Long id,
    String title,
    String content,
    Boolean isRead,
    NotificationType type,
    Instant createdAt
) {}
