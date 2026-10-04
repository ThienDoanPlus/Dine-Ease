package com.dineease.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VnpayConfig {
    private String payUrl;
    private String tmnCode;
    private String hashSecret;
    private String returnUrl;
}
