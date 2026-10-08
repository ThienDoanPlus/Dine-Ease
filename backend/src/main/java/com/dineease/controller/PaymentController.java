package com.dineease.controller;

import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import com.dineease.dto.PaymentUrlResponse;
import com.dineease.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;

@Tag(name = "Customer - Payment", description = "Tạo thanh toán VNPay và Xử lý Webhook IPN")
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final PaymentService paymentService;
    
    // [CỦA YẾN]: URL của Frontend ReactJS
    @Value("${app.frontend.url:http://localhost:3000}")
    private String FRONTEND_URL; 

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    

    @Operation(summary = "Tạo Link Thanh toán VNPay", description = "Tạo URL để chuyển hướng khách sang cổng VNPay.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create-url/vnpay/{reservationId}")
    public ResponseEntity<PaymentUrlResponse> createVnpayPaymentUrl(
        @PathVariable Long reservationId,
        Authentication auth,
        HttpServletRequest request 
    ) {
        String email = auth.getName();
        PaymentUrlResponse response = paymentService.createVnpayPaymentUrl(reservationId, email, request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Webhook (IPN) nhận kết quả từ VNPay", description = "API Public. Dành riêng cho Server VNPay gọi về để báo kết quả. Bảo mật bằng HmacSHA512.")
    @GetMapping("/webhook/vnpay")
    public ResponseEntity<String> processVnpayIpn(@RequestParam Map<String,String> allParams) {
        paymentService.processVnpayIpn(allParams);
        return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"ConfirmSuccess\"}");
    }

    // ==========================================================
    // [TÍCH HỢP TỪ YẾN]: HƯỚNG DẪN FRONTEND HIỂN THỊ KẾT QUẢ
    // ==========================================================
    @Operation(summary = "Endpoint xử lý Return URL", description = "Hứng trình duyệt khách hàng sau khi thanh toán xong tại VNPay và chuyển hướng về Frontend.")
    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> processVnpayReturn(@RequestParam Map<String, String> allParams) {
        String vnp_ResponseCode = allParams.get("vnp_ResponseCode");
        String vnp_TxnRef = allParams.get("vnp_TxnRef");
        
        // Tách lấy Reservation ID từ mã giao dịch (Cấu trúc: id + "_" + timestamp)
        String reservationId = vnp_TxnRef.split("_")[0];
        String targetUrl;
        
        // Nếu mã trả về là 00 (Thành công)
        if ("00".equals(vnp_ResponseCode)) {
            targetUrl = FRONTEND_URL + "/user/checkout/" + reservationId + "/success";
        } else {
            // Thất bại hoặc Hủy giao dịch -> Đá về lại bước 3 kèm mã lỗi
            targetUrl = FRONTEND_URL + "/user/checkout/" + reservationId + "/step3?error=" + vnp_ResponseCode;
        }

        // Thực hiện lệnh Redirect 302
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(targetUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}