package com.dineease.security;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import com.dineease.repository.InvalidatedTokenRepository;
import com.dineease.entity.User;
import com.dineease.repository.UserRepository;


import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService, InvalidatedTokenRepository invalidatedTokenRepository, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.invalidatedTokenRepository = invalidatedTokenRepository;
        this.userRepository = userRepository;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // KIỂM TRA BLACKLIST NGAY LẬP TỨC
                if (invalidatedTokenRepository.existsById(jwt)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"TokenInvalidated\", \"message\":\"Token đã bị đăng xuất.\"}");
                    return;
                }

                String email = jwtService.extractUsername(jwt);
                if (email != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    // ==========================================================
                    // [VÁ LỖ HỔNG SESSION HIJACKING]: KIỂM TRA TOKEN VERSION
                    // ==========================================================
                    User dbUser = userRepository.findByEmail(email).orElse(null);
                    Integer jwtVersion = jwtService.extractTokenVersion(jwt);
                    
                    if (dbUser != null && jwtVersion != null) {
                        if (!jwtVersion.equals(dbUser.getTokenVersion())) {
                            throw new JwtException("Mật khẩu của tài khoản đã bị thay đổi. Phiên đăng nhập hiện tại đã hết hiệu lực!");
                        }
                    }
                    // ==========================================================

                    if (jwtService.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }

            }
        } catch (ExpiredJwtException ex) {
            log.error("JWT expired: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"TokenExpired\", \"message\":\"Access token đã hết hạn. Vui lòng đăng nhập lại.\"}");
            return; // Dừng filter chain ngay lập tức
        } catch (JwtException ex) {
            log.error("Invalid JWT: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"InvalidToken\", \"message\":\"Token không hợp lệ hoặc bị can thiệp.\"}");
            return; // Dừng filter chain ngay lập tức
        } catch (org.springframework.security.authentication.LockedException ex) {
            log.warn("🚨 Bảo mật: Chặn phiên làm việc từ tài khoản đã bị khóa - {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // Trả về 403 Forbidden
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"AccountLocked\", \"message\":\"" + ex.getMessage() + "\"}");
            return; // Dừng Filter Chain, không cho đi tiếp vào Controller
        } catch (Exception ex) {
            log.debug("Could not set user authentication from JWT: {}", ex.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}