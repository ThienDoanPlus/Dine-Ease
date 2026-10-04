package com.dineease.service;

import java.time.Instant;
import com.dineease.entity.AuditLog;
import com.dineease.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import com.dineease.dto.NotificationRequest;
import com.dineease.dto.NotificationResponse;
import com.dineease.entity.CampaignStatus;
import com.dineease.entity.NotificationCampaign;
import com.dineease.entity.User;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.NotificationCampaignRepository;
import com.dineease.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationCampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationSchedulerTask schedulerTask;

    public NotificationService(NotificationCampaignRepository campaignRepository, 
                               UserRepository userRepository, 
                               AuditLogRepository auditLogRepository,
                               @Lazy NotificationSchedulerTask schedulerTask) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.schedulerTask = schedulerTask;
    }

    // Tạo chiến dịch mới
    @Transactional
    public NotificationResponse createCampaign(NotificationRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản Admin không tồn tại"));

        // Kiểm tra xem Admin có dặn gửi ngay không?
        boolean isSendNow = request.scheduledTime() == null || request.scheduledTime().isBefore(Instant.now().plusSeconds(60));
        
        // Nếu chọn lịch nhưng lịch đó ở trong quá khứ -> Văng lỗi (Bắt luôn cả trường hợp Bypass FE)
        if (request.scheduledTime() != null && request.scheduledTime().isBefore(Instant.now().minusSeconds(120))) {
            throw new IllegalArgumentException("Không thể lập lịch gửi cho thời điểm ở trong quá khứ!");
        }
        
        NotificationCampaign campaign = NotificationCampaign.builder()
                .title(request.title())
                .content(request.content())
                .targetAudience(request.targetAudience())
                .channel(request.channel())
                .scheduledTime(isSendNow ? Instant.now() : request.scheduledTime())
                .type(request.type()) // <--- LƯU TYPE
                .specificTargetEmail(request.specificTargetEmail()) // <--- LƯU EMAIL
                // FIX LỖI: Nếu gửi ngay -> Đổi thành PROCESSING để chống Cronjob bắt nhầm
                .status(isSendNow ? CampaignStatus.PROCESSING : CampaignStatus.SCHEDULED) 
                .admin(admin)
                .build();

        campaign = campaignRepository.save(campaign);

        // ==========================================================
        // VÁ LỖ HỔNG "GỬI CHẬM": KÍCH HOẠT CHẠY NGẦM NGAY LẬP TỨC
        // ==========================================================
        if (isSendNow) {
            schedulerTask.processCampaignImmediately(campaign);
        }

        return mapToResponse(campaign);
    }

    // Lấy danh sách chiến dịch
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllCampaigns(Pageable pageable) {
        return campaignRepository.findAll(pageable).map(this::mapToResponse);
    }

    // Hàm Helper (Mapping)
    private NotificationResponse mapToResponse(NotificationCampaign campaign) {
        return new NotificationResponse(
                campaign.getId(),
                campaign.getTitle(),
                campaign.getContent(),
                campaign.getTargetAudience(),
                campaign.getChannel(),
                campaign.getType(), // <--- TRẢ VỀ TYPE
                campaign.getStatus(),
                campaign.getScheduledTime(),
                campaign.getAdmin() != null ? campaign.getAdmin().getEmail() : null
        );
    }

    // ==========================================================
    // THÊM HÀM HỦY CHIẾN DỊCH
    // ==========================================================
    @Transactional
    public void cancelCampaign(Long id, String adminEmail) {
        NotificationCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch thông báo", id));

        // CHẶN: Nếu hệ thống đang gửi hoặc đã gửi xong thì không thể rút lại
        if (campaign.getStatus() != CampaignStatus.SCHEDULED) {
            throw new IllegalStateException("Không thể hủy! Chiến dịch này đã bắt đầu gửi hoặc đã hoàn tất.");
        }

        // Cập nhật trạng thái
        campaign.setStatus(CampaignStatus.CANCELED);
        campaignRepository.save(campaign);

        // Ghi Audit Log truy vết
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            AuditLog log = AuditLog.builder()
                    .time(Instant.now())
                    .adminEmail(admin.getEmail())
                    .adminName(admin.getFullName())
                    .action("Hủy khẩn cấp chiến dịch thông báo: " + campaign.getTitle())
                    .oldValue("SCHEDULED")
                    .newValue("CANCELED")
                    .build();
            auditLogRepository.save(log);
        }
    }
}