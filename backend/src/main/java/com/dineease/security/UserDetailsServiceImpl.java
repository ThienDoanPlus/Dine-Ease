package com.dineease.security;

import java.util.Collections;
import java.util.stream.Collectors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.User;
import com.dineease.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Trong Dine-Ease, 'username' của Spring Security chính là 'email' của hệ thống
        com.dineease.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user với email: " + email));

        // ==========================================================
        // [VÁ LỖ HỔNG SESSION HACKING]: RÚT ĐIỆN NGAY LẬP TỨC
        // ==========================================================
        
        // 1. Nếu tài khoản User bị khóa hoặc bị xóa mềm
        if ("BANNED".equals(user.getStatus()) || "DELETED".equals(user.getStatus())) {
            throw new org.springframework.security.authentication.LockedException("Tài khoản của bạn đã bị khóa hoặc không còn tồn tại trên hệ thống.");
        }

        // 2. Nếu User là Chủ nhà hàng, kiểm tra thêm trạng thái của Nhà hàng
        if (user.getRoles().contains(com.dineease.entity.Role.RESTAURANT) && user.getRestaurant() != null) {
            String resStatus = user.getRestaurant().getStatus().name();
            // Nếu nhà hàng không phải ACTIVE hoặc APPROVED -> Khóa luôn Session
            if (!resStatus.equals("ACTIVE") && !resStatus.equals("APPROVED")) {
                throw new org.springframework.security.authentication.LockedException("Nhà hàng của bạn đang bị khóa (Trạng thái: " + resStatus + ").");
            }
        }
        // ==========================================================

        // Prefix ROLE_ là bắt buộc trong Spring Security (Ví dụ: ROLE_ADMIN, ROLE_CUSTOMER)
        var authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());

        return new User(
            user.getEmail(),
            user.getPassword(), // Đảm bảo entity User field này tên là password (chứa mã băm bcrypt)
            authorities
        );
    }
}