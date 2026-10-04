package com.dineease.service;

import com.dineease.dto.TopSellingItemResponse;
import com.dineease.dto.RestaurantDashboardResponse;
import com.dineease.dto.TransactionHistoryResponse;
import com.dineease.entity.MenuItem;
import com.dineease.entity.Order;
import com.dineease.repository.OrderItemRepository;
import com.dineease.repository.OrderRepository;
import com.dineease.repository.RestaurantTableRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ManageReportService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;

    public ManageReportService(OrderItemRepository orderItemRepository, 
                               OrderRepository orderRepository,
                               RestaurantTableRepository tableRepository,
                               ReservationRepository reservationRepository,
                               RestaurantRepository restaurantRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.reservationRepository = reservationRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional(readOnly = true)
    public List<TopSellingItemResponse> getTopSellingItems(String email) {
        // ... code giữ nguyên ...
        // 1. Lấy tổng số lượng tất cả các món đã bán để chia phần trăm
        Long totalSoldItems = orderItemRepository.getTotalQuantitySoldByRestaurant(email);
        if (totalSoldItems == 0) totalSoldItems = 1L; // Tránh chia cho 0

        // 2. Lấy Top 5 món bán chạy nhất
        List<Object[]> topItemsData = orderItemRepository.findTopSellingItems(email, PageRequest.of(0, 5));
        
        List<TopSellingItemResponse> response = new ArrayList<>();
        
        for (Object[] row : topItemsData) {
            MenuItem item = (MenuItem) row[0];
            Long soldQty = (Long) row[1];
            
            // Tính phần trăm
            int percent = (int) Math.round((soldQty * 100.0) / totalSoldItems);
            
            // Lấy ảnh đầu tiên (Sử dụng kiến trúc 1-N đã sửa ở bước trước)
            String imgUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
            if (item.getImages() != null && !item.getImages().isEmpty()) {
                imgUrl = item.getImages().get(0).getImageUrl();
            }

            response.add(new TopSellingItemResponse(
                item.getId(),
                item.getName(),
                soldQty,
                percent,
                imgUrl
            ));
        }

        return response;
    }

    @Transactional(readOnly = true)
    public RestaurantDashboardResponse getDashboardOverview(String email, String period) {
        Instant startDate;
        Instant now = Instant.now();
        
        if ("week".equalsIgnoreCase(period)) {
            startDate = now.minus(7, ChronoUnit.DAYS);
        } else if ("month".equalsIgnoreCase(period)) {
            startDate = now.minus(30, ChronoUnit.DAYS);
        } else {
            // Mặc định là "today" (Lấy từ 00:00 hôm nay)
            startDate = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).atStartOfDay(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
        }

        java.math.BigDecimal totalRevenue = orderRepository.sumRevenueByDate(email, startDate);
        Long newOrders = orderRepository.countOrdersByDate(email, startDate);

        // Tính Tỷ lệ lấp đầy (Occupancy Rate) hiện tại
        com.dineease.entity.Restaurant restaurant = restaurantRepository.findByOwnerEmail(email).orElse(null);
        int occupancyRate = 0;
        int totalGuests = 0;
        
        if (restaurant != null) {
            Integer totalCapacity = tableRepository.getTotalCapacityByRestaurantId(restaurant.getId());
            if (totalCapacity != null && totalCapacity > 0) {
                Integer reservedGuests = reservationRepository.getTotalReservedGuestsForTimeRange(
                        restaurant.getId(), 
                        LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")), 
                        LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).minusHours(2), 
                        LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusHours(2));
                
                totalGuests = reservedGuests != null ? reservedGuests : 0;
                occupancyRate = (int) Math.round((totalGuests * 100.0) / totalCapacity);
            }
        }

        // ==========================================================
        // [VÁ LỖ HỔNG BIỂU ĐỒ RANDOM]: TÍNH DỮ LIỆU NHÓM THEO THỜI GIAN THỰC TẾ
        // ==========================================================
        List<Order> chartOrders = orderRepository.findCompletedOrdersSinceForChart(email, startDate);
        Map<String, java.math.BigDecimal> groupedData = new java.util.LinkedHashMap<>(); // LinkedHashMap giữ thứ tự chèn
        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");

        // 1. Khởi tạo các mốc thời gian rỗng để biểu đồ không bị gãy khúc
        if ("today".equalsIgnoreCase(period)) {
            // Hiển thị từ 6h sáng đến 23h
            for (int i = 6; i <= 23; i++) {
                groupedData.put(String.format("%02d:00", i), java.math.BigDecimal.ZERO);
            }
        } else {
            // Hiển thị theo từng ngày
            int days = "week".equals(period) ? 7 : 30;
            for (int i = days - 1; i >= 0; i--) {
                LocalDate d = LocalDate.now(zone).minusDays(i);
                groupedData.put(String.format("%02d/%02d", d.getDayOfMonth(), d.getMonthValue()), java.math.BigDecimal.ZERO);
            }
        }

        // 2. Nhồi dữ liệu thực tế vào các mốc
        DateTimeFormatter hourFormatter = DateTimeFormatter.ofPattern("HH:00").withZone(zone);
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd/MM").withZone(zone);

        for (Order o : chartOrders) {
            String timeKey = "today".equalsIgnoreCase(period) 
                    ? hourFormatter.format(o.getCreatedAt()) 
                    : dayFormatter.format(o.getCreatedAt());

            // Chỉ cộng dồn nếu mốc thời gian đó có nằm trong Map (Bỏ qua các giờ khuya)
            if (groupedData.containsKey(timeKey)) {
                java.math.BigDecimal currentVal = groupedData.get(timeKey);
                groupedData.put(timeKey, currentVal.add(o.getTotalAmount()));
            }
        }

        // 3. Convert sang Format trả về cho Recharts của Frontend
        List<Map<String, Object>> chartData = new ArrayList<>();
        for (Map.Entry<String, java.math.BigDecimal> entry : groupedData.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("time", entry.getKey());
            point.put("revenue", entry.getValue().longValue()); // Ép về long để tránh tràn số và giúp Frontend parse chuẩn
            chartData.add(point);
        }

        return new RestaurantDashboardResponse(
            totalRevenue != null ? totalRevenue : java.math.BigDecimal.ZERO, 
            totalGuests, 
            newOrders, 
            Math.min(occupancyRate, 100), 
            chartData
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionHistoryResponse> getRecentTransactions(String email) {
        List<Order> recentOrders = orderRepository.findRecentOrders(email, PageRequest.of(0, 10));
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

        return recentOrders.stream().map(o -> {
            String itemsSummary = o.getOrderItems().stream()
                    .map(oi -> oi.getMenuItem().getName())
                    .limit(2) // Lấy 2 món đầu tiên
                    .collect(Collectors.joining(", ")) + (o.getOrderItems().size() > 2 ? "..." : "");

            String methodStr = "Tiền mặt";
            String typeStr = "cash";
            if (o.getPayments() != null && !o.getPayments().isEmpty()) {
                String pm = o.getPayments().get(0).getPaymentMethod().name();
                if ("VNPAY".equals(pm)) { methodStr = "VNPay"; typeStr = "card"; }
                else if ("MOMO".equals(pm)) { methodStr = "MoMo"; typeStr = "momo"; }
                // [BỔ SUNG CHO ENUM MỚI]
                else if ("CARD".equals(pm)) { methodStr = "Quẹt thẻ"; typeStr = "card"; }
                else if ("QR_CODE".equals(pm)) { methodStr = "Quét QR"; typeStr = "qr"; }
                else if ("VOUCHER".equals(pm)) { methodStr = "Voucher/Đã cọc"; typeStr = "voucher"; }

            }

            String statusStr = "Đang chờ";
            if ("COMPLETED".equals(o.getStatus().name())) statusStr = "Hoàn tất";
            else if ("CANCELLED".equals(o.getStatus().name())) statusStr = "Đã hủy";

            return new TransactionHistoryResponse(
                o.getOrderCode(), methodStr, typeStr,
                timeFormatter.format(o.getCreatedAt()), itemsSummary,
                o.getTotalAmount() != null ? o.getTotalAmount() : java.math.BigDecimal.ZERO, statusStr
            );
        }).collect(Collectors.toList());
    }
}
