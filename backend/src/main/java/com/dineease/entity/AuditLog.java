package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class AuditLog {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Instant time;
    private String adminEmail;
    private String adminName;
    private String action;
    private String oldValue;
    private String newValue;
    private String reason;
}
