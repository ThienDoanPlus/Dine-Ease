package com.dineease.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "invalidated_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvalidatedToken {
    @Id
    private String id; // Lưu chính xác chuỗi Token
    private Date expiryTime; // Thời gian Token hết hạn (để sau này dọn dẹp DB)
}
