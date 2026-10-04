package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.entity.MenuItem;
import com.dineease.entity.Restaurant;
import com.dineease.repository.OrderItemRepository;
import com.dineease.repository.OrderRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;

@ExtendWith(MockitoExtension.class)
public class ManageReportServiceTest {

    @Mock private RestaurantTableRepository tableRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository; 

    @InjectMocks private ManageReportService reportService;

    @Test
    @DisplayName("TC-19: Dashboard - Kiểm tra công thức tính Tỷ lệ lấp đầy (Occupancy Rate)")
    void getDashboardOverview_ShouldCalculateCorrectOccupancy() {
        // 1. ARRANGE
        String email = "owner.yume@gmail.com";
        Restaurant res = Restaurant.builder().id(1L).build();
        when(restaurantRepository.findByOwnerEmail(email)).thenReturn(Optional.of(res));

        // Quán có tổng cộng 10 chỗ (Capacity)
        when(tableRepository.getTotalCapacityByRestaurantId(1L)).thenReturn(10);
        
        // Hiện tại đang có 7 khách đang ngồi (Reserved Guests)
        when(reservationRepository.getTotalReservedGuestsForTimeRange(eq(1L), any(), any(), any()))
                .thenReturn(7);

        // 2. ACT
        var response = reportService.getDashboardOverview(email, "today");

        // 3. ASSERT
        // Tỷ lệ lấp đầy phải là 7/10 = 70%
        assertEquals(70, response.occupancyRate());
        System.out.println("TC-19 Pass: Công thức tính tỷ lệ lấp đầy chính xác 70%!");
    }

    @Test
    @DisplayName("TC-20: Thực đơn bán chạy - Phải tính toán chính xác tỷ trọng % của từng món")
    void getTopSellingItems_ShouldCalculateCorrectPercentage() {
        String email = "owner.yume@gmail.com";
        
        // 1. Giả lập tổng bán ra là 100 món
        when(orderItemRepository.getTotalQuantitySoldByRestaurant(email)).thenReturn(100L);

        // 2. Giả lập món Sashimi bán được 45 phần
        MenuItem mockItem = MenuItem.builder()
                .id(1L)
                .name("Sashimi Cá Hồi")
                .images(new ArrayList<>()) 
                .build();
                
        // TẠO DỮ LIỆU MOCK THEO KIỂU LIST CỦA MẢNG (Explicit Type)
        Object[] itemData = new Object[]{ mockItem, 45L }; 
        List<Object[]> mockResult = new ArrayList<>();
        mockResult.add(itemData);

        // KHI GỌI MOCK, TRẢ VỀ mockResult ĐÃ ĐƯỢC ĐỊNH NGHĨA RÕ KIỂU
        when(orderItemRepository.findTopSellingItems(eq(email), any())).thenReturn(mockResult);

        // 3. THỰC THI
        var results = reportService.getTopSellingItems(email);

        // 4. KIỂM TRA
        assertFalse(results.isEmpty());
        assertEquals(45, results.get(0).percent());
        
        System.out.println("TC-20 Pass: Lỗi ép kiểu Generics đã được xử lý!");
    }
}
