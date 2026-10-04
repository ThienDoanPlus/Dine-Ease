package com.dineease.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.entity.CampaignChannel;
import com.dineease.entity.CampaignStatus;
import com.dineease.entity.NotificationCampaign;
import com.dineease.entity.Role;
import com.dineease.entity.User;
import com.dineease.entity.UserNotification;
import com.dineease.repository.NotificationCampaignRepository;
import com.dineease.repository.UserNotificationRepository;
import com.dineease.repository.UserRepository;

@Component
public class NotificationSchedulerTask {
    private static final Logger log = LoggerFactory.getLogger(NotificationSchedulerTask.class);
    
    private final NotificationCampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final EmailService emailService;

    public NotificationSchedulerTask(NotificationCampaignRepository campaignRepository, 
                                     UserRepository userRepository, 
                                     UserNotificationRepository userNotificationRepository,
                                     EmailService emailService) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.userNotificationRepository = userNotificationRepository;
        this.emailService = emailService;
    }

    // ==========================================================
    // 1. LUỒNG 1: DÀNH CHO CRONJOB QUÉT (HẸN GIỜ)
    // ==========================================================
    @Scheduled(cron = "0 * * * * *")
    public void processDueCampaigns() {
        Instant now = Instant.now();
        List<NotificationCampaign> dueCampaigns = campaignRepository.findDueCampaigns(now);

        if (dueCampaigns.isEmpty()) return;

        log.info("⏰ [CRONJOB] Bắt đầu quét và xử lý {} chiến dịch đã đến giờ hẹn...", dueCampaigns.size());

        for (NotificationCampaign campaign : dueCampaigns) {
            updateStatus(campaign, CampaignStatus.PROCESSING);
            executeCampaignLogic(campaign);
        }
    }

    // ==========================================================
    // 2. LUỒNG 2: DÀNH CHO ADMIN BẤM "GỬI NGAY" (Bắn luồng riêng tức thì)
    // ==========================================================
    @Async // Rẽ nhánh chạy ngầm, không làm treo giao diện Admin
    public void processCampaignImmediately(NotificationCampaign campaign) {
        log.info("🚀 [IMMEDIATE] Kích hoạt gửi NGAY LẬP TỨC chiến dịch: {}", campaign.getTitle());
        executeCampaignLogic(campaign);
    }

    // ==========================================================
    // LÕI XỬ LÝ CHUNG (Dùng chung cho cả 2 luồng)
    // ==========================================================
    private void executeCampaignLogic(NotificationCampaign campaign) {
        try {
            List<User> targetUsers = getTargetUsers(campaign);

            if (targetUsers != null && !targetUsers.isEmpty()) {
                
                if (campaign.getChannel() == CampaignChannel.EMAIL) {
                    for (User user : targetUsers) {
                        emailService.sendNotificationEmail(user.getEmail(), campaign.getTitle(), campaign.getContent());
                    }
                } 
                else if (campaign.getChannel() == CampaignChannel.IN_APP) {
                    List<UserNotification> inAppNotifications = new ArrayList<>();
                    
                    for (User user : targetUsers) {
                        UserNotification notif = UserNotification.builder()
                                .title(campaign.getTitle())
                                .content(campaign.getContent())
                                .type(campaign.getType()) // <--- COPY TYPE SANG BẢNG USER
                                .isRead(false)
                                .user(user)
                                .campaign(campaign)
                                .build();
                        inAppNotifications.add(notif);
                    }
                    
                    userNotificationRepository.saveAll(inAppNotifications);
                    log.info("Đã INSERT thành công {} thông báo In-App vào DB.", inAppNotifications.size());
                }
            }
            
            updateStatus(campaign, CampaignStatus.SENT);
            log.info("✅ Đã hoàn tất gửi chiến dịch ID: {}", campaign.getId());

        } catch (Exception e) {
            log.error("❌ Lỗi khi thực thi chiến dịch {}: {}", campaign.getId(), e.getMessage());
            updateStatus(campaign, CampaignStatus.FAILED);
        }
    }

    @Transactional
    public void updateStatus(NotificationCampaign campaign, CampaignStatus status) {
        campaign.setStatus(status);
        campaignRepository.saveAndFlush(campaign);
    }

    private List<User> getTargetUsers(NotificationCampaign campaign) {
        return switch (campaign.getTargetAudience()) {
            case CUSTOMER -> userRepository.findUsersByRole(Role.CUSTOMER);
            case RESTAURANT -> userRepository.findUsersByRole(Role.RESTAURANT);
            case SPECIFIC_USER -> {
                // Lấy 1 user duy nhất theo email
                User user = userRepository.findByEmail(campaign.getSpecificTargetEmail()).orElse(null);
                yield (user != null) ? List.of(user) : List.of();
            }
            default -> userRepository.findAllActiveUsers();
        };
    }
}
