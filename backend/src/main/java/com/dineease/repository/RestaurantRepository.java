package com.dineease.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;


import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantStatus;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    Page<Restaurant> findByStatus (RestaurantStatus status, Pageable pageable); 
    
    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:statuses IS NULL OR r.status IN :statuses)")
    Page<Restaurant> findAllByKeywordAndStatuses(@Param("keyword") String keyword, @Param("statuses") List<RestaurantStatus> statuses, Pageable pageable);
    
    boolean existsByCuisineId(Long cuisineId);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"amenities", "cuisine"})
    Optional<Restaurant> findByOwnerEmail(String ownerEmail);

    long countByStatus(RestaurantStatus status);

    // ==========================================
    // [CỦA KHOA]: DÙNG CHO AI CHATBOT (RAG TOOL)
    // ==========================================
    @Query("SELECT r FROM Restaurant r WHERE r.status = 'ACTIVE' AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Restaurant> searchActiveRestaurants(@Param("keyword") String keyword);

    Optional<Restaurant> findFirstByNameContainingIgnoreCaseAndStatus(String name, RestaurantStatus status);

    // ==========================================
    // [CỦA KHOA]: ADMIN CẬP NHẬT HOA HỒNG HÀNG LOẠT
    // ==========================================
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Restaurant r SET r.commissionRate = :newRate WHERE r.status IN ('ACTIVE', 'APPROVED', 'INACTIVE')")
    int bulkUpdateCommissionRate(@Param("newRate") BigDecimal newRate);

    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: BỘ LỌC TÌM KIẾM PUBLIC TRANG CHỦ
    // ==========================================
    @Query("""
    SELECT DISTINCT r FROM Restaurant r 
    WHERE r.status = 'ACTIVE'
      AND (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:minRating IS NULL OR r.avgRating >= :minRating)
      AND (:maxPrice IS NULL OR r.avgPrice <= :maxPrice)
      AND (COALESCE(:cuisineIds, NULL) IS NULL OR r.cuisine.id IN :cuisineIds)
      AND (COALESCE(:amenityIds, NULL) IS NULL OR 
           (SELECT COUNT(a.id) FROM r.amenities a WHERE a.id IN :amenityIds) = :amenityCount)
    """)
    Page<Restaurant> findByAdvancedSearch(
        @Param("keyword") String keyword,
        @Param("minRating") Double minRating,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("cuisineIds") List<Long> cuisineIds,
        @Param("amenityIds") List<Long> amenityIds,
        @Param("amenityCount") Integer amenityCount,
        Pageable pageable
    );


    // Khóa dòng Database này cho đến khi tính toán xong
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Restaurant r WHERE r.id = :id")
    Optional<Restaurant> findByIdWithPessimisticLock(@Param("id") Long id);

}