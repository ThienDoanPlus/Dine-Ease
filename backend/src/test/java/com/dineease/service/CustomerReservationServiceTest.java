package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.dto.ReservationRequest;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantStatus;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;

@ExtendWith(MockitoExtension.class)
public class CustomerReservationServiceTest {

    @Mock private RestaurantRepository restaurantRepository;
    @Mock private RestaurantTableRepository tableRepository;
    // ... các mock khác cần thiết để khởi tạo service ...

    @InjectMocks private CustomerReservationService reservationService;

    @Test
    @DisplayName("Nghiệp vụ: Chặn đặt bàn khi số khách vượt quá giới hạn Max Pax của quán")
    void createReservation_ShouldThrowException_WhenGuestsExceedMaxPax() {
        // 1. ARRANGE (Chuẩn bị)
        Long resId = 1L;
        // Giả lập quán sushi có MaxPax = 20
        Restaurant mockRestaurant = Restaurant.builder()
                .id(resId)
                .maxPax(20) 
                .status(RestaurantStatus.ACTIVE)
                .build();

        ReservationRequest request = new ReservationRequest(
                resId, 
                LocalDate.now().plusDays(1), 
                LocalTime.of(19, 0), 
                25, // Cố tình đặt 25 người (> 20)
                "Tiệc công ty"
        );

        when(restaurantRepository.findByIdWithPessimisticLock(resId))
                .thenReturn(Optional.of(mockRestaurant));

        // 2. ACT & 3. ASSERT (Hành động và Kiểm chứng)
        // Chúng ta mong đợi một lỗi BadRequestException sẽ văng ra
        assertThrows(com.dineease.exception.BadRequestException.class, () -> {
            reservationService.createReservation(request, "customer@gmail.com");
        });
        
        System.out.println("Test Case Pass: Hệ thống đã chặn thành công đơn hàng quá tải!");
    }
}