package com.dineease.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthFilter,
        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
        CustomAccessDeniedHandler accessDeniedHandler) {
            this.jwtAuthFilter = jwtAuthFilter;
            this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
            this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Cho phép các request OPTIONS (Preflight) đi qua
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // 1. Nhóm API Public (Không cần Token)
            .requestMatchers("/api/v1/auth/**").permitAll()        // Đăng nhập, đăng ký
            .requestMatchers("/api/v1/public/**").permitAll()      // Tìm kiếm, xem quán, xem menu (Bao gồm cả Review Public)
            
            // [CẬP NHẬT Ở ĐÂY]: Mở thêm API vnpay-return bên cạnh webhook
            .requestMatchers("/api/v1/payments/webhook/**", "/api/v1/payments/vnpay-return").permitAll() 
            
            .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll() // Docs
            
            // THÊM API LẤY THÔNG BÁO VÀO NHÓM CHUNG (Chỉ cần đăng nhập)
            .requestMatchers("/api/v1/my-notifications/**").authenticated()

            // 2. Nhóm API Admin
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            
            // 3. Nhóm API Quản lý nhà hàng (Business User)
            .requestMatchers("/api/v1/manage/**").hasRole("RESTAURANT")
            
            // 4. Nhóm API Khách hàng
            .requestMatchers("/api/v1/customers/**").hasRole("CUSTOMER")
            .requestMatchers("/api/v1/reservations/**").hasRole("CUSTOMER")
            
            // 5. Các request còn lại
            .anyRequest().authenticated()
        )
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler)
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép Frontend ReactJS/NextJS truy cập (bao gồm cả localhost và IP LAN)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://192.168.0.100:3000"));
        // Cho phép các method HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Cho phép các Header (đặc biệt là Authorization để chứa JWT)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        // Cho phép gửi kèm thông tin xác thực (Credentials)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng cấu hình này cho mọi API (/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }



    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}