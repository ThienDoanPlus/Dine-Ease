package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.dto.FloorPlanSyncRequest;
import com.dineease.dto.TableRequest;
import com.dineease.entity.OrderStatus;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantTable;
import com.dineease.entity.TableStatus;
import com.dineease.repository.OrderRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;

@ExtendWith(MockitoExtension.class)
public class ManageTableServiceTest {

    @Mock private RestaurantTableRepository tableRepository;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private OrderRepository orderRepository; 


    @InjectMocks private ManageTableService manageTableService;

    @Test
    @DisplayName("Nghiệp vụ Sơ đồ: Không cho phép tách bàn (Unmerge) khi cụm bàn đang có khách")
    void syncFloorPlan_ShouldThrowException_WhenUnmergingOccupiedTable() {
        // 1. ARRANGE
        String email = "manager@test.com";
        Restaurant mockRes = Restaurant.builder().id(100L).build();
        when(restaurantRepository.findByOwnerEmail(email)).thenReturn(Optional.of(mockRes));

        // Bàn 2 đang gộp vào Bàn 1 (Master ID = 1L)
        // Code của Đoan sẽ lấy mergedId (1L) để đi check Order
        RestaurantTable tableInDb = RestaurantTable.builder()
                .id(2L)
                .tableName("Bàn 002")
                .mergedId(1L) // <--- MASTER ID LÀ 1
                .status(TableStatus.OCCUPIED)
                .build();
        
        when(tableRepository.findByRestaurantOwnerEmail(email)).thenReturn(List.of(tableInDb));
        
        // GIẢ LẬP: Phải dùng chính xác 1L và OrderStatus.OPEN (khớp với log báo lỗi)
        // Nếu bạn không chắc chắn ID là bao nhiêu, có thể dùng anyLong() và any()
        when(orderRepository.existsByTableIdAndStatus(eq(1L), eq(OrderStatus.OPEN))).thenReturn(true);

        // Frontend gửi yêu cầu sync: Bàn 2 có ID là "t_2", muốn tách ra nên để mergedId = null
        TableRequest requestFromFe = new TableRequest(
            "t_2", 
            "Bàn 002", 
            4, 
            100.0, 100.0, 80.0, 80.0, "rect", 0.0, "1_main", 
            null, // Đòi tách bàn
            "OCCUPIED"
        );
        FloorPlanSyncRequest syncReq = new FloorPlanSyncRequest(List.of(requestFromFe), "[]");

        // 2. ACT & 3. ASSERT
        assertThrows(IllegalStateException.class, () -> {
            manageTableService.syncFloorPlan(syncReq, email);
        });

        System.out.println("Test Case 12 Pass: Đã khớp tham số Mock và chặn tách bàn thành công!");
    }
}