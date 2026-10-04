package com.dineease.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.RestaurantAdminResponse;
import com.dineease.dto.RestaurantStatusUpdateRequest;
import com.dineease.service.AdminRestaurantService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Admin - Restaurants", description = "Quản trị viên: Quản lý & Duyệt nhà hàng")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/admin/restaurants")
public class AdminRestaurantController {

    private final AdminRestaurantService adminRestaurantService;

    public AdminRestaurantController(AdminRestaurantService adminRestaurantService) {
        this.adminRestaurantService = adminRestaurantService;
    }

    @Operation(summary = "Lấy danh sách nhà hàng (Phân trang)")
    @GetMapping
    public ResponseEntity<Page<RestaurantAdminResponse>> getAllRestaurants(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<RestaurantAdminResponse> response = adminRestaurantService.getAllRestaurants(keyword, status, pageable);
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy chi tiết nhà hàng theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantAdminResponse> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(adminRestaurantService.getRestaurantById(id));
    }

    @Operation(summary = "Cập nhật trạng thái (Duyệt/Từ chối nhà hàng)", 
               description = "Nghiệp vụ: Nếu duyệt (status = APPROVED), hệ thống sẽ tự động nâng cấp quyền Chủ quán (Role.RESTAURANT), sinh mật khẩu mới và gửi Email thông báo.")
    @PatchMapping("/{id}/status")
    public ResponseEntity<RestaurantAdminResponse> updateRestaurantStatus(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantStatusUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        String adminEmail = userDetails.getUsername();
        // Gọi Service update trạng thái và thực hiện business logic
        RestaurantAdminResponse updated = adminRestaurantService.updateRestaurantStatus(id, request, adminEmail);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Admin cập nhật toàn diện hồ sơ nhà hàng", description = "Dùng Multipart để hỗ trợ upload ảnh bìa và file JSON")
    @PutMapping(value = "/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RestaurantAdminResponse> updateRestaurant(
            @PathVariable Long id,
            @RequestPart("data") com.dineease.dto.AdminUpdateRestaurantRequest request,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        
        return ResponseEntity.ok(adminRestaurantService.updateRestaurantProfile(id, request, image));
    }

    // ==========================================================
    // [BỔ SUNG API CÒN THIẾU]: GỌI EMAIL NHẮC ĐỐI TÁC
    // ==========================================================
    @Operation(summary = "Yêu cầu bổ sung hồ sơ", description = "Admin nhập lý do, hệ thống tự động bắn Email nhắc nhở cho chủ quán.")
    @PatchMapping("/{id}/request-update")
    public ResponseEntity<Void> requestPartnerUpdate(
            @PathVariable Long id,
            @Valid @RequestBody com.dineease.dto.RequestUpdateMessageRequest request) {
        
        // Gọi Service xử lý gửi mail
        adminRestaurantService.requestPartnerToUpdate(id, request.message());
        
        // Trả về 200 OK
        return ResponseEntity.ok().build();
    }
}