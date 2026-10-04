package com.dineease.service;

import java.util.HashSet;
import java.util.Set;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.config.JwtProperties;
import com.dineease.dto.AuthResponse;
import com.dineease.dto.LoginRequest;
import com.dineease.dto.RegisterRequest;
import com.dineease.dto.UserResponse;
import com.dineease.entity.Role;
import com.dineease.entity.User;
import com.dineease.exception.DuplicateResourceException;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.dto.RefreshTokenRequest;
import com.dineease.entity.InvalidatedToken;
import com.dineease.repository.InvalidatedTokenRepository;
import com.dineease.repository.UserRepository;
import com.dineease.security.JwtService;
import com.dineease.repository.RestaurantRepository;
import com.dineease.service.FileUploadService;
import com.dineease.dto.RestaurantRegisterRequest;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserMapper userMapper;
    private final JwtProperties jwtProperties;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final RestaurantRepository restaurantRepository;
    private final FileUploadService fileUploadService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            AuthenticationManager authenticationManager, UserDetailsService userDetailsService,
            UserMapper userMapper, JwtProperties jwtProperties, InvalidatedTokenRepository invalidatedTokenRepository,
            RestaurantRepository restaurantRepository, FileUploadService fileUploadService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.userMapper = userMapper;
        this.jwtProperties = jwtProperties;
        this.invalidatedTokenRepository = invalidatedTokenRepository;
        this.restaurantRepository = restaurantRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        
        // 1. Kiểm tra Email
        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(request.email());
        
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            
            // ==========================================================
            // [VÁ LỖ HỔNG ZOMBIE USER]: CHO PHÉP TÁI SINH TÀI KHOẢN ĐÃ XÓA MỀM
            // ==========================================================
            if ("DELETED".equals(existingUser.getStatus())) {
                // Nếu SĐT đăng ký mới trùng với SĐT của 1 User đang ACTIVE khác -> Văng lỗi
                // (Vì SĐT của User bị DELETED có thể được giữ nguyên hoặc đổi thành dummy)
                if (userRepository.existsByPhone(request.phone()) && !existingUser.getPhone().equals(request.phone())) {
                    throw new DuplicateResourceException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
                }

                log.info("Tái sinh tài khoản (Resurrect) đã xóa mềm: {}", existingUser.getEmail());
                
                // Ghi đè lại toàn bộ thông tin mới
                existingUser.setPassword(passwordEncoder.encode(request.password()));
                existingUser.setFullName(request.fullName());
                existingUser.setPhone(request.phone());
                existingUser.setAvatarUrl(request.avatarUrl());
                existingUser.setRoles(new HashSet<>(Set.of(Role.CUSTOMER)));
                existingUser.setStatus("ACTIVE"); // Mở khóa trở lại
                
                // [BẢO MẬT]: Tăng Token Version để rũ bỏ hoàn toàn dấu vết cũ
                existingUser.setTokenVersion(existingUser.getTokenVersion() + 1);

                return userMapper.toResponse(userRepository.save(existingUser));
            } else {
                // Nếu User đang ACTIVE hoặc BANNED -> Chặn lại
                throw new DuplicateResourceException("Tài khoản Email này đã được sử dụng.");
            }
        }

        // 2. Kiểm tra Số điện thoại (Trường hợp Email chưa từng tồn tại trên DB)
        if (userRepository.existsByPhone(request.phone())) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng");
        }

        // 3. Đăng ký mới hoàn toàn
        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .avatarUrl(request.avatarUrl()) // [TÍCH HỢP TỪ YẾN]
                .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                .status("ACTIVE")
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }


    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        if ("BANNED".equals(user.getStatus())) throw new org.springframework.security.authentication.LockedException("Tài khoản đã bị khóa");

        // ==========================================================
        // [TÍCH HỢP TỪ YẾN]: CHẶN LOGIN KHI QUÁN BỊ BAN/TỪ CHỐI
        // ==========================================================
        if (user.getRoles().contains(Role.RESTAURANT)) {
            if (user.getRestaurant() != null) {
                String resStatus = user.getRestaurant().getStatus().name();
                if (!resStatus.equals("ACTIVE") && !resStatus.equals("APPROVED")) {
                    throw new org.springframework.security.access.AccessDeniedException(
                        "Tài khoản nhà hàng của bạn đang ở trạng thái: " + resStatus + ". Không thể truy cập hệ thống!"
                    );
                }
            } else {
                 throw new org.springframework.security.access.AccessDeniedException("Lỗi: Không tìm thấy hồ sơ nhà hàng liên kết.");
            }
        }

        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return AuthResponse.of(
            jwtService.generateAccessToken(userDetails, user.getTokenVersion()), 
            jwtService.generateRefreshToken(userDetails, user.getTokenVersion()), 
            jwtProperties.getAccessTokenExpirationMs(), 
            userMapper.toResponse(user)
        );

    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
        return userMapper.toResponse(user);
    }

    // 1. HÀM LOGOUT (Đưa Token vào Blacklist)
    public void logout(String token) {
        try {
            // Lấy thời hạn của token để lưu vào DB
            Date expiryTime = jwtService.extractExpiration(token);
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(token)
                    .expiryTime(expiryTime)
                    .build();
            invalidatedTokenRepository.save(invalidatedToken);
            log.info("Đã đưa Token vào Blacklist thành công.");
        } catch (Exception e) {
            log.warn("Token đã hết hạn hoặc không hợp lệ, không cần đưa vào Blacklist.");
        }
    }

    // 2. HÀM REFRESH TOKEN
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (invalidatedTokenRepository.existsById(refreshToken)) {
            throw new org.springframework.security.access.AccessDeniedException("Refresh Token đã bị vô hiệu hóa (Logged out)");
        }

        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        // [TÍCH HỢP TỪ YẾN]: CHẶN REFRESH KHI QUÁN BỊ BAN GIỮA CHỪNG
        if (user.getRoles().contains(Role.RESTAURANT)) {
            if (user.getRestaurant() != null) {
                String resStatus = user.getRestaurant().getStatus().name();
                if (!resStatus.equals("ACTIVE") && !resStatus.equals("APPROVED")) {
                    throw new org.springframework.security.access.AccessDeniedException(
                        "Tài khoản nhà hàng của bạn đang ở trạng thái: " + resStatus + ". Không thể tiếp tục phiên làm việc!"
                    );
                }
            }
        }

        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        if (jwtService.validateToken(refreshToken, userDetails)) {
            return AuthResponse.of(
                jwtService.generateAccessToken(userDetails, user.getTokenVersion()), 
                jwtService.generateRefreshToken(userDetails, user.getTokenVersion()), 
                jwtProperties.getAccessTokenExpirationMs(), 
                userMapper.toResponse(user)
            );
        } else {
            throw new org.springframework.security.access.AccessDeniedException("Refresh Token không hợp lệ");
        }

    }

    @Transactional
    public void registerPartner(RestaurantRegisterRequest request, MultipartFile coverImage, MultipartFile license, MultipartFile idCard) {
        // 1. Kiểm tra Email người đại diện. Nếu chưa có tài khoản, hệ thống sẽ tạo sẵn 1 User.
        User owner = userRepository.findByEmail(request.ownerEmail()).orElseGet(() -> {
            User newUser = User.builder()
                    .email(request.ownerEmail())
                    .fullName(request.ownerFullName())
                    .phone(request.phoneContact())
                    // Mật khẩu ảo tạm thời, Admin sẽ reset và gửi pass thật qua mail khi Duyệt
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .roles(new HashSet<>(Set.of(Role.CUSTOMER))) // Cấp quyền cơ bản trước
                    .status("ACTIVE")
                    .build();
            return userRepository.save(newUser);
        });

        // 2. Upload ảnh bìa lên Cloudinary (Chỉ upload nếu có file gửi lên)
        String imageUrl = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            imageUrl = fileUploadService.uploadFile(coverImage);
        }

        // ==========================================================
        // [VÁ LỖ HỔNG HỒI SINH RÁC]: KIỂM TRA NHÀ HÀNG HIỆN TẠI
        // ==========================================================
        Restaurant restaurant = null;
        if (owner.getRestaurant() != null) {
            restaurant = owner.getRestaurant();
            
            // Nếu hồ sơ cũ đã bị TỪ CHỐI -> Cho phép GHI ĐÈ thông tin và Re-apply về PENDING
            if (restaurant.getStatus() == RestaurantStatus.REJECTED) {
                restaurant.setName(request.restaurantName());
                restaurant.setPhoneContact(request.phoneContact());
                restaurant.setAddress(request.address());
                if (request.description() != null) restaurant.setDescription(request.description());
                if (imageUrl != null) restaurant.setImageMain(imageUrl);
                
                restaurant.setStatus(RestaurantStatus.PENDING); // Đưa về chờ duyệt lại
            } 
            // Nếu hồ sơ đang ở trạng thái khác (PENDING, ACTIVE...) -> Chặn lại
            else {
                throw new DuplicateResourceException("Tài khoản Email này đã được đăng ký! Trạng thái hồ sơ hiện tại: " + restaurant.getStatus());
            }
        } else {
            // 3. Nếu là lần đăng ký đầu tiên -> Tạo mới
            restaurant = Restaurant.builder()
                    .name(request.restaurantName())
                    .phoneContact(request.phoneContact())
                    .address(request.address())
                    .description(request.description())
                    .imageMain(imageUrl)
                    .status(RestaurantStatus.PENDING)
                    .owner(owner)
                    .build();
        }

        // [VÁ LỖ HỔNG]: Upload và gắn Legal Documents trước khi Save
        java.util.List<com.dineease.entity.LegalDocument> docs = new java.util.ArrayList<>();
        
        if (license != null && !license.isEmpty()) {
            docs.add(com.dineease.entity.LegalDocument.builder()
                .documentName("Giấy phép kinh doanh")
                .fileUrl(fileUploadService.uploadFile(license))
                .restaurant(restaurant).build());
        }
        
        if (idCard != null && !idCard.isEmpty()) {
            docs.add(com.dineease.entity.LegalDocument.builder()
                .documentName("CCCD/CMND Người đại diện")
                .fileUrl(fileUploadService.uploadFile(idCard))
                .restaurant(restaurant).build());
        }
        
        // Nếu có tài liệu mới thì cập nhật, nếu không thì giữ nguyên (cho trường hợp Re-apply)
        if (!docs.isEmpty()) {
            restaurant.setLegalDocuments(docs);
        }
        
        restaurantRepository.save(restaurant);
    }


    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getPartnerDraft(String email, String phone) {
        User user = userRepository.findByEmail(email).orElse(null);
        
        // Kiểm tra đúng Email, đúng SĐT và phải có Nhà hàng
        if (user != null && user.getPhone().equals(phone) && user.getRestaurant() != null) {
            Restaurant r = user.getRestaurant();
            
            // Chỉ cho phép khôi phục nếu đang ở trạng thái PENDING hoặc REJECTED
            if (r.getStatus() == RestaurantStatus.PENDING || r.getStatus() == RestaurantStatus.REJECTED) {
                return java.util.Map.of(
                    "restaurantName", r.getName(),
                    "phoneContact", r.getPhoneContact(),
                    "address", r.getAddress(),
                    "description", r.getDescription() != null ? r.getDescription() : "",
                    "ownerFullName", user.getFullName(),
                    "ownerEmail", user.getEmail(),
                    "status", r.getStatus().name()
                );
            }
        }
        return null;
    }
}