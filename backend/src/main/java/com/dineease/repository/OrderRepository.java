package com.dineease.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import com.dineease.entity.Order;
import com.dineease.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByRestaurantOwnerEmailAndStatus(String email, OrderStatus status);
    
    Optional<Order> findByOrderCode(String orderCode);

    // [VÁ LỖ HỔNG KẾ TOÁN]: Chỉ cộng hoa hồng của khách vãng lai (Không nối với Đặt bàn)
    @Query("SELECT COALESCE(SUM(o.commissionAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.reservation IS NULL")
    BigDecimal calculateTotalCommissionFromPOS();

    // [VÁ LỖ HỔNG KẾ TOÁN]: Chỉ cộng hoa hồng của khách vãng lai (Không nối với Đặt bàn)
    @Query("SELECT COALESCE(SUM(o.commissionAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.reservation IS NULL AND (:startDate IS NULL OR o.createdAt >= :startDate) AND (:endDate IS NULL OR o.createdAt <= :endDate)")
    BigDecimal calculateTotalCommissionFromPOSByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);


    // Tính tổng doanh thu theo khoảng thời gian
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.restaurant.owner.email = :email AND o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    BigDecimal sumRevenueByDate(@Param("email") String email, @Param("startDate") java.time.Instant startDate);

    // Đếm số lượng đơn hàng
    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.owner.email = :email AND o.createdAt >= :startDate")
    Long countOrdersByDate(@Param("email") String email, @Param("startDate") java.time.Instant startDate);

    // Lấy danh sách giao dịch gần nhất
    @Query("SELECT o FROM Order o WHERE o.restaurant.owner.email = :email ORDER BY o.createdAt DESC")
    java.util.List<Order> findRecentOrders(@Param("email") String email, org.springframework.data.domain.Pageable pageable);

    // [VÁ LỖ HỔNG XUNG ĐỘT POS - ĐẶT BÀN]
    // Kiểm tra xem Bàn này có đang dính Hóa đơn POS nào chưa thanh toán không?
    boolean existsByTableIdAndStatus(Long tableId, OrderStatus status);

    // Dùng để kiểm tra xem bàn này đã có Hóa đơn nào đang MỞ hay chưa
    java.util.Optional<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);

    // 3. Dọn dẹp các Hóa đơn POS Thu ngân quên tính tiền
    @Modifying
    @Query("UPDATE Order o SET o.status = 'CANCELLED', o.surchargeNote = '[Hệ thống tự động hủy Bill treo]' WHERE o.status = 'OPEN' AND o.createdAt < :startOfToday")
    int autoCancelStalePosOrders(@Param("startOfToday") java.time.Instant startOfToday);

    // Lấy toàn bộ đơn hàng trong khoản thời gian để Java tự GroupBy vẽ Biểu đồ
    @Query("SELECT o FROM Order o WHERE o.restaurant.owner.email = :email AND o.status = 'COMPLETED' AND o.createdAt >= :startDate ORDER BY o.createdAt ASC")
    List<Order> findCompletedOrdersSinceForChart(@Param("email") String email, @Param("startDate") Instant startDate);
}

