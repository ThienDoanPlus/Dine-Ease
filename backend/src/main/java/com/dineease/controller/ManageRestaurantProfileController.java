package com.dineease.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dineease.entity.Restaurant;
import com.dineease.service.ManageRestaurantProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Restaurant - Settings", description = "Chủ nhà hàng: Cấu hình thông tin, giờ mở cửa, tiện ích")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/manage/settings")
public class ManageRestaurantProfileController {
    
    private final ManageRestaurantProfileService profileService;

    public ManageRestaurantProfileController(ManageRestaurantProfileService profileService) {
        this.profileService = profileService;
    }

    @Operation(summary = "Lấy toàn bộ cấu hình hiện tại của quán")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(profileService.getMyProfileSettings(auth.getName()));
    }

    @Operation(summary = "Cập nhật Thông tin chung (Tên, SĐT, Tiện ích...)")
    @PutMapping("/info")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Void> updateInfo(@RequestBody Map<String, Object> req, Authentication auth) {
        List<Integer> amInts = (List<Integer>) req.get("amenityIds");
        List<Long> amenityIds = amInts != null ? amInts.stream().map(Integer::longValue).collect(Collectors.toList()) : null;
        
        profileService.updateGeneralInfo(auth.getName(), 
            (String) req.get("name"), (String) req.get("phone"), 
            (String) req.get("address"), (String) req.get("description"), amenityIds);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cập nhật Quy định đặt bàn (Tiền cọc, Max Pax)")
    @PutMapping("/booking-config")
    public ResponseEntity<Void> updateBookingConfig(@RequestBody Map<String, Object> req, Authentication auth) {
        BigDecimal deposit = new BigDecimal(req.get("depositAmount").toString());
        Integer maxPax = Integer.parseInt(req.get("maxPax").toString());
        profileService.updateBookingConfig(auth.getName(), deposit, maxPax);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cập nhật Giờ mở cửa")
    @PutMapping("/operating-hours")
    public ResponseEntity<Void> updateHours(@RequestBody Map<String, String> req, Authentication auth) {
        profileService.updateOperatingHours(auth.getName(), req.get("operatingHours"));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cập nhật Ảnh Logo và Cover")
    @PostMapping(value = "/images", consumes = {"multipart/form-data"})
    public ResponseEntity<Void> updateImages(
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            Authentication auth) {
        profileService.updateImages(auth.getName(), logo, cover);
        return ResponseEntity.ok().build();
    }
}
