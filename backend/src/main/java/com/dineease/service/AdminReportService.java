package com.dineease.service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Collections;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import com.dineease.dto.AdminDashboardResponse;
import com.dineease.entity.ReservationStatus;
import com.dineease.entity.RestaurantStatus;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;

@Service
public class AdminReportService {

    private final RestaurantRepository restaurantRepository;
    private final ReservationRepository reservationRepository;
    private final com.dineease.repository.OrderRepository orderRepository;

    public AdminReportService(RestaurantRepository restaurantRepository, 
                              ReservationRepository reservationRepository,
                              com.dineease.repository.OrderRepository orderRepository) {
        this.restaurantRepository = restaurantRepository;
        this.reservationRepository = reservationRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats(LocalDate startDate, LocalDate endDate) {
        // 1. Tổng nhà hàng (Luôn tính tổng tuyệt đối đang hoạt động)
        long totalRestaurants = restaurantRepository.countByStatus(RestaurantStatus.ACTIVE);
        
        // 2 & 3. Tổng đơn và Đơn thành công (Lọc theo ngày)
        long totalReservations = reservationRepository.countReservationsByDateRange(startDate, endDate);
        long successfulReservations = reservationRepository.countSuccessfulReservationsByDateRange(startDate, endDate);
        
        // 4. Hoa hồng (Lọc theo ngày). Chuyển LocalDate sang Instant cho Order (POS)
        Instant startInstant = (startDate != null) ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant endInstant = (endDate != null) ? endDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;

        BigDecimal reservationCommission = reservationRepository.calculateCommissionByDateRange(startDate, endDate);
        BigDecimal posCommission = orderRepository.calculateTotalCommissionFromPOSByDateRange(startInstant, endInstant);

        BigDecimal totalCommissionRevenue = (reservationCommission != null ? reservationCommission : BigDecimal.ZERO)
                .add(posCommission != null ? posCommission : BigDecimal.ZERO);

        return new AdminDashboardResponse(
            totalRestaurants,
            totalReservations,
            successfulReservations,
            totalCommissionRevenue
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCuisineChartData() {
        List<Object[]> results = reservationRepository.countReservationsByCuisine();
        List<Map<String, Object>> chartData = new ArrayList<>();
        
        String[] colors = {"#F59E0B", "#60A5FA", "#10B981", "#F87171", "#8B5CF6", "#14B8A6"};
        int i = 0;

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] != null ? row[0].toString() : "Khác");
            map.put("value", row[1]);
            map.put("color", colors[i % colors.length]);
            chartData.add(map);
            i++;
        }
        return chartData;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenueChartData() {
        // Lấy dữ liệu thực tế từ DB
        List<Object[]> results = reservationRepository.getDailyRevenueAndOrders(PageRequest.of(0, 7));
        
        // Dùng LinkedHashMap để giữ đúng thứ tự ngày (Từ cũ nhất đến hôm nay)
        Map<String, Map<String, Object>> groupedData = new java.util.LinkedHashMap<>();
        java.time.ZoneId zone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        java.time.LocalDate today = java.time.LocalDate.now(zone);

        // 1. Khởi tạo mảng 7 ngày gần nhất, gán mặc định doanh thu = 0, đơn = 0
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate d = today.minusDays(i);
            String dateKey = String.format("%02d/%02d", d.getDayOfMonth(), d.getMonthValue());
            
            Map<String, Object> point = new HashMap<>();
            point.put("name", dateKey);
            point.put("revenue", BigDecimal.ZERO);
            point.put("orders", 0L);
            
            groupedData.put(dateKey, point);
        }

        // 2. Nhồi dữ liệu thực tế đè lên các ngày có đơn hàng
        for (Object[] row : results) {
            java.time.LocalDate date = (java.time.LocalDate) row[0];
            String dateKey = String.format("%02d/%02d", date.getDayOfMonth(), date.getMonthValue());

            if (groupedData.containsKey(dateKey)) {
                Map<String, Object> point = groupedData.get(dateKey);
                point.put("revenue", row[1] != null ? row[1] : BigDecimal.ZERO);
                point.put("orders", row[2] != null ? row[2] : 0L);
            }
        }

        // Trả về mảng đã được chuẩn hóa (Không cần dùng Collections.reverse nữa)
        return new ArrayList<>(groupedData.values());
    }

    // ==========================================================
    // [BỔ SUNG]: LOGIC XỬ LÝ DỮ LIỆU TOP RANKING
    // ==========================================================
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopRevenueRestaurants() {
        // Lấy Top 5 nhà hàng
        List<Object[]> results = reservationRepository.findTopRevenueRestaurants(PageRequest.of(0, 5));
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("name", row[1]);
            map.put("revenue", row[2] != null ? row[2] : 0);
            map.put("totalOrders", row[3]);
            response.add(map);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopCancelledRestaurants() {
        // Lấy Top 5 nhà hàng
        List<Object[]> results = reservationRepository.findTopCancelledRestaurants(PageRequest.of(0, 5));
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("name", row[1]);
            map.put("cancelCount", row[2] != null ? row[2] : 0);
            response.add(map);
        }
        return response;
    }
}