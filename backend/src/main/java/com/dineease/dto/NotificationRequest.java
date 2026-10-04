package com.dineease.dto;

import java.time.Instant;
import com.dineease.entity.CampaignChannel;
import com.dineease.entity.CampaignTarget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

public record NotificationRequest(
    @NotBlank(message = "Tiêu đề không được để trống")
    String title,

    @NotBlank(message = "Nội dung không được để trống")
    String content,

    @NotNull(message = "Vui lòng chọn đối tượng nhận (ALL, CUSTOMER, RESTAURANT)")
    CampaignTarget targetAudience,

    @NotNull(message = "Vui lòng chọn kênh gửi (IN_APP, EMAIL)")
    CampaignChannel channel,

    @NotNull(message = "Vui lòng chọn loại thông báo")
    com.dineease.entity.NotificationType type,

    // [VÁ LỖ HỔNG]: Chặn API nhận ngày trong quá khứ
    @FutureOrPresent(message = "Lịch gửi thông báo phải nằm ở hiện tại hoặc tương lai!")
    Instant scheduledTime,

    String specificTargetEmail 
) {}