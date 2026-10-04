package com.dineease.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dineease.dto.KitchenOrderResponse;
import com.dineease.dto.OrderRequest;
import com.dineease.dto.OrderItemRequest;
import com.dineease.entity.*;
import com.dineease.repository.*;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class KitchenService {
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemOptionChoiceRepository optionChoiceRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerProfileRepository customerProfileRepository;

    public KitchenService(OrderRepository orderRepository, 
                          RestaurantRepository restaurantRepository, 
                          RestaurantTableRepository tableRepository, 
                          MenuItemRepository menuItemRepository,
                          MenuItemOptionChoiceRepository optionChoiceRepository,
                          OrderItemRepository orderItemRepository,
                          ReservationRepository reservationRepository,
                          PaymentRepository paymentRepository,
                          CustomerProfileRepository customerProfileRepository) { 
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.optionChoiceRepository = optionChoiceRepository;
        this.orderItemRepository = orderItemRepository;
        this.reservationRepository = reservationRepository;
        this.paymentRepository = paymentRepository;
        this.customerProfileRepository = customerProfileRepository;
    }

    // ==========================================
    // 1. TẠO ORDER MỚI TỪ SƠ ĐỒ BÀN (CÓ LƯU NOTE VÀ OPTIONS)
    // ==========================================
    public void createOrder(OrderRequest request, String email) {
        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà hàng"));

        RestaurantTable table = null;
        Order order = null;

        if (request.tableId() != null) {
            table = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

            // Xác định Master ID ngay từ đầu
            Long masterTableId = table.getMergedId() != null ? table.getMergedId() : table.getId();
            
            // Nếu đang gõ bàn con, lái về bàn cha để tìm/tạo Order
            if (table.getMergedId() != null) {
                table = tableRepository.findById(table.getMergedId())
                    .orElseThrow(() -> new RuntimeException("Bàn Master không tồn tại"));
            }

            Optional<Order> existingOrder = orderRepository.findByTableIdAndStatus(table.getId(), OrderStatus.OPEN);
            if (existingOrder.isPresent()) {
                order = existingOrder.get();
            }
        }

        if (order == null) {
            // ==========================================================
            // [ĐÃ VÁ LỖ HỔNG MẤT KẾT NỐI]: Móc nối Bill POS với Đơn Đặt Bàn
            // ==========================================================
            Reservation activeRes = null;
            if (table != null) {
                activeRes = reservationRepository.findFirstByAssignedTableIdAndStatus(table.getId(), com.dineease.entity.ReservationStatus.CHECKED_IN).orElse(null);
            }

            order = Order.builder()
                .restaurant(restaurant)
                .table(table)
                .reservation(activeRes) // <--- LIÊN KẾT ĐƠN ĐẶT BÀN VÀO POS 
                .status(OrderStatus.OPEN)
                .orderCode("BILL-" + (System.currentTimeMillis() % 1000000))
                .build();
            order.setOrderItems(new ArrayList<>());
            order.setSubTotal(BigDecimal.ZERO);
        }

        // ==========================================
        // [VÁ LỖ HỔNG F&B]: MỖI LẦN "GỬI BẾP" SẼ TẠO 1 MÃ KOT MỚI (Dù là Bill cũ)
        // ==========================================
        String currentBatchKotCode = "KOT-" + (System.currentTimeMillis() % 1000000);
        java.time.Instant now = java.time.Instant.now();

        BigDecimal subTotal = order.getSubTotal() != null ? order.getSubTotal() : BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.menuItemId())
                .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));

            // ==========================================================
            // [VÁ LỖ HỔNG MÓN ĂN BÓNG MA]: CHỐNG GỌI MÓN ĐÃ XÓA/HẾT HÀNG
            // ==========================================================
            if (menuItem.getStatus() == MenuItemStatus.HIDDEN) {
                throw new IllegalStateException(
                    "Thao tác bị từ chối: Món '" + menuItem.getName() + "' đã bị xóa khỏi thực đơn bởi Quản lý!"
                );
            }
            
            if (menuItem.getStatus() == MenuItemStatus.SOLD_OUT) {
                throw new IllegalStateException(
                    "Thao tác bị từ chối: Món '" + menuItem.getName() + "' hiện tại đã hết hàng!"
                );
            }
            // ==========================================================


            // ==========================================================
            // [VÁ LỖ HỔNG BẢO MẬT]: CHỐNG INJECTION SỐ LƯỢNG ÂM
            // ==========================================================
            if (itemReq.quantity() == null || itemReq.quantity() <= 0) {
                throw new IllegalArgumentException("Phát hiện dữ liệu bất thường: Số lượng của món '" + menuItem.getName() + "' không hợp lệ (" + itemReq.quantity() + "). Giao dịch bị từ chối!");
            }

            BigDecimal itemUnitPrice = menuItem.getPrice();
            List<OrderItemChoice> chosenOptions = new ArrayList<>();

            if (itemReq.selectedChoiceIds() != null && !itemReq.selectedChoiceIds().isEmpty()) {
                List<MenuItemOptionChoice> choices = optionChoiceRepository.findAllById(itemReq.selectedChoiceIds());
                
                for (MenuItemOptionChoice choice : choices) {
                    itemUnitPrice = itemUnitPrice.add(choice.getAdditionalPrice());
                    
                    chosenOptions.add(OrderItemChoice.builder()
                        .groupName(choice.getOptionGroup().getName())
                        .choiceName(choice.getName())
                        .additionalPrice(choice.getAdditionalPrice())
                        .build());
                }
            }

            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .menuItem(menuItem)
                .quantity(itemReq.quantity())
                .price(itemUnitPrice)
                .note(itemReq.note())
                .status(OrderItemStatus.PENDING)
                .kotCode(currentBatchKotCode) // <-- GẮN MÃ PHIẾU BẾP
                .sentAt(now)                  // <-- GẮN GIỜ GỬI BẾP
                .build();

            for (OrderItemChoice oc : chosenOptions) {
                oc.setOrderItem(orderItem);
            }
            orderItem.setSelectedChoices(chosenOptions);

            order.getOrderItems().add(orderItem);
            
            BigDecimal totalForItem = itemUnitPrice.multiply(new BigDecimal(itemReq.quantity()));
            subTotal = subTotal.add(totalForItem);
        }

        order.setSubTotal(subTotal);
        
        // ==========================================================
        // [VÁ LỖ HỔNG KẾ TOÁN]: TÍNH THUẾ VAT CHUẨN XÁC
        // ==========================================================
        BigDecimal subTotalAmount = order.getSubTotal() != null ? order.getSubTotal() : BigDecimal.ZERO;
        BigDecimal surcharge = order.getSurchargeAmount() != null ? order.getSurchargeAmount() : BigDecimal.ZERO;
        BigDecimal rawDiscount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        
        // 1. Thuế VAT 8% tính trên Giá gốc + Phụ phí (TRƯỚC KHI TRỪ VOUCHER)
        BigDecimal baseAmountForTax = subTotalAmount.add(surcharge);
        order.setTaxAmount(baseAmountForTax.multiply(new BigDecimal("0.08")));
        
        // 2. Tổng tiền bill (Đã gồm thuế)
        BigDecimal totalWithTax = baseAmountForTax.add(order.getTaxAmount());

        // 3. Khống chế số tiền giảm giá không được vượt quá Tổng bill (để tránh bill âm)
        BigDecimal actualDiscount = rawDiscount.compareTo(totalWithTax) > 0 ? totalWithTax : rawDiscount;
        order.setDiscountAmount(actualDiscount);
        
        // 4. Tổng thanh toán cuối cùng = Tổng (đã thuế) - Giảm giá
        order.setTotalAmount(totalWithTax.subtract(actualDiscount));


        orderRepository.save(order);

        if (table != null) {
            Long masterTableId = table.getMergedId() != null ? table.getMergedId() : table.getId();
            tableRepository.updateStatusForTableGroup(masterTableId, TableStatus.OCCUPIED);
        }
    }

    // ==========================================
    // 2. LẤY DANH SÁCH PHIẾU BẾP (GOM THEO TỪNG ĐỢT GỌI MÓN - KOT)
    // ==========================================
    @Transactional(readOnly = true)
    public List<KitchenOrderResponse> getKitchenTickets(String email) {
        List<Order> activeOrders = orderRepository.findByRestaurantOwnerEmailAndStatus(email, OrderStatus.OPEN);
        // ĐỔI FORMAT TỪ "HH:mm" SANG CÓ CẢ GIÂY VÀ NGÀY THÁNG
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss - dd/MM").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

        // 2. Trích xuất TẤT CẢ các món ăn từ các hóa đơn này
        List<OrderItem> allActiveItems = activeOrders.stream()
            .flatMap(order -> order.getOrderItems().stream())
            .collect(Collectors.toList());

        // 3. Gom nhóm các món ăn theo Mã Phiếu Bếp (KOT Code)
        Map<String, List<OrderItem>> groupedByKot = allActiveItems.stream()
            .collect(Collectors.groupingBy(item -> 
                item.getKotCode() != null ? item.getKotCode() : item.getOrder().getOrderCode()
            ));

        List<KitchenOrderResponse> responses = new ArrayList<>();

        for (Map.Entry<String, List<OrderItem>> entry : groupedByKot.entrySet()) {
            String kotCode = entry.getKey();
            List<OrderItem> itemsInKot = entry.getValue();

            OrderItem firstItem = itemsInKot.get(0);
            String tableName = firstItem.getOrder().getTable() != null ? firstItem.getOrder().getTable().getTableName() : "Mang đi";
            
            String timeStr = firstItem.getSentAt() != null 
                ? timeFormatter.format(firstItem.getSentAt()) 
                : timeFormatter.format(firstItem.getOrder().getCreatedAt());

            List<KitchenOrderResponse.KitchenItem> itemDtos = itemsInKot.stream()
                .map(item -> {
                    List<String> optionsList = item.getSelectedChoices().stream()
                        .map(OrderItemChoice::getChoiceName)
                        .collect(Collectors.toList());

                    return new KitchenOrderResponse.KitchenItem(
                        item.getId(), 
                        item.getMenuItem().getName(), 
                        item.getQuantity(), 
                        item.getNote(),
                        optionsList,
                        item.getStatus().name().toLowerCase()
                    );
                }).toList();

            String status = determineOrderKOTStatus(itemsInKot);

            responses.add(new KitchenOrderResponse(
                kotCode, tableName, timeStr, status, itemDtos
            ));
        }

        responses.sort((r1, r2) -> r1.time().compareTo(r2.time()));

        return responses;
    }

    public void updateItemStatus(Long itemId, String newStatusStr, String email) {
        OrderItem item = orderItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn trong Order"));
            
        if (!item.getOrder().getRestaurant().getOwner().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("IDOR Alert!");
        }

        // Không cho phép hủy/đổi trạng thái nếu hóa đơn POS đã thanh toán xong
        if (item.getOrder().getStatus() == com.dineease.entity.OrderStatus.COMPLETED) {
            throw new IllegalStateException("Hóa đơn này đã được thu ngân thanh toán, không thể thay đổi trạng thái món!");
        }

        // Không cho phép hủy lại món đã hủy
        if (item.getStatus() == com.dineease.entity.OrderItemStatus.REJECTED) {
            throw new IllegalStateException("Món này đã được báo hết/hủy trước đó!");
        }
        
        OrderItemStatus newStatus = switch (newStatusStr.toLowerCase()) { 
            case "cooking" -> OrderItemStatus.COOKING; 
            case "ready" -> OrderItemStatus.READY; 
            case "served" -> OrderItemStatus.SERVED; 
            case "rejected" -> OrderItemStatus.REJECTED; 
            default -> OrderItemStatus.PENDING; 
        };

        // ==========================================================
        // [VÁ LỖ HỔNG KẾ TOÁN]: TRỪ TIỀN VÀ TÍNH LẠI HÓA ĐƠN NẾU BẾP HỦY MÓN
        // ==========================================================
        if (newStatus == OrderItemStatus.REJECTED) {
            Order order = item.getOrder();
            
            // 1. Tính tổng tiền của riêng món bị hủy (Giá * Số lượng)
            BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
            
            // 2. Trừ tiền khỏi SubTotal
            BigDecimal currentSubTotal = order.getSubTotal() != null ? order.getSubTotal() : BigDecimal.ZERO;
            BigDecimal newSubTotal = currentSubTotal.subtract(itemTotal);
            if (newSubTotal.compareTo(BigDecimal.ZERO) < 0) newSubTotal = BigDecimal.ZERO;
            order.setSubTotal(newSubTotal);

            // 3. Tính toán lại THUẾ VAT (8%)
            BigDecimal surcharge = order.getSurchargeAmount() != null ? order.getSurchargeAmount() : BigDecimal.ZERO;
            BigDecimal baseAmountForTax = newSubTotal.add(surcharge);
            order.setTaxAmount(baseAmountForTax.multiply(new BigDecimal("0.08")));
            
            // 4. Tổng tiền sau thuế (Base + Tax)
            BigDecimal totalWithTax = baseAmountForTax.add(order.getTaxAmount());

            // 5. Cập nhật lại Voucher (Ép Voucher không được lớn hơn tổng bill mới, tránh bill bị âm tiền)
            BigDecimal rawDiscount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal actualDiscount = rawDiscount.compareTo(totalWithTax) > 0 ? totalWithTax : rawDiscount;
            order.setDiscountAmount(actualDiscount);

            // 6. Tính tổng thanh toán cuối cùng
            order.setTotalAmount(totalWithTax.subtract(actualDiscount));

            orderRepository.save(order); // Lưu lại hóa đơn đã trừ tiền
        }
        
        item.setStatus(newStatus);
        orderItemRepository.save(item);
    }


    // ==========================================
    // 3. LẤY HÓA ĐƠN CỦA BÀN CHO POS
    // ==========================================
    @Transactional(readOnly = true)
    public com.dineease.dto.TableBillResponse getTableBill(Long tableId, String email) {
        // 1. Tìm thông tin bàn mà Thu ngân vừa gõ
        RestaurantTable requestedTable = tableRepository.findById(tableId)
            .orElseThrow(() -> new RuntimeException("Bàn số " + tableId + " không tồn tại."));

        // 2. LOGIC THÔNG MINH: Nếu gõ bàn con, tự động chuyển về ID bàn cha
        Long effectiveMasterId = requestedTable.getMergedId() != null 
                                 ? requestedTable.getMergedId() 
                                 : requestedTable.getId();

        // 3. Tìm hóa đơn đang mở của bàn Master này
        Order order = orderRepository.findByTableIdAndStatus(effectiveMasterId, OrderStatus.OPEN)
            .orElseThrow(() -> new RuntimeException("Bàn này (hoặc cụm bàn gộp liên quan) hiện không có hóa đơn nào chưa thanh toán."));

        if (!order.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xem hóa đơn này");
        }

        // 4. Lấy danh sách tên tất cả các bàn trong cụm để hiển thị lên Bill
        List<String> tableGroupNames = tableRepository.findAllInGroup(effectiveMasterId).stream()
            .map(RestaurantTable::getTableName)
            .collect(Collectors.toList());

        // 5. Map dữ liệu món ăn như cũ
        List<com.dineease.dto.TableBillResponse.BillItem> items = order.getOrderItems().stream()
            .map(item -> new com.dineease.dto.TableBillResponse.BillItem(
                item.getId(),
                item.getMenuItem().getName(),
                item.getQuantity(),
                item.getPrice(),
                item.getStatus().name()
            )).collect(Collectors.toList());

        BigDecimal deposit = (order.getReservation() != null && order.getReservation().getDepositAmount() != null) 
                             ? order.getReservation().getDepositAmount() : BigDecimal.ZERO;

        return new com.dineease.dto.TableBillResponse(
            order.getId(),
            order.getOrderCode(),
            order.getSubTotal(),
            order.getSurchargeAmount(),
            order.getSurchargeNote(),
            order.getTaxAmount(),
            order.getTotalAmount(),
            deposit,
            order.getDiscountAmount(),
            order.getVoucherCode(),
            tableGroupNames, // <--- TRUYỀN DANH SÁCH TÊN BÀN XUỐNG FRONTEND
            items
        );
    }

    // ==========================================
    // CẬP NHẬT PHỤ PHÍ (SURCHARGE)
    // ==========================================
    public void updateOrderSurcharge(Long orderId, String note, BigDecimal amount, String email) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        // --- BỔ SUNG ĐOẠN CHECK NÀY ĐỂ VÁ LỖ HỔNG ---
        if (order.getStatus() == OrderStatus.COMPLETED) {
        throw new IllegalStateException("Hóa đơn này đã được thanh toán, không thể chỉnh sửa phụ phí!");
        }

        if (!order.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("IDOR Alert!");
        }

        order.setSurchargeNote(note);
        order.setSurchargeAmount(amount != null ? amount : BigDecimal.ZERO);

        // [ZERO-TRUST RE-CALCULATION CHUẨN KẾ TOÁN]
        BigDecimal subTotalAmount = order.getSubTotal() != null ? order.getSubTotal() : BigDecimal.ZERO;
        BigDecimal rawDiscount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        
        // 1. Tính Thuế trên giá gốc + phụ phí
        BigDecimal baseAmountForTax = subTotalAmount.add(order.getSurchargeAmount());
        order.setTaxAmount(baseAmountForTax.multiply(new BigDecimal("0.08")));
        
        // 2. Tổng bill sau thuế
        BigDecimal totalWithTax = baseAmountForTax.add(order.getTaxAmount());

        // 3. Cập nhật lại số tiền giảm thực tế (không vượt quá tổng)
        BigDecimal actualDiscount = rawDiscount.compareTo(totalWithTax) > 0 ? totalWithTax : rawDiscount;
        order.setDiscountAmount(actualDiscount);

        // 4. Tổng thanh toán cuối cùng
        order.setTotalAmount(totalWithTax.subtract(actualDiscount));


        orderRepository.save(order);
    }

    // ==========================================
    // ÁP DỤNG GIẢM GIÁ (DISCOUNT/VOUCHER)
    // ==========================================
    public void applyOrderDiscount(Long orderId, String voucherCode, String reason, String email) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        if (!order.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("IDOR Alert!");
        }

        BigDecimal subTotalAmount = order.getSubTotal() != null ? order.getSubTotal() : BigDecimal.ZERO;
        BigDecimal surcharge = order.getSurchargeAmount() != null ? order.getSurchargeAmount() : BigDecimal.ZERO;

        // ==========================================================
        // 1. Tính Thuế và Tổng bill trước khi áp Voucher
        // ==========================================================
        BigDecimal baseAmountForTax = subTotalAmount.add(surcharge);
        order.setTaxAmount(baseAmountForTax.multiply(new BigDecimal("0.08")));
        
        BigDecimal totalWithTax = baseAmountForTax.add(order.getTaxAmount());

        // ==========================================================
        // 2. Tự tính toán số tiền giảm giá ở Backend (Zero-Trust)
        // ==========================================================
        BigDecimal calculatedDiscount = BigDecimal.ZERO;
        String validVoucherCode = voucherCode.trim().toUpperCase();

        if (!validVoucherCode.isEmpty()) {
            if (validVoucherCode.equals("GIAM50K")) {
                calculatedDiscount = new BigDecimal("50000");
            } else if (validVoucherCode.equals("GIAM100K")) {
                calculatedDiscount = new BigDecimal("100000");
            } else if (validVoucherCode.equals("VIP10")) {
                // Thường % chiết khấu sẽ áp dụng trên giá gốc (Chưa thuế)
                calculatedDiscount = baseAmountForTax.multiply(new BigDecimal("0.10"));
            } else {
                throw new IllegalArgumentException("Mã Voucher không hợp lệ hoặc đã hết hạn!");
            }
        }

        order.setVoucherCode(validVoucherCode);
        order.setDiscountReason(reason);
        
        // 3. Khống chế giảm giá không vượt quá tổng bill (bao gồm thuế)
        BigDecimal actualDiscount = calculatedDiscount.compareTo(totalWithTax) > 0 ? totalWithTax : calculatedDiscount;
        order.setDiscountAmount(actualDiscount);

        // 4. Tổng thanh toán cuối cùng
        order.setTotalAmount(totalWithTax.subtract(actualDiscount));

        orderRepository.save(order);
    }



    @Transactional
    public void checkoutPosOrder(Long orderId, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Hóa đơn POS"));
        
        // TUYỆT ĐỐI TIN TƯỞNG DATABASE: Lấy tổng tiền đã được Server tính toán và khóa cứng
        java.math.BigDecimal trustedTotalAmount = order.getTotalAmount();
        
        java.math.BigDecimal commissionRate = order.getRestaurant().getCommissionRate();
        java.math.BigDecimal commission = trustedTotalAmount.multiply(commissionRate)
            .divide(new java.math.BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        
        // ==========================================================
        // [VÁ LỖ HỔNG NHÂN ĐÔI HOA HỒNG]: SINGLE SOURCE OF TRUTH
        // ==========================================================
        if (order.getReservation() != null) {
            Reservation res = order.getReservation();
            
            // 1. Đồng bộ trạng thái Reservation dựa trên kết quả thanh toán POS
            res.setStatus(com.dineease.entity.ReservationStatus.COMPLETE);
            res.setFinalTotalAmount(trustedTotalAmount);
            res.setCommissionAmount(commission);

            // 2. LOGIC TÍNH ĐIỂM THÀNH VIÊN (LOYALTY)
            CustomerProfile profile = res.getCustomer();
            if (profile != null) {
                // Quy tắc: 1 khách = 10 điểm
                int pointsToAdd = res.getGuestCount() * 10;
                profile.setLoyaltyPoints(profile.getLoyaltyPoints() + pointsToAdd);
                profile.setTotalBookings(profile.getTotalBookings() + 1);
                customerProfileRepository.save(profile);
            }
            
            // Đã ghi nhận hoa hồng ở bảng Reservation thì bảng Order set về 0 để tránh tính trùng
            order.setCommissionAmount(BigDecimal.ZERO);
        } else {
            // Khách vãng lai (không đặt trước) thì ghi hoa hồng vào bảng Order
            order.setCommissionAmount(commission);
        }
        // ==========================================================

        order.setStatus(OrderStatus.COMPLETED);
        
        // --- QUAN TRỌNG: GIẢI PHÓNG TOÀN CỤM BÀN ---
        if (order.getTable() != null) {
            Long masterId = order.getTable().getMergedId() != null 
                            ? order.getTable().getMergedId() 
                            : order.getTable().getId();
            
            // Gọi hàm updateStatusForTableGroup để xả toàn bộ bàn con + cha
            tableRepository.updateStatusForTableGroup(masterId, TableStatus.AVAILABLE);
        }

        // ==========================================================
        // [VÁ LỖ HỔNG GIAN LẬN]: TẠO BÚT TOÁN THANH TOÁN CHO POS
        // ==========================================================
        // Lấy tiền cọc nếu hóa đơn này có móc nối với Đặt bàn
        BigDecimal deposit = (order.getReservation() != null && order.getReservation().getDepositAmount() != null) 
                             ? order.getReservation().getDepositAmount() : BigDecimal.ZERO;
        
        // Tiền thực tế thu ngân đã thu vào két (Tổng - Cọc)
        BigDecimal cashCollected = trustedTotalAmount.subtract(deposit);
        
        // ==========================================================
        // [VÁ LỖ HỔNG THẤT THOÁT TIỀN KÉT]: MAPPING PHƯƠNG THỨC TT
        // ==========================================================
        com.dineease.entity.PaymentMethod methodEnum;
        String normalizedMethod = paymentMethod.trim().toUpperCase();

        switch (normalizedMethod) {
            case "MOMO": methodEnum = com.dineease.entity.PaymentMethod.MOMO; break;
            case "VNPAY": methodEnum = com.dineease.entity.PaymentMethod.VNPAY; break;
            case "CARD": methodEnum = com.dineease.entity.PaymentMethod.CARD; break;
            case "QR": 
            case "QR_CODE": methodEnum = com.dineease.entity.PaymentMethod.QR_CODE; break;
            case "VOUCHER": methodEnum = com.dineease.entity.PaymentMethod.VOUCHER; break;
            case "CASH": methodEnum = com.dineease.entity.PaymentMethod.CASH; break;
            default:
                // Nếu Frontend gửi lên 1 phương thức tà đạo nào đó -> Văng lỗi ngay lập tức
                throw new IllegalArgumentException("Hệ thống không hỗ trợ phương thức thanh toán: " + paymentMethod);
        }

        if (cashCollected.compareTo(BigDecimal.ZERO) > 0) {

            // Khách đóng thêm tiền
            Payment payment = Payment.builder()
                .paymentType(com.dineease.entity.PaymentType.FINAL_PAYMENT)
                .paymentMethod(methodEnum)
                .status(com.dineease.entity.PaymentStatus.SUCCESS)
                .amount(cashCollected)
                .order(order)
                .reservation(order.getReservation()) // Nối luôn vào Reservation nếu có
                .transactionCode("POS-" + System.currentTimeMillis())
                .build();
            paymentRepository.save(payment);
        } 
        // ==========================================================
        // [VÁ LỖ HỔNG HOÀN TIỀN]: TRẢ TIỀN THỪA QUA POS
        // ==========================================================
        else if (cashCollected.compareTo(BigDecimal.ZERO) < 0) {
            BigDecimal refundAmount = cashCollected.abs();

            Payment refundPayment = Payment.builder()
                .paymentType(com.dineease.entity.PaymentType.FINAL_PAYMENT)
                .paymentMethod(com.dineease.entity.PaymentMethod.CASH) // Tiền thừa thối lại luôn bằng tiền mặt
                .status(com.dineease.entity.PaymentStatus.REFUNDED)
                .amount(refundAmount)
                .order(order)
                .reservation(order.getReservation())
                .transactionCode("REF-POS-" + System.currentTimeMillis())
                .build();
            paymentRepository.save(refundPayment);
        }
        // ==========================================================


        orderRepository.save(order);
    }


    private String determineOrderKOTStatus(List<OrderItem> items) {
        if (items.stream().anyMatch(i -> i.getStatus() == OrderItemStatus.PENDING)) return "pending";
        if (items.stream().anyMatch(i -> i.getStatus() == OrderItemStatus.COOKING)) return "cooking";
        return "ready";
    }
}
