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

// --- IMPORT CÁC THÀNH PHẦN BẢO MẬT ---
import com.dineease.security.JwtService;
import com.dineease.repository.UserRepository;
import com.dineease.repository.InvalidatedTokenRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
// -------------------------------------

import com.dineease.service.KitchenService;

@WebMvcTest(ManageOrderController.class)
@AutoConfigureMockMvc(addFilters = false) // Tắt các filter bảo mật thực tế
public class ManageOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KitchenService kitchenService;

    // ==========================================================
    // [VÁ LỖ HỔNG CONTEXT]: MOCK CÁC BEAN MÀ SECURITY FILTER YÊU CẦU
    // Để Spring Context không bị crash khi khởi động
    // ==========================================================
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private InvalidatedTokenRepository invalidatedTokenRepository;
    @MockitoBean private UserDetailsService userDetailsService;
    // ==========================================================

    @Test
    @DisplayName("TC-22: Validation API - Phải trả về 400 nếu gửi số lượng món ăn âm")
    void createOrder_ShouldReturn400_WhenQuantityIsNegative() throws Exception {
        String invalidJson = """
            {
                "tableId": 1,
                "items": [
                    {
                        "menuItemId": 5,
                        "quantity": -5
                    }
                ]
            }
        """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/manage/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
        
        System.out.println("TC-22 Pass: Đã chặn dữ liệu âm thành công!");
    }
}

   
