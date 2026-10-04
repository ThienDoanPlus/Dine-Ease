package com.dineease.service;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.dineease.dto.RestaurantAdminResponse;
import com.dineease.dto.RestaurantStatusUpdateRequest;
import com.dineease.dto.AdminUpdateRestaurantRequest;
import com.dineease.dto.LegalDocumentResponse;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantStatus;
import com.dineease.entity.Role;
import com.dineease.entity.User;
import com.dineease.entity.Cuisine;
import com.dineease.entity.Amenity;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.UserRepository;
import com.dineease.repository.CuisineRepository;
import com.dineease.repository.AmenityRepository;
import com.dineease.entity.AuditLog;
import com.dineease.repository.AuditLogRepository;
import java.time.Instant;

@Service
public class AdminRestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final CuisineRepository cuisineRepository;
    private final AmenityRepository amenityRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final FileUploadService fileUploadService;
    private final AuditLogRepository auditLogRepository;

    public AdminRestaurantService(RestaurantRepository restaurantRepository,
                                  UserRepository userRepository,
                                  CuisineRepository cuisineRepository,
                                  AmenityRepository amenityRepository,
                                  PasswordEncoder passwordEncoder,
                                  EmailService emailService,
                                  FileUploadService fileUploadService,
                                  AuditLogRepository auditLogRepository) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.cuisineRepository = cuisineRepository;
        this.amenityRepository = amenityRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.fileUploadService = fileUploadService;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public Page<RestaurantAdminResponse> getAllRestaurants(String keyword, String status, Pageable pageable) {
        List<RestaurantStatus> statusList = null;

        if (status != null && !status.trim().isEmpty() && !status.equals("Tất cả")) {
            if (status.equalsIgnoreCase("APPROVED")) {
                // Nếu lọc "Đã duyệt", lấy tất cả các trạng thái hậu phê duyệt
                statusList = List.of(RestaurantStatus.APPROVED, RestaurantStatus.ACTIVE, RestaurantStatus.INACTIVE);
            } else {
                try {
                    statusList = List.of(RestaurantStatus.valueOf(status.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    statusList = null;
                }
            }
        }

        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        // Gọi repository với danh sách status
        Page<Restaurant> restaurants = restaurantRepository.findAllByKeywordAndStatuses(cleanKeyword, statusList, pageable);

        return restaurants.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public RestaurantAdminResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", id));
        return mapToResponse(restaurant);
    }

    @Transactional
    public RestaurantAdminResponse updateRestaurantStatus(Long id, RestaurantStatusUpdateRequest request, String adminEmail) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", id));

        String oldStatus = restaurant.getStatus().name();

        // Bước 3: Khi Admin DUYỆT nhà hàng
        if (request.status() == RestaurantStatus.APPROVED) {
            
            if (request.commissionRate() != null) {
                restaurant.setCommissionRate(request.commissionRate());
            }

            User owner = restaurant.getOwner();
            if (owner != null && !owner.getRoles().contains(Role.RESTAURANT)) {
                
                String rawPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
                owner.getRoles().add(Role.RESTAURANT);
                owner.setPassword(passwordEncoder.encode(rawPassword));
                
                // [VÁ LỖ HỔNG]: Tăng version để hủy các token cũ (nếu có)
                owner.setTokenVersion(owner.getTokenVersion() + 1); 
                
                userRepository.save(owner);


                final String toEmail = owner.getEmail();
                final String resName = restaurant.getName();
                final String finalRawPassword = rawPassword;

                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        emailService.sendApprovalEmail(toEmail, finalRawPassword, resName);
                    }
                });
            }
        }

        restaurant.setStatus(request.status());
        restaurant = restaurantRepository.save(restaurant);

        // Ghi Audit Log
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            AuditLog log = AuditLog.builder()
                .time(Instant.now())
                .adminEmail(admin.getEmail())
                .adminName(admin.getFullName())
                .action("Thay đổi trạng thái Nhà hàng: " + restaurant.getName())
                .oldValue(oldStatus)
                .newValue(request.status().name())
                .build();
            auditLogRepository.save(log);
        }

        return mapToResponse(restaurant);
    }

    @Transactional
    public RestaurantAdminResponse updateRestaurantProfile(Long id, AdminUpdateRestaurantRequest request, MultipartFile coverImage) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", id));

        // 1. Cập nhật thông tin cơ bản
        if (request.name() != null) restaurant.setName(request.name());
        if (request.phoneContact() != null) restaurant.setPhoneContact(request.phoneContact());
        if (request.address() != null) restaurant.setAddress(request.address());
        if (request.description() != null) restaurant.setDescription(request.description());
        if (request.commissionRate() != null) restaurant.setCommissionRate(request.commissionRate());

        // 2. Cập nhật Danh mục Ẩm thực (Cuisine)
        if (request.cuisineId() != null) {
            Cuisine cuisine = cuisineRepository.findById(request.cuisineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cuisine không tồn tại"));
            restaurant.setCuisine(cuisine);
        }

        // 3. Cập nhật Tiện ích (Amenities)
        if (request.amenityIds() != null) {
            List<Amenity> amenities = amenityRepository.findAllById(request.amenityIds());
            restaurant.getAmenities().clear();
            restaurant.getAmenities().addAll(amenities);
        }

        // ==========================================================
        // [VÁ LỖ HỔNG RÒ RỈ CLOUDINARY]: Xóa ảnh bìa cũ trước khi đè
        // ==========================================================
        // 4. Cập nhật Ảnh bìa (Nếu có upload)
        if (coverImage != null && !coverImage.isEmpty()) {
            // 4.1 Xóa ảnh cũ trên Cloudinary (nếu có)
            if (restaurant.getImageMain() != null && !restaurant.getImageMain().isBlank()) {
                fileUploadService.deleteFile(restaurant.getImageMain());
            }
            
            // 4.2 Upload ảnh mới
            String newImageUrl = fileUploadService.uploadFile(coverImage);
            restaurant.setImageMain(newImageUrl);
        }
        // ==========================================================

        // 5. Cập nhật Mật khẩu cho Chủ quán (Nếu Admin yêu cầu tạo mới)
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            User owner = restaurant.getOwner();
            if (owner != null) {
                owner.setPassword(passwordEncoder.encode(request.newPassword()));
                
                // [VÁ LỖ HỔNG]: Tăng version để đá văng nhân viên cũ khỏi hệ thống ngay lập tức
                owner.setTokenVersion(owner.getTokenVersion() + 1); 
                
                userRepository.save(owner);
            }

        }

        return mapToResponse(restaurantRepository.save(restaurant));
    }

    // ==========================================================
    // [BỔ SUNG API CÒN THIẾU]: YÊU CẦU ĐỐI TÁC BỔ SUNG HỒ SƠ
    // ==========================================================
    @Transactional
    public void requestPartnerToUpdate(Long id, String message) {
        // 1. Tìm nhà hàng
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", id));

        // 2. Lấy thông tin chủ quán
        User owner = restaurant.getOwner();
        if (owner == null) {
            throw new IllegalStateException("Lỗi dữ liệu: Nhà hàng không có thông tin người đại diện.");
        }

        String toEmail = owner.getEmail();
        String subject = "Dine-Ease: Yêu cầu bổ sung hồ sơ đăng ký nhà hàng";

        // 3. Render HTML Email Template
        String htmlContent = "<p>Chào <b>" + owner.getFullName() + "</b>,</p>"
                + "<p>Chúng tôi đang xem xét hồ sơ đăng ký nhà hàng <b>" + restaurant.getName() + "</b> của bạn. Tuy nhiên, để đáp ứng đủ tiêu chuẩn phê duyệt, chúng tôi cần bạn bổ sung/chỉnh sửa một số thông tin sau:</p>"
                
                // Khung vàng làm nổi bật tin nhắn của Admin
                + "<div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;'>"
                + "<p style='margin:0; font-size: 14px; color: #92400e; font-weight: bold;'>" + message.replace("\n", "<br>") + "</p>"
                + "</div>"
                
                + "<p>Vui lòng <b>phản hồi lại trực tiếp Email này</b> và đính kèm các giấy tờ/thông tin được yêu cầu. Đội ngũ kiểm duyệt sẽ xử lý ngay khi nhận được phản hồi từ bạn.</p>"
                + "<p>Trân trọng cảm ơn sự hợp tác của bạn!</p>";

        // 4. Gọi Email Service (Đã có sắn Async nên không lo giật lag)
        emailService.sendNotificationEmail(toEmail, subject, htmlContent);
    }

    private RestaurantAdminResponse mapToResponse(Restaurant restaurant) {
        List<LegalDocumentResponse> docs = restaurant.getLegalDocuments().stream()
                .map(d -> new LegalDocumentResponse(d.getId(), d.getDocumentName(), d.getFileUrl(), d.getCreatedAt()))
                .collect(Collectors.toList());

        return new RestaurantAdminResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getPhoneContact(),
                restaurant.getAddress(),
                restaurant.getDescription(),
                restaurant.getImageMain(),
                restaurant.getAvgRating(),
                restaurant.getCommissionRate(),
                restaurant.getStatus(),
                restaurant.getOwner() != null ? restaurant.getOwner().getEmail() : null,
                restaurant.getOwner() != null ? restaurant.getOwner().getFullName() : null,
                restaurant.getCuisine() != null ? restaurant.getCuisine().getName() : "Đa dạng món ăn",
                docs
        );
    }
}