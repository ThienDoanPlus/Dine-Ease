package com.dineease.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;


import com.dineease.entity.CustomerProfile;
import com.dineease.entity.Reservation;
import com.dineease.entity.ReservationStatus;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByCustomer(CustomerProfile customer, Pageable pageable); 

    // THÊM DÒNG NÀY ĐỂ TÌM KHÁCH ĐANG NGỒI TẠI BÀN
    Optional<Reservation> findFirstByAssignedTableIdAndStatus(Long tableId, ReservationStatus status);

    @EntityGraph(attributePaths = {"customer", "customer.user", "assignedTable"})
    Page<Reservation> findByRestaurantOwnerEmail(String email, Pageable pageable);

    Optional<Reservation> findByIdAndRestaurantOwnerEmail(Long id, String email);

    @Query("""
        SELECT COALESCE(SUM(r.guestCount), 0) 
        FROM Reservation r 
        WHERE r.restaurant.id = :restaurantId 
          AND r.reservationDate = :reservationDate 
          AND r.reservationTime > :startBoundary 
          AND r.reservationTime < :endBoundary
          AND r.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
    """)
    Integer getTotalReservedGuestsForTimeRange(
        @Param("restaurantId") Long restaurantId,
        @Param("reservationDate") LocalDate reservationDate,
        @Param("startBoundary") LocalTime startBoundary,
        @Param("endBoundary") LocalTime endBoundary
    );

    @Query("SELECT r FROM Reservation r WHERE r.id = :id AND r.customer.user.email = :email")
    Optional<Reservation> findByIdAndCustomerEmail(@Param("id") Long id, @Param("email") String email);

    long countByStatus(ReservationStatus status);

    @Query("SELECT COALESCE(SUM(r.commissionAmount), 0) FROM Reservation r WHERE r.status = :status")
    BigDecimal calculateTotalCommissionByStatus(@Param("status") ReservationStatus status);

    @Query("SELECT r.restaurant.cuisine.name, COUNT(r.id) FROM Reservation r WHERE r.status = 'COMPLETE' GROUP BY r.restaurant.cuisine.name")
    List<Object[]> countReservationsByCuisine();

    @Query("SELECT r.reservationDate, SUM(r.commissionAmount), COUNT(r.id) FROM Reservation r WHERE r.status = 'COMPLETE' GROUP BY r.reservationDate ORDER BY r.reservationDate DESC")
    List<Object[]> getDailyRevenueAndOrders(Pageable pageable);

    // [ĐÃ FIX]: Bỏ cast() để CSDL nhận diện đúng điều kiện lọc
    @Query("SELECT COUNT(r) FROM Reservation r WHERE (:startDate IS NULL OR r.reservationDate >= :startDate) AND (:endDate IS NULL OR r.reservationDate <= :endDate)")
    long countReservationsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = 'COMPLETE' AND (:startDate IS NULL OR r.reservationDate >= :startDate) AND (:endDate IS NULL OR r.reservationDate <= :endDate)")
    long countSuccessfulReservationsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(r.commissionAmount), 0) FROM Reservation r WHERE r.status = 'COMPLETE' AND (:startDate IS NULL OR r.reservationDate >= :startDate) AND (:endDate IS NULL OR r.reservationDate <= :endDate)")
    BigDecimal calculateCommissionByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // ==========================================================
    // [BỔ SUNG]: TÍNH NĂNG TOP RANKING (XẾP HẠNG NHÀ HÀNG)
    // ==========================================================
    
    // 1. Top nhà hàng có doanh thu cao nhất (Dựa trên tổng tiền thanh toán của đơn COMPLETE)
    @Query("SELECT r.restaurant.id, r.restaurant.name, SUM(r.finalTotalAmount), COUNT(r.id) " +
           "FROM Reservation r WHERE r.status = 'COMPLETE' " +
           "GROUP BY r.restaurant.id, r.restaurant.name " +
           "ORDER BY SUM(r.finalTotalAmount) DESC")
    List<Object[]> findTopRevenueRestaurants(Pageable pageable);

    // 2. Top nhà hàng có tỷ lệ hủy đơn cao nhất (Dựa trên tổng số đơn CANCELLED)
    @Query("SELECT r.restaurant.id, r.restaurant.name, COUNT(r.id) " +
           "FROM Reservation r WHERE r.status = 'CANCELLED' " +
           "GROUP BY r.restaurant.id, r.restaurant.name " +
           "ORDER BY COUNT(r.id) DESC")
    List<Object[]> findTopCancelledRestaurants(Pageable pageable);

    // [VÁ LỖ HỔNG TRÀN RAM]: Bắt buộc lọc theo targetDate để không kéo 10.000 đơn cũ lên
    @Query("SELECT r FROM Reservation r " +
           "LEFT JOIN FETCH r.customer c LEFT JOIN FETCH c.user u " +
           "LEFT JOIN FETCH r.assignedTable t " +
           "WHERE r.restaurant.owner.email = :email " +
           "AND r.reservationDate = :targetDate " + // <--- THÊM ĐIỀU KIỆN NÀY
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.walkInCustomerName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Reservation> findReservationsForKanban(
            @Param("email") String email, 
            @Param("keyword") String keyword, 
            @Param("targetDate") java.time.LocalDate targetDate); // <--- THÊM PARAM NÀY

    // 1. Dọn dẹp đơn Lễ tân quên chốt (Khách đã ngồi vào bàn) -> Chuyển thành COMPLETE (0đ)
    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'COMPLETE', r.finalTotalAmount = 0, r.commissionAmount = 0, r.cancelReason = '[Hệ thống tự động chốt do nhân viên quên]' WHERE r.status = 'CHECKED_IN' AND r.reservationDate < :today")
    int autoCompleteStaleCheckedIn(@Param("today") java.time.LocalDate today);

    // 2. Dọn dẹp đơn khách Book nhưng không tới (No-show) -> Chuyển thành CANCELLED
    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'CANCELLED', r.cancelReason = '[Hệ thống tự động hủy do quá hạn]' WHERE r.status IN ('PENDING', 'AWAITING_DEPOSIT', 'CONFIRMED') AND r.reservationDate < :today")
    int autoCancelStalePending(@Param("today") java.time.LocalDate today);
}