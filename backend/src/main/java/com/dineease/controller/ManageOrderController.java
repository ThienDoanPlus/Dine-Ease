package com.dineease.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.dineease.dto.KitchenOrderResponse;
import com.dineease.dto.OrderRequest;
import com.dineease.service.KitchenService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Restaurant - POS & Kitchen", description = "Quản lý Bán hàng tại quầy (POS) và Nhà bếp (KOT)")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/manage")
public class ManageOrderController {

    private final KitchenService kitchenService;

    public ManageOrderController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    // ==========================================
    // NHÓM API NHÀ BẾP (KITCHEN - ĐÃ HOẠT ĐỘNG)
    // ==========================================

    @Operation(summary = "Lấy danh sách phiếu Bếp (KOT đang chờ nấu)")
    @GetMapping("/kitchen/tickets")
    public ResponseEntity<List<KitchenOrderResponse>> getKitchenTickets(Authentication auth) {
        return ResponseEntity.ok(kitchenService.getKitchenTickets(auth.getName()));
    }

    @Operation(summary = "Bếp cập nhật trạng thái TỪNG MÓN (Đang nấu, Đã xong)", 
               description = "Truyền JSON body: { \"status\": \"cooking\" } hoặc \"ready\"")
    @PatchMapping("/kitchen/items/{itemId}/status")
    public ResponseEntity<Void> updateKitchenItemStatus(
            @PathVariable Long itemId, 
            @RequestBody Map<String, String> request,
            Authentication auth) { 
        
        String newStatus = request.getOrDefault("status", "pending");
        kitchenService.updateItemStatus(itemId, newStatus, auth.getName());
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // NHÓM API THU NGÂN POS (CHỜ FRONTEND GẮN VÀO)
    // ==========================================

    @Operation(summary = "Tạo Order mới từ Sơ đồ bàn (POS)")
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request, Authentication auth) { 
        // Gọi thẳng xuống Service, truyền Email người đang thao tác
        kitchenService.createOrder(request, auth.getName());
        return ResponseEntity.ok().build(); 
    }

    @Operation(summary = "Lấy hóa đơn của 1 Bàn (Dành cho POS)")
    @GetMapping("/orders/table/{tableId}")
    public ResponseEntity<com.dineease.dto.TableBillResponse> getTableBill(
            @PathVariable Long tableId, Authentication auth) { 
        
        return ResponseEntity.ok(kitchenService.getTableBill(tableId, auth.getName())); 
    }

    @Operation(summary = "Thu ngân bấm Hoàn tất thanh toán (POS)")
    @PatchMapping("/orders/{id}/checkout")
    public ResponseEntity<?> checkoutOrder(@PathVariable Long id, @RequestBody Map<String, Object> request) { 
        
        // ĐÃ FIX BẢO MẬT: Bỏ hoàn toàn việc nhận tiền từ Client
        // Chỉ nhận phương thức thanh toán (CASH, CARD, MOMO) để sau này thống kê
        String paymentMethod = request.getOrDefault("paymentMethod", "CASH").toString();

        // Gọi Service xử lý (Backend sẽ tự lấy tiền trong DB ra tính toán)
        kitchenService.checkoutPosOrder(id, paymentMethod);
        
        return ResponseEntity.ok().build(); 
    }

    @Operation(summary = "Thêm/Cập nhật phụ phí cho hóa đơn")
    @PatchMapping("/orders/{id}/surcharge")
    public ResponseEntity<?> updateSurcharge(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> request, 
            Authentication auth) { 
        
        String note = request.getOrDefault("note", "").toString();
        String amountStr = request.getOrDefault("amount", "0").toString();
        java.math.BigDecimal amount = new java.math.BigDecimal(amountStr);

        kitchenService.updateOrderSurcharge(id, note, amount, auth.getName());
        return ResponseEntity.ok().build(); 
    }

    @Operation(summary = "Áp dụng giảm giá/Voucher cho hóa đơn")
    @PatchMapping("/orders/{id}/discount")
    public ResponseEntity<?> applyDiscount(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> request, 
            Authentication auth) { 
        
        String voucherCode = request.getOrDefault("voucherCode", "").toString();
        String reason = request.getOrDefault("reason", "").toString();

        // [VÁ LỖ HỔNG]: Tuyệt đối không lấy "amount" từ Frontend nữa.
        // Chỉ truyền voucherCode xuống Service để Backend tự tính.
        kitchenService.applyOrderDiscount(id, voucherCode, reason, auth.getName());
        
        return ResponseEntity.ok().build(); 
    }

}
