package com.dineease.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.dineease.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReservationRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    boolean existsByReservationId(Long reservationId);

    // [VÁ LỖ HỔNG RATING]: Tính điểm trung bình của nhà hàng
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reservation.restaurant.id = :restaurantId")
    Double getAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);
}