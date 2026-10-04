package com.dineease.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dineease.entity.Payment;
import jakarta.persistence.LockModeType;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // [CỦA KHOA]: Tìm giao dịch thanh toán bình thường
    Optional<Payment> findByTransactionCode(String transactionCode);
    Optional<Payment> findByReservationId(Long reservationId);

    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: KHÓA BI QUAN (PESSIMISTIC LOCK)
    // ==========================================
    // Khóa dòng dữ liệu dưới DB cho đến khi Transaction kết thúc
    // Ứng dụng: Chống race-condition khi VNPay gọi Webhook nhiều lần cùng lúc
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.transactionCode = :code")
    Optional<Payment> findByTransactionCodeWithLock(@Param("code") String code);
    // [VÁ LỖ HỔNG DOUBLE REVENUE]: Kiểm tra xem Đơn đặt bàn đã được thanh toán hoàn tất chưa
    boolean existsByReservationIdAndPaymentType(Long reservationId, com.dineease.entity.PaymentType paymentType);
}