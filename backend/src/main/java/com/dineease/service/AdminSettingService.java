package com.dineease.service;

import com.dineease.dto.AuditLogResponse;
import com.dineease.dto.UpdateCommissionRequest;
import com.dineease.entity.AuditLog;
import com.dineease.entity.GlobalSetting;
import com.dineease.entity.User;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.AuditLogRepository;
import com.dineease.repository.GlobalSettingRepository;
import com.dineease.repository.UserRepository;
import com.dineease.repository.RestaurantRepository;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AdminSettingService {

    private final GlobalSettingRepository settingRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public AdminSettingService(GlobalSettingRepository settingRepository, 
                               AuditLogRepository auditLogRepository, 
                               UserRepository userRepository,
                               RestaurantRepository restaurantRepository) {
        this.settingRepository = settingRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional(readOnly = true)
    public String getCommission() {
        return settingRepository.findById("DEFAULT_COMMISSION")
                .map(GlobalSetting::getSettingValue)
                .orElse("15.0"); // Mặc định nếu DB trống
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Instant start, Instant end, Pageable pageable) {
        return auditLogRepository.findByTimeBetween(start, end, pageable).map(log -> new AuditLogResponse(
                log.getId(),
                log.getTime(),
                new AuditLogResponse.ActorDto(log.getAdminName(), "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"), // Fake avatar
                log.getAction(),
                log.getOldValue(),
                log.getNewValue(),
                log.getReason()
        ));
    }

    @Transactional
    public void updateCommission(UpdateCommissionRequest request, String adminEmail) {
        // 1. Lấy thông tin Admin đang thao tác
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin không tồn tại"));

        // 2. Lấy giá trị cũ
        String oldValue = getCommission();

        // 3. Cập nhật giá trị mới
        GlobalSetting setting = settingRepository.findById("DEFAULT_COMMISSION").orElse(
                GlobalSetting.builder().settingKey("DEFAULT_COMMISSION").description("Mức hoa hồng mặc định").build()
        );
        setting.setSettingValue(request.newCommissionRate());
        settingRepository.save(setting);

        // ==========================================================
        // [LOGIC MỚI]: ÁP DỤNG HỒI TỐ NẾU ADMIN ĐỒNG Ý
        // ==========================================================
        String actionDescription = "Cập nhật mức chiết khấu hệ thống";
        if (Boolean.TRUE.equals(request.applyToExisting())) {
            try {
                BigDecimal newRate = new BigDecimal(request.newCommissionRate());
                int updatedCount = restaurantRepository.bulkUpdateCommissionRate(newRate);
                actionDescription += " (Áp dụng cho " + updatedCount + " đối tác bao gồm cả các quán đang tạm ngưng)";
            } catch (Exception e) {
                throw new IllegalArgumentException("Mức hoa hồng không hợp lệ");
            }
        }

        // 4. Ghi lại lịch sử Audit Log
        AuditLog log = AuditLog.builder()
                .time(Instant.now())
                .adminEmail(admin.getEmail())
                .adminName(admin.getFullName())
                .action(actionDescription)
                .oldValue(oldValue + "%")
                .newValue(request.newCommissionRate() + "%")
                .reason(request.reason())
                .build();
        auditLogRepository.save(log);
    }
}
