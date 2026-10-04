package com.dineease.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
        .info(new Info()
                .title("Dine-Ease API Documentation")
                .description("Hệ thống Đặt bàn Nhà hàng (Restaurant Reservation System)")
                .version("1.0")
                .contact(new Contact().name("Team 11").email("nak.khoanguyen@gmail.com")))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
        .components(new Components()
                .addSecuritySchemes("bearerAuth", 
                                    new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT Access Token sau khi đăng nhập.")));
    }
}