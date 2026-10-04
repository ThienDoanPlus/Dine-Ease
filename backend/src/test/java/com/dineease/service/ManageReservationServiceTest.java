package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.dto.FloorPlanSyncRequest;
import com.dineease.dto.KanbanBoardResponse;
import com.dineease.dto.TableRequest;
import com.dineease.entity.OrderStatus;
import com.dineease.entity.Reservation;
import com.dineease.entity.ReservationStatus;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantTable;
import com.dineease.entity.TableStatus;
import com.dineease.repository.OrderRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;

@ExtendWith(MockitoExtension.class)
public class ManageReservationServiceTest {
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private RestaurantTableRepository tableRepository; 
    @Mock private OrderRepository orderRepository;
    @Mock private ManageTableService manageTableService; 
    @InjectMocks 
    private ManageReservationService manageReservationService; 
    @Mock private ReservationRepository reservationRepository; 


    @Test
    @DisplayName("Nghiệp vụ Kanban: Phải phân loại đúng trạng thái đơn vào 3 cột hiển thị")
    void getKanbanBoardData_ShouldCategorizeCorrectly() {
        // 1. ARRANGE
        String email = "owner.yume@gmail.com";
        LocalDate date = LocalDate.now();

        // Giả lập 3 đơn với 3 trạng thái khác nhau
        Reservation res1 = Reservation.builder().id(1L).status(ReservationStatus.PENDING).build();
        Reservation res2 = Reservation.builder().id(2L).status(ReservationStatus.CHECKED_IN).build();
        Reservation res3 = Reservation.builder().id(3L).status(ReservationStatus.CANCELLED).build();

        when(reservationRepository.findReservationsForKanban(eq(email), any(), eq(date)))
                .thenReturn(List.of(res1, res2, res3));

        // 2. ACT
        KanbanBoardResponse response = manageReservationService.getKanbanBoardData(email, null, date);

        // 3. ASSERT
        assertEquals(1, response.pending().size(), "Cột Yêu cầu mới phải có 1 đơn");
        assertEquals(1, response.confirmed().size(), "Cột Đã xác nhận phải có 1 đơn");
        assertEquals(1, response.finalCol().size(), "Cột Hoàn thành/Hủy phải có 1 đơn");
        
        System.out.println("Test Case 11 Pass: Dữ liệu Kanban đã được phân loại chuẩn xác!");
    }

    
}
