package com.dineease.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

// Import Service và các thành phần bảo mật
import com.dineease.service.ManageMenuService;
import com.dineease.security.JwtService;
import com.dineease.repository.UserRepository;
import com.dineease.repository.InvalidatedTokenRepository;
import org.springframework.security.core.userdetails.UserDetailsService;

@WebMvcTest(ManageCategoryController.class) // <--- QUAN TRỌNG: Trỏ đúng Controller
@AutoConfigureMockMvc(addFilters = false)
public class ManageCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private ManageMenuService manageMenuService; // Service mà Controller này dùng
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private InvalidatedTokenRepository invalidatedTokenRepository;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @DisplayName("TC-23: Validation API - Phải trả về 400 nếu thiếu tên danh mục món ăn")
    void createCategory_ShouldReturn400_WhenNameIsBlank() throws Exception {
        // Gửi JSON trống tên: { "name": "" }
        String emptyJson = "{\"name\": \"\"}";

        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/manage/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(emptyJson))
                .andExpect(MockMvcResultMatchers.status().isBadRequest()); // Bây giờ sẽ ra 400
        
        System.out.println("TC-23 Pass: API Danh mục đã chặn dữ liệu trống thành công!");
    }
}