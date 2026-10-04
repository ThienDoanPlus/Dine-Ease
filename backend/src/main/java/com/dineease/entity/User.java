package com.dineease.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email", unique = true),
    @Index(name = "idx_users_phone", columnList = "phone", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;
    
    // ==========================================================
    // [VÁ LỖ HỔNG SESSION HIJACKING]: Phiên bản Token
    // ==========================================================
    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private Integer tokenVersion = 1;


    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(unique = true, length = 15)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate(){
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt = Instant.now();
    }

    // ==========================================
    // [TÍCH HỢP]: QUAN HỆ HAI CHIỀU CASCADE
    // ==========================================
    
    // [CỦA YẾN]: Nếu User bị xóa, xóa luôn hồ sơ Customer Profile tích điểm
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private CustomerProfile customerProfile;

    // [CỦA KHOA]: Nếu User (Chủ quán) bị xóa, nhà hàng "bay màu" theo
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Restaurant restaurant;
}