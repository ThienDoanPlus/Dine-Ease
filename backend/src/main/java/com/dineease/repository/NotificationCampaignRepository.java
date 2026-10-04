package com.dineease.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.dineease.entity.NotificationCampaign;

public interface NotificationCampaignRepository extends JpaRepository<NotificationCampaign, Long> {
    
    // Lấy các chiến dịch đã đến giờ gửi
    @Query("SELECT c FROM NotificationCampaign c WHERE c.status = 'SCHEDULED' AND c.scheduledTime <= :now")
    List<NotificationCampaign> findDueCampaigns(@Param("now") Instant now);
}