package com.dineease.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dineease.dto.MenuCategoryPublicResponse;
import com.dineease.dto.RestaurantPublicResponse;
import com.dineease.service.FileUploadService;
import com.dineease.service.PublicDiscoveryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Public - Discovery", description = "Khách hàng khám phá nhà hàng và thực đơn mà không cần đăng nhập")
@RestController
@RequestMapping("/api/v1/public")
public class PublicDiscoveryController {

    private final PublicDiscoveryService discoveryService;
    private final FileUploadService fileUploadService;

    public PublicDiscoveryController(PublicDiscoveryService discoveryService, FileUploadService fileUploadService) {
        this.discoveryService = discoveryService;
        this.fileUploadService = fileUploadService;
    }

    @Operation(summary = "Lấy toàn bộ danh sách loại hình ẩm thực")
    @GetMapping("/cuisines")
    public ResponseEntity<List<com.dineease.entity.Cuisine>> getAllCuisines() {
        return ResponseEntity.ok(discoveryService.getAllCuisines());
    }

    @Operation(summary = "Lấy toàn bộ danh sách tiện ích")
    @GetMapping("/amenities")
    public ResponseEntity<List<com.dineease.entity.Amenity>> getAllAmenities() {
        return ResponseEntity.ok(discoveryService.getAllAmenities());
    }

    // ==========================================================
    // [TÍCH HỢP YẾN & KHOA]: BỘ LỌC TÌM KIẾM KHỔNG LỒ
    // ==========================================================
    @Operation(summary = "Lấy danh sách nhà hàng (Tìm kiếm & Lọc nâng cao)")
    @GetMapping("/restaurants") 
    public ResponseEntity<Page<RestaurantPublicResponse>> getRestaurants(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Double minRating,
        @RequestParam(required = false) BigDecimal maxPrice,     // [CỦA YẾN]
        @RequestParam(required = false) List<Long> cuisineIds,   // [CỦA YẾN]
        @RequestParam(required = false) List<Long> amenityIds,   // [CỦA YẾN]
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        // [CỦA KHOA]: Ưu tiên rate cao, sau đó ưu tiên quán mới thêm (ID giảm dần)
        Pageable pageable = PageRequest.of(page, size, Sort.by("avgRating").descending().and(Sort.by("id").descending()));
        
        Page<RestaurantPublicResponse> restaurants = discoveryService.searchRestaurants(
            keyword, minRating, maxPrice, cuisineIds, amenityIds, pageable
        );
        return ResponseEntity.ok(restaurants);
    }
    
    // [CỦA KHOA]: Menu hỗ trợ nhiều ảnh
    @Operation(summary = "Lấy thực đơn của nhà hàng cụ thể")
    @GetMapping("/restaurants/{id}/menu")
    public ResponseEntity<List<MenuCategoryPublicResponse>> getRestaurantMenu(@PathVariable Long id) {
        return ResponseEntity.ok(discoveryService.getRestaurantMenu(id));
    }

    // [CỦA YẾN]: Dùng Regex để tránh API bị trùng lặp đường dẫn
    @Operation(summary = "Lấy chi tiết một nhà hàng (Public)")
    @GetMapping("/restaurants/{id:[0-9]+}") 
    public ResponseEntity<com.dineease.dto.RestaurantDetailPublicResponse> getRestaurantDetail(@PathVariable Long id) {
        return ResponseEntity.ok(discoveryService.getRestaurantDetail(id));
    }

    // ==========================================================
    // [VÁ LỖ HỔNG SPAM CLOUDINARY]: RÀO CHẶN QUYỀN VÀ ĐỊNH DẠNG FILE
    // ==========================================================
    @Operation(summary = "Upload ảnh tĩnh (Hỗ trợ Rich Text Editor)", description = "Chỉ cho phép Quản trị viên và Chủ nhà hàng upload ảnh (Chống Spam).")
    @SecurityRequirement(name = "bearerAuth") 
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        
        // 1. Kiểm tra xác thực (Đã đăng nhập chưa)
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Hành động bị từ chối: Vui lòng đăng nhập!");
        }

        // 2. Kiểm tra phân quyền (Authorization): Bắt buộc phải là ADMIN hoặc RESTAURANT
        boolean isAuthorized = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RESTAURANT"));
            
        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Hành động bị từ chối: Chỉ Quản trị viên hoặc Đối tác mới được phép tải tài nguyên lên máy chủ!");
        }

        // 3. Kiểm tra tính hợp lệ của File (Chống File Rỗng)
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File tải lên không được để trống!");
        }

        // 4. Kiểm tra Định dạng File (Chống Malware, Script .exe, .sh, .pdf...)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Định dạng không hợp lệ: Hệ thống chỉ chấp nhận hình ảnh (JPG, PNG, WEBP...)!");
        }

        // 5. Nếu vượt qua mọi bài test -> Cho phép upload lên Cloudinary
        String url = fileUploadService.uploadFile(file); 
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // [VÁ LỖ HỔNG TRÀN RÁC CLOUDINARY]: API DỌN DẸP ẢNH
    // ==========================================================
    @Operation(summary = "Xóa ảnh tĩnh", description = "Xóa ảnh rác trên Cloudinary khi hủy form.")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/upload")
    public ResponseEntity<?> deleteImage(
            @RequestParam("url") String url,
            Authentication auth) {
        
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isAuthorized = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RESTAURANT"));
            
        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        fileUploadService.deleteFile(url);
        return ResponseEntity.ok().build();
    }
}
