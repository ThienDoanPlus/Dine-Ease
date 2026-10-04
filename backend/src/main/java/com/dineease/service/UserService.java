package com.dineease.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.security.access.AccessDeniedException;
import com.dineease.exception.ResourceNotFoundException;

import com.dineease.dto.UserResponse;
import com.dineease.dto.UpdateProfileRequest;
import com.dineease.exception.DuplicateResourceException;
import com.dineease.entity.Role;
import com.dineease.entity.User;
import com.dineease.repository.UserRepository;
import com.dineease.entity.AuditLog;
import com.dineease.repository.AuditLogRepository;
import com.dineease.dto.ChangePasswordRequest;
import com.dineease.exception.BadRequestException;
import java.time.Instant;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper userMapper, AuditLogRepository auditLogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(String keyword, Role role, Pageable pageable) {
        Page<User> users = userRepository.findAllByKeywordAndRole(keyword, role, pageable);
        return users.map(userMapper::toResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse updateUserStatus(Long id, String newStatus, String adminEmail) {

        // 1. Tìm User cần khóa
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", id));

        // 2. BẢO MẬT: Không cho phép Admin tự khóa chính mình
        if (user.getEmail().equals(adminEmail)) {
            throw new IllegalStateException("Bạn không thể tự khóa tài khoản của chính mình!");
        }

        // 3. BẢO MẬT: Không cho phép Admin khóa một Admin khác (Tránh nội chiến)
        if (user.getRoles().contains(Role.ADMIN)) {
            throw new AccessDeniedException("Hệ thống từ chối: Không thể khóa tài khoản của Quản trị viên cấp cao!");
        }

        // 4. Cập nhật trạng thái User
        user.setStatus(newStatus);
        
        // [VÁ LỖ HỔNG BẢO MẬT]: RÚT ĐIỆN PHIÊN LÀM VIỆC NẾU BỊ KHÓA
        if ("BANNED".equals(newStatus)) {
            user.setTokenVersion(user.getTokenVersion() + 1);
        }
        
        // ==========================================================
        // [VÁ LỖ HỔNG LỖI LOGIC]: ĐỒNG BỘ KHÓA NHÀ HÀNG KHI KHÓA CHỦ QUÁN
        // ==========================================================
        if (user.getRestaurant() != null) {
            if ("BANNED".equals(newStatus)) {
                // Khóa chủ quán -> Tạm ngưng (INACTIVE) nhà hàng. 
                user.getRestaurant().setStatus(com.dineease.entity.RestaurantStatus.INACTIVE);
            } else if ("ACTIVE".equals(newStatus)) {
                // Mở khóa chủ quán -> Mở lại (ACTIVE) nhà hàng
                user.getRestaurant().setStatus(com.dineease.entity.RestaurantStatus.ACTIVE);
            }
        }
        // ==========================================================

        // 5. Lưu xuống Database (CascadeType.ALL sẽ tự động lưu Restaurant)
        user = userRepository.save(user);
        
        // Ghi Audit Log
        saveAuditLog(adminEmail, "Cập nhật trạng thái tài khoản: " + user.getEmail(), user.getStatus(), newStatus);
        
        return userMapper.toResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void softDeleteUser(Long id, String adminEmail) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", id));

        if (user.getEmail().equals(adminEmail)) {
            throw new IllegalStateException("Bạn không thể tự khóa tài khoản của chính mình!");
        }

        if (user.getRoles().contains(Role.ADMIN)) {
            throw new AccessDeniedException("Hệ thống từ chối: Không thể xóa tài khoản Quản trị viên!");
        }

        // ĐỔI TRẠNG THÁI THÀNH DELETED
        user.setStatus("DELETED");

        // [VÁ LỖ HỔNG BẢO MẬT]: ĐÁ VĂNG TÀI KHOẢN BỊ XÓA KHỎI HỆ THỐNG NGAY LẬP TỨC
        user.setTokenVersion(user.getTokenVersion() + 1);

        // ==========================================================
        // [VÁ LỖ HỔNG RÀNG BUỘC UNIQUE]: GIẢI PHÓNG SỐ ĐIỆN THOẠI
        // (Thêm tiền tố "DEL_" + timestamp để SĐT cũ không bao giờ bị trùng)
        // ==========================================================
        if (user.getPhone() != null && !user.getPhone().startsWith("DEL_")) {
            user.setPhone("DEL_" + System.currentTimeMillis() + "_" + user.getPhone());
        }

        // NẾU LÀ CHỦ QUÁN -> CHO NHÀ HÀNG "BỐC HƠI" KHỎI TRANG CHỦ PUBLIC NGAY LẬP TỨC
        if (user.getRestaurant() != null) {
            user.getRestaurant().setStatus(com.dineease.entity.RestaurantStatus.INACTIVE);
        }

        saveAuditLog(adminEmail, "Xóa mềm (Soft Delete) tài khoản: " + user.getEmail(), "ACTIVE/BANNED", "DELETED");
        userRepository.save(user);
    }


    // ==========================================================
    // [VÁ LỖ HỔNG SELF-DESTRUCT]: API CẬP NHẬT QUYỀN HẠN
    // ==========================================================
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse updateUserRoles(Long id, java.util.Set<Role> newRoles, String adminEmail) {

        // 1. Tìm User cần sửa quyền
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", id));

        // 2. BẢO MẬT: Nếu Admin đang tự sửa quyền của chính mình
        if (targetUser.getEmail().equals(adminEmail)) {
            // Kiểm tra xem trong danh sách quyền mới có còn ROLE_ADMIN không
            if (!newRoles.contains(Role.ADMIN)) {
                throw new IllegalStateException("Hành động bị từ chối: Bạn không thể tự tước quyền Quản trị viên (ADMIN) của chính mình để tránh mất quyền kiểm soát hệ thống!");
            }
        } 
        // 3. BẢO MẬT: Nếu Admin đang cố sửa quyền của một Admin khác
        else if (targetUser.getRoles().contains(Role.ADMIN)) {
            throw new org.springframework.security.access.AccessDeniedException("Hành động bị từ chối: Bạn không được phép thay đổi quyền hạn của một Quản trị viên cấp cao khác!");
        }

        // 4. Nếu vượt qua các bài kiểm tra, tiến hành cập nhật quyền mới
        saveAuditLog(adminEmail, "Thay đổi phân quyền tài khoản: " + targetUser.getEmail(), targetUser.getRoles().toString(), newRoles.toString());
        targetUser.setRoles(newRoles);

        // [VÁ LỖ HỔNG BẢO MẬT]: ÉP ĐĂNG NHẬP LẠI ĐỂ NHẬN QUYỀN MỚI
        targetUser.setTokenVersion(targetUser.getTokenVersion() + 1);
        targetUser = userRepository.save(targetUser);
        
        return userMapper.toResponse(targetUser);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        // 1. Tìm User hiện tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", email));

        // 2. Kiểm tra nếu có đổi Số điện thoại thì SĐT mới không được trùng với người khác
        if (request.phone() != null && !request.phone().isBlank() && !request.phone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.phone())) {
                throw new DuplicateResourceException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
            }
            user.setPhone(request.phone());
        }

        // 3. Cập nhật các thông tin khác
        user.setFullName(request.fullName());
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            user.setAvatarUrl(request.avatarUrl());
        }

        // 4. Lưu lại
        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }

    // ==========================================================
    // HÀM HELPER ĐỂ GHI LOG GỌN GÀNG
    // ==========================================================
    private void saveAuditLog(String adminEmail, String action, String oldVal, String newVal) {
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin != null) {
            AuditLog log = AuditLog.builder()
                    .time(Instant.now())
                    .adminEmail(admin.getEmail())
                    .adminName(admin.getFullName())
                    .action(action)
                    .oldValue(oldVal)
                    .newValue(newVal)
                    .build();
            auditLogRepository.save(log);
        }
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", email));

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác!");
        }

        // Kiểm tra xác nhận mật khẩu
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không trùng khớp!");
        }

        // Mã hóa mật khẩu mới và lưu
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        
        // BẢO MẬT: Tăng token version để hủy tất cả token cũ (Bắt buộc người dùng đăng nhập lại)
        user.setTokenVersion(user.getTokenVersion() + 1);

        userRepository.save(user);
    }
}