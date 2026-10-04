package com.dineease.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.dineease.entity.OrderItem;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Đếm tổng số lượng món ăn đã bán ra của 1 nhà hàng
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
           "WHERE oi.order.restaurant.owner.email = :email " +
           "AND oi.order.status = 'COMPLETED'")
    Long getTotalQuantitySoldByRestaurant(@Param("email") String email);

    // Lấy Top món ăn bán chạy nhất, xếp giảm dần theo số lượng
    @Query("SELECT oi.menuItem, SUM(oi.quantity) as totalSold " +
           "FROM OrderItem oi " +
           "WHERE oi.order.restaurant.owner.email = :email " +
           "AND oi.order.status = 'COMPLETED' " +
           "GROUP BY oi.menuItem " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingItems(@Param("email") String email, Pageable pageable);

    @Query("SELECT oi.menuItem, SUM(oi.quantity) as totalSold " +
           "FROM OrderItem oi " +
           "WHERE oi.order.restaurant.id = :restaurantId " +
           "AND oi.order.status = 'COMPLETED' " +
           "AND oi.order.createdAt >= :startDate " +
           "GROUP BY oi.menuItem " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingItemsByRestaurantIdIn30Days(@Param("restaurantId") Long restaurantId, @Param("startDate") java.time.Instant startDate, Pageable pageable);
}

