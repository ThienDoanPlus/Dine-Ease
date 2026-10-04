package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "legal_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LegalDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String documentName; // Ví dụ: "Giấy phép kinh doanh", "CCCD"

    @Column(nullable = false, length = 500)
    private String fileUrl; // URL từ Cloudinary

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @PrePersist
    protected void onCreate() { createdAt = Instant.now(); }
}
