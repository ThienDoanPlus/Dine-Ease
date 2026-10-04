package com.dineease.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dineease.entity.Role;
import com.dineease.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: CHỐNG LỖI N+1 VÀ LAZY LOADING
    // ==========================================
    // Nạp sẵn Profile (để lấy điểm) và Restaurant (để Khoa check Auth) trong 1 lần Select duy nhất
    @EntityGraph(attributePaths = {"customerProfile", "roles", "restaurant"})
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // ==========================================
    // [CỦA KHOA]: CÁC QUERY PHỨC TẠP CHO ADMIN & THÔNG BÁO
    // ==========================================
    
    // Tìm kiếm User cho Admin Dashboard (Lọc theo Tên/Email/SĐT và Role)
    @Query("SELECT u FROM User u WHERE " + 
        "(:keyword IS NULL OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "u.phone LIKE CONCAT('%', :keyword, '%')) " +
        "AND (:role IS NULL OR :role MEMBER OF u.roles)"
    )
    Page<User> findAllByKeywordAndRole(
        @Param("keyword") String keyword, 
        @Param("role") Role role, 
        Pageable pageable
    );

    @Query("SELECT u.email FROM User u WHERE u.status = 'ACTIVE'")
    List<String> findAllActiveEmails();

    @Query("SELECT u.email FROM User u WHERE :role MEMBER OF u.roles AND u.status = 'ACTIVE'")
    List<String> findEmailsByRole(@Param("role") Role role);

    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE'")
    List<User> findAllActiveUsers();

    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles AND u.status = 'ACTIVE'")
    List<User> findUsersByRole(@Param("role") Role role);
}