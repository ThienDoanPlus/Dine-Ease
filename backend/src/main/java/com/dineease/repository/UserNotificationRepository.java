package com.dineease.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dineease.entity.UserNotification;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    
    // Lấy danh sách thông báo của 1 user (sắp xếp mới nhất lên đầu)
    List<UserNotification> findByUserEmailOrderByCreatedAtDesc(String email);

    // Đánh dấu đã đọc tất cả thông báo của 1 user
    @Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE UserNotification n SET n.isRead = true WHERE n.user.email = :email")
    void markAllAsReadByUserEmail(@Param("email") String email);
}
