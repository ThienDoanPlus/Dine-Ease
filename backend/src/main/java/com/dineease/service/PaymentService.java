package com.dineease.service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.config.VnpayConfig;
import com.dineease.dto.PaymentUrlResponse;
import com.dineease.entity.Payment;
import com.dineease.entity.PaymentMethod;
import com.dineease.entity.PaymentStatus;
import com.dineease.entity.PaymentType;
import com.dineease.entity.Reservation;
import com.dineease.entity.ReservationStatus;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.PaymentRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.util.VnpayUtil;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final VnpayConfig vnpayConfig;

    public PaymentService(ReservationRepository reservationRepository, PaymentRepository paymentRepository, VnpayConfig vnpayConfig) {
        this.reservationRepository = reservationRepository;
        this.paymentRepository = paymentRepository;
        this.vnpayConfig = vnpayConfig;
    }

    @Transactional
    public PaymentUrlResponse createVnpayPaymentUrl(Long reservationId, String customerEmail, HttpServletRequest request) {
        Reservation reservation = reservationRepository.findByIdAndCustomerEmail(reservationId, customerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt bàn không tồn tại hoặc không thuộc về bạn!"));
        if (reservation.getStatus() != ReservationStatus.AWAITING_DEPOSIT) {
            throw new IllegalStateException("Đơn hàng không ở trạng thái chờ thanh toán cọc!");
        }
        
        // [CỦA KHOA]: Tính tiền cọc bằng BigDecimal
        BigDecimal deposit = reservation.getDepositAmount();
        long amountValue = 100000L; 
        if (deposit != null && deposit.compareTo(BigDecimal.ZERO) > 0) {
            amountValue = deposit.longValue(); 
        }
        
        long vnpAmount = amountValue * 100L; 
        String vnp_TxnRef = reservation.getId() + "_" + System.currentTimeMillis();
        String vnp_IpAddr = VnpayUtil.getIpAddress(request);
        String vnp_OrderInfo = "Thanh toan dat coc cho don hang " + reservationId;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue,StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName,StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue,StandardCharsets.US_ASCII));
                if(itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String vnp_SecureHash = VnpayUtil.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        Payment payment = Payment.builder() 
                .reservation(reservation)
                .paymentType(PaymentType.DEPOSIT)
                .paymentMethod(PaymentMethod.VNPAY)
                .status(PaymentStatus.PENDING)
                .amount(new BigDecimal(amountValue)) // Lưu đúng số tiền thật xuống DB
                .transactionCode(vnp_TxnRef)
                .build();
        paymentRepository.save(payment);
 
        return new PaymentUrlResponse(vnpayConfig.getPayUrl() + "?" + query.toString());
    }

    @Transactional
    public void processVnpayIpn(Map<String, String> vnp_Params) {
        try {
            String vnp_SecureHash = vnp_Params.get("vnp_SecureHash");
            vnp_Params.remove("vnp_SecureHash");
            vnp_Params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();

            for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    if (itr.hasNext()) hashData.append('&');
                }
            }

            String computedSignature = VnpayUtil.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());

            if (computedSignature.equals(vnp_SecureHash)) {
                String vnp_TxnRef = vnp_Params.get("vnp_TxnRef");
                
                // [TÍCH HỢP TỪ YẾN]: Dùng Lock DB để chống nạp đúp
                Payment payment = paymentRepository.findByTransactionCodeWithLock(vnp_TxnRef)
                        .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại: " + vnp_TxnRef));

                if (payment.getStatus() == PaymentStatus.SUCCESS) return;

                // ==========================================================
                // [TÍCH HỢP TỪ YẾN]: CHỐNG GIAN LẬN SỬA SỐ TIỀN (BURP SUITE)
                // ==========================================================
                BigDecimal vnpAmount = new BigDecimal(vnp_Params.get("vnp_Amount")); // Tiền VNPay trả về
                BigDecimal dbAmountAtVnpayUnit = payment.getAmount().multiply(new BigDecimal("100")); // Tiền gốc * 100

                if (vnpAmount.compareTo(dbAmountAtVnpayUnit) != 0) {
                    log.error("🚨 CẢNH BÁO GIAN LẬN: Số tiền không khớp! Mã GD: {}. DB: {}, VNPay: {}",
                            vnp_TxnRef, dbAmountAtVnpayUnit.toPlainString(), vnpAmount.toPlainString());
                    
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    throw new IllegalArgumentException("Invalid Amount: Số tiền thanh toán bị sai lệch do can thiệp!");
                }
                // ==========================================================

                if ("00".equals(vnp_Params.get("vnp_ResponseCode"))) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    Reservation reservation = payment.getReservation();
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                    reservationRepository.save(reservation);
                    log.info("Thanh toán VNPay thành công. Kích hoạt đơn: {}", reservation.getId());
                } else {
                    payment.setStatus(PaymentStatus.FAILED);
                }
                paymentRepository.save(payment);
            } else {
                log.error("NGUY HIỂM: Chữ ký IPN của VNPay không hợp lệ (Bị giả mạo)!");
            }
        } catch (Exception e) {
            log.error("Lỗi xử lý IPN của VNPay: {}", e.getMessage());
        }
    }   
}
