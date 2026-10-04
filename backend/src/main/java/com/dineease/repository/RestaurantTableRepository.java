package com.dineease.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import com.dineease.entity.RestaurantTable;
import com.dineease.entity.TableStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    
    List<RestaurantTable> findByRestaurantOwnerEmail(String email);

    // ĐÃ VÁ LỖ HỔNG: Trừ đi các bàn bị xóa mềm (HIDDEN) và các bàn đang Báo hỏng (MAINTENANCE)
    @Query("SELECT COALESCE(SUM(t.capacity), 0) FROM RestaurantTable t WHERE t.restaurant.id = :restaurantId AND t.status NOT IN ('HIDDEN', 'MAINTENANCE')")
    Integer getTotalCapacityByRestaurantId(@Param("restaurantId") Long restaurantId);

    // [VÁ LỖ HỔNG BÀN CHẾT]: Cập nhật trạng thái cho cả cụm bàn (Bao gồm bàn Master và các bàn con)
    @Modifying
    @Query("UPDATE RestaurantTable t SET t.status = :status WHERE t.id = :masterId OR t.mergedId = :masterId")
    void updateStatusForTableGroup(@Param("masterId") Long masterId, @Param("status") TableStatus status);

    // 4. Giải phóng vật lý toàn bộ sơ đồ bàn (Trừ các bàn đang Báo hỏng hoặc Bị ẩn)
    @Modifying
    @Query("UPDATE RestaurantTable t SET t.status = 'AVAILABLE' WHERE t.status IN ('OCCUPIED', 'RESERVED', 'CLEANING')")
    int forceResetAllTables();

    // Lấy tất cả bàn có cùng mergedId hoặc chính là bàn Master
    @Query("SELECT t FROM RestaurantTable t WHERE t.id = :masterId OR t.mergedId = :masterId")
    List<RestaurantTable> findAllInGroup(@Param("masterId") Long masterId);
}