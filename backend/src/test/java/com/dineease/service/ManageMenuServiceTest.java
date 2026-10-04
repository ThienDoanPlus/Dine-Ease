package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.entity.*;
import com.dineease.repository.*;

@ExtendWith(MockitoExtension.class)
public class ManageMenuServiceTest {

    @Mock private MenuItemRepository menuItemRepository;
    
    // --- CÁC PHẦN BỔ SUNG ĐỂ FIX LỖI ---
    @Mock private RestaurantRepository restaurantRepository; 
    @Mock private MenuCategoryRepository categoryRepository;
    @Mock private FileUploadService fileUploadService;
    @Mock private OrderRepository orderRepository; 

    @InjectMocks private ManageMenuService menuService;

    @Test
    @DisplayName("Nghiệp vụ: Xóa món ăn - Phải chuyển sang HIDDEN và cập nhật lại giá TB của quán")
    void deleteMenuItem_ShouldSetStatusToHidden() {
        // 1. ARRANGE
        User owner = User.builder().email("manager@test.com").build();
        Restaurant res = Restaurant.builder()
                .id(1L)
                .owner(owner)
                .build();
        
        MenuItem pizza = MenuItem.builder()
                .id(50L)
                .name("Pizza")
                .restaurant(res)
                .status(MenuItemStatus.AVAILABLE)
                .build();

        // Giả lập tìm thấy món ăn
        when(menuItemRepository.findById(50L)).thenReturn(Optional.of(pizza));
        
        // Giả lập logic tính giá trung bình (Hàm này được gọi bên trong updateRestaurantAvgPrice)
        when(menuItemRepository.getAveragePriceByRestaurantId(res.getId()))
                .thenReturn(new BigDecimal("150000"));

        // 2. ACT
        menuService.deleteMenuItem(50L, "manager@test.com");

        // 3. ASSERT
        // Kiểm tra trạng thái món ăn
        assertEquals(MenuItemStatus.HIDDEN, pizza.getStatus());
        
        // Kiểm tra xem có lưu lại món ăn không
        verify(menuItemRepository, times(1)).save(pizza);
        
        // QUAN TRỌNG: Kiểm tra xem có gọi lệnh lưu lại Nhà hàng sau khi tính lại giá TB không
        verify(restaurantRepository, times(1)).save(res);
        
        System.out.println("Test Case Pass: Món đã ẩn và Giá trung bình nhà hàng đã được tính lại!");
    }

    @Test
    @DisplayName("Nghiệp vụ Menu: Chặn xóa danh mục nếu vẫn còn món ăn bên trong")
    void deleteCategory_ShouldThrowException_WhenCategoryHasItems() {
        // 1. ARRANGE
        MenuCategory category = MenuCategory.builder()
                .id(1L)
                .name("Món Nhật")
                .restaurant(Restaurant.builder().owner(User.builder().email("manager@test.com").build()).build())
                .menuItems(List.of(new MenuItem())) // ĐANG CÓ MÓN ĂN
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        // 2. ACT & 3. ASSERT
        assertThrows(IllegalStateException.class, () -> {
            menuService.deleteCategory(1L, "manager@test.com");
        });
        
        System.out.println("✅ Test Case 15 Pass: Chặn xóa danh mục có ràng buộc thành công!");
    }
}