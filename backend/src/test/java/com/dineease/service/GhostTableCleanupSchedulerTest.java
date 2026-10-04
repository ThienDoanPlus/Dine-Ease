package com.dineease.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.repository.OrderRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantTableRepository;

@ExtendWith(MockitoExtension.class)
public class GhostTableCleanupSchedulerTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private RestaurantTableRepository tableRepository;

    @InjectMocks private GhostTableCleanupScheduler cleanupScheduler;

    @Test
    @DisplayName("TC-21: Dọn dẹp bàn ma - Phải gọi đúng các hàm quét đơn treo và giải phóng bàn")
    void cleanupGhostTables_ShouldInvokeAllCleanupMethods() {
        // ACT
        cleanupScheduler.cleanupGhostTablesAndStaleOrders();

        // ASSERT - Kiểm tra xem Scheduler có gọi đủ 4 "nhát chổi" quét rác không
        verify(reservationRepository).autoCompleteStaleCheckedIn(any());
        verify(reservationRepository).autoCancelStalePending(any());
        verify(orderRepository).autoCancelStalePosOrders(any());
        verify(tableRepository).forceResetAllTables();
        
        System.out.println("TC-21 Pass: Robot dọn dẹp đã hoạt động đúng quy trình!");
    }
}
