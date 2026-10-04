package com.dineease.service;

import com.dineease.repository.OrderRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantTableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@Component
public class GhostTableCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(GhostTableCleanupScheduler.class);

    private final ReservationRepository reservationRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;

    public GhostTableCleanupScheduler(ReservationRepository reservationRepository,
                                      OrderRepository orderRepository,
                                      RestaurantTableRepository tableRepository) {
        this.reservationRepository = reservationRepository;
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
    }

    // Cronjob chạy vào đúng 03:00:00 Sáng mỗi ngày
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupGhostTablesAndStaleOrders() {
        log.info("🧹 [CRONJOB 03:00 AM] Bắt đầu rà soát và dọn dẹp 'Bàn ma' trên toàn hệ thống...");

        // 1. Lấy mốc thời gian chuẩn của Việt Nam
        ZoneId vnZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(vnZone);
        Instant startOfToday = today.atStartOfDay(vnZone).toInstant();

        try {
            // 2. Chốt các Đơn đặt bàn khách đã Check-in nhưng Lễ tân quên bấm Hoàn thành
            int checkedInCleared = reservationRepository.autoCompleteStaleCheckedIn(today);
            log.info("   -> Đã tự động CHỐT {} đơn Đặt bàn bị treo ở trạng thái CHECKED_IN.", checkedInCleared);

            // 3. Hủy các Đơn đặt bàn khách hẹn nhưng không tới (No-show)
            int pendingCleared = reservationRepository.autoCancelStalePending(today);
            log.info("   -> Đã tự động HỦY {} đơn Đặt bàn quá hạn (No-show).", pendingCleared);

            // 4. Hủy các Bill POS thu ngân quên tính tiền
            int posCleared = orderRepository.autoCancelStalePosOrders(startOfToday);
            log.info("   -> Đã tự động HỦY {} hóa đơn POS bị treo ở trạng thái OPEN.", posCleared);

            // 5. Giải phóng sơ đồ bàn vật lý (Force Reset)
            int tablesReset = tableRepository.forceResetAllTables();
            log.info("   -> Đã CƯỠNG CHẾ GIẢI PHÓNG {} bàn vật lý về trạng thái TRỐNG.", tablesReset);

            log.info("✅ [CRONJOB] Hoàn tất dọn dẹp dữ liệu rác thành công!");

        } catch (Exception e) {
            log.error("❌ [CRONJOB LỖI] Sự cố xảy ra khi dọn dẹp Bàn ma: {}", e.getMessage(), e);
        }
    }
}
