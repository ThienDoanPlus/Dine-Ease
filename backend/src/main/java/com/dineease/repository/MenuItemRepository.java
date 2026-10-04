package com.dineease.repository;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dineease.entity.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.restaurant.id = :restaurantId")
    List<MenuItem> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @EntityGraph(attributePaths = {"category"})
    List<MenuItem> findByRestaurantOwnerEmail(String email);

    // Tìm món ăn theo tên (Chỉ lấy món Đang bán và Quán đang hoạt động)
    @Query("SELECT m FROM MenuItem m JOIN FETCH m.restaurant r WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND m.status = 'AVAILABLE' AND r.status = 'ACTIVE'")
    List<MenuItem> searchAvailableMenuItems(@Param("keyword") String keyword);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE MenuItem m SET m.isBestseller = false WHERE m.restaurant.id = :restaurantId")
    void resetBestsellerStatusByRestaurantId(@Param("restaurantId") Long restaurantId);

    // [VÁ LỖ HỔNG AVG PRICE]: Tính trung bình giá các món ĐANG BÁN
    @Query("SELECT AVG(m.price) FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.status != 'HIDDEN'")
    java.math.BigDecimal getAveragePriceByRestaurantId(@Param("restaurantId") Long restaurantId);
}
