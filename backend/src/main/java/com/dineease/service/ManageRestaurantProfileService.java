package com.dineease.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dineease.entity.Amenity;
import com.dineease.entity.Restaurant;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.AmenityRepository;
import com.dineease.repository.RestaurantRepository;

@Service
@Transactional
public class ManageRestaurantProfileService {
    private final RestaurantRepository restaurantRepository;
    private final AmenityRepository amenityRepository;
    private final FileUploadService fileUploadService;

    public ManageRestaurantProfileService(RestaurantRepository restaurantRepository, AmenityRepository amenityRepository, FileUploadService fileUploadService) {
        this.restaurantRepository = restaurantRepository;
        this.amenityRepository = amenityRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional(readOnly = true)
    public Restaurant getMyProfile(String email) {
        return restaurantRepository.findByOwnerEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhà hàng"));
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getMyProfileSettings(String email) {
        Restaurant res = restaurantRepository.findByOwnerEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhà hàng"));

        // Truy cập amenities ngay tại đây để nạp dữ liệu (đang trong Transaction)
        List<Long> amenityIds = res.getAmenities().stream()
                .map(com.dineease.entity.Amenity::getId)
                .collect(Collectors.toList());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("name", res.getName());
        response.put("phone", res.getPhoneContact());
        response.put("address", res.getAddress());
        response.put("description", res.getDescription() != null ? res.getDescription() : "");
        response.put("logoUrl", res.getLogoUrl() != null ? res.getLogoUrl() : "");
        response.put("coverUrl", res.getImageMain() != null ? res.getImageMain() : "");
        response.put("depositAmount", res.getDepositAmount());
        response.put("maxPax", res.getMaxPax());
        response.put("operatingHours", res.getOperatingHours() != null ? res.getOperatingHours() : "[]");
        response.put("amenityIds", amenityIds);
        response.put("cuisineId", res.getCuisine() != null ? res.getCuisine().getId() : null);
        response.put("commissionRate", res.getCommissionRate());

        return response;
    }

    public void updateGeneralInfo(String email, String name, String phone, String address, String desc, List<Long> amenityIds) {
        Restaurant res = getMyProfile(email);
        res.setName(name);
        res.setPhoneContact(phone);
        res.setAddress(address);
        res.setDescription(desc);

        if (amenityIds != null) {
            List<Amenity> amenities = amenityRepository.findAllById(amenityIds);
            res.getAmenities().clear();
            res.getAmenities().addAll(amenities);
        }
        restaurantRepository.save(res);
    }

    public void updateBookingConfig(String email, BigDecimal depositAmount, Integer maxPax) {
        Restaurant res = getMyProfile(email);
        res.setDepositAmount(depositAmount);
        res.setMaxPax(maxPax);
        restaurantRepository.save(res);
    }

    public void updateOperatingHours(String email, String hoursJson) {
        Restaurant res = getMyProfile(email);
        res.setOperatingHours(hoursJson);
        restaurantRepository.save(res);
    }

    public String updateImages(String email, MultipartFile logo, MultipartFile cover) {
        Restaurant res = getMyProfile(email);
        
        if (logo != null && !logo.isEmpty()) {
            if (res.getLogoUrl() != null) fileUploadService.deleteFile(res.getLogoUrl());
            res.setLogoUrl(fileUploadService.uploadFile(logo));
        }
        if (cover != null && !cover.isEmpty()) {
            if (res.getImageMain() != null) fileUploadService.deleteFile(res.getImageMain());
            res.setImageMain(fileUploadService.uploadFile(cover));
        }
        restaurantRepository.save(res);
        return "Cập nhật ảnh thành công";
    }
}
