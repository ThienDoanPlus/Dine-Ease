package com.dineease.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.dto.CuisineRequest;
import com.dineease.dto.CuisineResponse;
import com.dineease.entity.Cuisine;
import com.dineease.exception.DuplicateResourceException;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.CuisineRepository;
import com.dineease.entity.AuditLog;
import com.dineease.entity.User;
import com.dineease.repository.AuditLogRepository;
import com.dineease.repository.UserRepository;
import java.time.Instant;

@Service
public class CuisineService {

    private final CuisineRepository cuisineRepository;
    private final com.dineease.repository.RestaurantRepository restaurantRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public CuisineService(CuisineRepository cuisineRepository, 
                          com.dineease.repository.RestaurantRepository restaurantRepository,
                          AuditLogRepository auditLogRepository, 
                          UserRepository userRepository) {
        this.cuisineRepository = cuisineRepository;
        this.restaurantRepository = restaurantRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CuisineResponse> getAllCuisines() {
        return cuisineRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CuisineResponse getCuisineById(Long id) {
        Cuisine cuisine = cuisineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục ẩm thực", id));
        return toResponse(cuisine);
    }

    @Transactional
    public CuisineResponse createCuisine(CuisineRequest request, String adminEmail) {
        // Chuẩn hóa dữ liệu: Xóa khoảng trắng thừa ở đầu/cuối
        String cleanName = request.name().trim();
        String cleanIcon = request.iconUrl().trim();

        if (cuisineRepository.existsByNameIgnoreCase(cleanName)) {
            throw new DuplicateResourceException("Tên danh mục ẩm thực đã tồn tại: " + cleanName);
        }

        Cuisine cuisine = Cuisine.builder()
                .name(cleanName)
                .iconUrl(cleanIcon)
                .build();

        cuisine = cuisineRepository.save(cuisine);

        // Ghi Log
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            auditLogRepository.save(AuditLog.builder()
                    .time(Instant.now())
                    .adminEmail(admin.getEmail())
                    .adminName(admin.getFullName())
                    .action("Thêm Danh mục mới")
                    .oldValue("N/A")
                    .newValue(cleanName)
                    .build());
        }

        return toResponse(cuisine);
    }

    @Transactional
    public CuisineResponse updateCuisine(Long id, CuisineRequest request, String adminEmail) {
        Cuisine cuisine = cuisineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục ẩm thực", id));

        String oldName = cuisine.getName();

        // Chuẩn hóa dữ liệu
        String cleanName = request.name().trim();
        String cleanIcon = request.iconUrl().trim();

        if (cuisineRepository.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new DuplicateResourceException("Tên danh mục ẩm thực đã tồn tại: " + cleanName);
        }

        cuisine.setName(cleanName);
        cuisine.setIconUrl(cleanIcon);

        cuisine = cuisineRepository.save(cuisine);

        // Ghi Log
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            auditLogRepository.save(AuditLog.builder()
                    .time(Instant.now())
                    .adminEmail(admin.getEmail())
                    .adminName(admin.getFullName())
                    .action("Sửa tên Danh mục ID #" + id)
                    .oldValue(oldName)
                    .newValue(cleanName)
                    .build());
        }

        return toResponse(cuisine);
    }

    @Transactional
    public void deleteCuisine(Long id, String adminEmail) {
        Cuisine cuisine = cuisineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục ẩm thực", id));
        
        String oldName = cuisine.getName();

        // ==========================================================
        // [VÁ LỖ HỔNG HARD DELETE]: KIỂM TRA TRƯỚC KHI XÓA
        // ==========================================================
        if (restaurantRepository.existsByCuisineId(id)) {
            throw new IllegalStateException("Không thể xóa! Đang có nhà hàng sử dụng danh mục ẩm thực này. Hãy đổi danh mục cho nhà hàng trước khi xóa.");
        }
        
        cuisineRepository.delete(cuisine);

        // Ghi Log
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            auditLogRepository.save(AuditLog.builder()
                    .time(Instant.now())
                    .adminEmail(admin.getEmail())
                    .adminName(admin.getFullName())
                    .action("Xóa Danh mục")
                    .oldValue(oldName)
                    .newValue("Đã Xóa")
                    .build());
        }
    }

    // Mapper thủ công (Vì Entity này nhỏ nên không cần tạo class Mapper riêng)
    private CuisineResponse toResponse(Cuisine cuisine) {
        return new CuisineResponse(cuisine.getId(), cuisine.getName(), cuisine.getIconUrl());
    }
}