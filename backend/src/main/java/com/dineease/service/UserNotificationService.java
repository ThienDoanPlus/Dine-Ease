package com.dineease.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.dto.UserNotificationResponse;
import com.dineease.entity.UserNotification;
import com.dineease.repository.UserNotificationRepository;
import com.dineease.exception.ResourceNotFoundException;

@Service
public class UserNotificationService {

    private final UserNotificationRepository notificationRepository;

    public UserNotificationService(UserNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<UserNotificationResponse> getMyNotifications(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id, String email) {
        UserNotification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo không tồn tại"));
        
        if (!notif.getUser().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Không có quyền!");
        }

        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead(String email) {
        notificationRepository.markAllAsReadByUserEmail(email);
    }

    private UserNotificationResponse mapToResponse(UserNotification notif) {
        return new UserNotificationResponse(
            notif.getId(),
            notif.getTitle(),
            notif.getContent(),
            notif.getIsRead(),
            notif.getType(),
            notif.getCreatedAt()
        );
    }
}
