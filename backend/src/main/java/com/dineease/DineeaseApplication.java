package com.dineease;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DineeaseApplication {

    public static void main(String[] args) {
        // Khắc cứng DNS Google để tránh lỗi phân giải tên miền api.groq.com
        System.setProperty("sun.net.spi.nameservice.nameservers", "8.8.8.8");
        System.setProperty("sun.net.spi.nameservice.provider.1", "dns,sun");
        System.setProperty("java.net.preferIPv4Stack", "true");

        SpringApplication.run(DineeaseApplication.class, args);
    }

    @Bean
    public CommandLineRunner secretGenerator() {
        return args -> {
            String password = "123456";
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String hash = encoder.encode(password);
            System.out.println("=============================================");
            System.out.println("CHUỖI HASH CHUẨN CHO 123456 LÀ:");
            System.out.println(hash);
            System.out.println("=============================================");
        };
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}