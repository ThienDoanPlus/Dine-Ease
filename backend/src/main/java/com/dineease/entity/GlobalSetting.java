package com.dineease.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "global_settings")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class GlobalSetting {
    @Id
    private String settingKey;
    private String settingValue;
    private String description;
}
