package com.dineease.dto;

import java.time.Instant;
import com.dineease.entity.CampaignChannel;
import com.dineease.entity.CampaignStatus;
import com.dineease.entity.CampaignTarget;

public record NotificationResponse(
    Long id,
    String title,
    String content,
    CampaignTarget targetAudience,
    CampaignChannel channel,
    com.dineease.entity.NotificationType type,
    CampaignStatus status,
    Instant scheduledTime,
    String adminEmail // Người tạo chiến dịch
) {}