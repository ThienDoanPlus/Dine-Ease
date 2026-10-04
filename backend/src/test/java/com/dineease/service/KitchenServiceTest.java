package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;       
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dineease.dto.OrderItemRequest;
import com.dineease.dto.OrderRequest;
import com.dineease.dto.ReservationRequest;
import com.dineease.entity.MenuItem;
import com.dineease.entity.MenuItemStatus;
import com.dineease.entity.Order;
import com.dineease.entity.OrderItem;
import com.dineease.entity.OrderItemStatus;
import com.dineease.entity.OrderStatus;
import com.dineease.entity.Payment;
import com.dineease.entity.PaymentStatus;
import com.dineease.entity.Reservation;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantStatus;
import com.dineease.entity.RestaurantTable;
import com.dineease.entity.TableStatus;
import com.dineease.entity.User;
import com.dineease.repository.MenuItemRepository;
import com.dineease.repository.OrderItemRepository;
import com.dineease.repository.OrderRepository;
import com.dineease.repository.PaymentRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;

@ExtendWith(MockitoExtension.class)
public class KitchenServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private RestaurantTableRepository tableRepository; 
    @Mock private PaymentRepository paymentRepository;         
    @Mock private ReservationRepository reservationRepository; 
    @Mock private MenuItemRepository menuItemRepository; 


    @InjectMocks 
    private CustomerReservationService reservationService; 

    @InjectMocks private KitchenService kitchenService;

    @Test
    @DisplayName("Nghiệp vụ: Bếp hủy món lẻ - Phải khấu trừ tiền và tính lại VAT chuẩn xác")
    void updateItemStatus_Rejected_ShouldRecalculateBill() {
        // 1. GIA ĐỊNH DỮ LIỆU ĐẦY ĐỦ (Fix NullPointerException)
        
        // Tạo Owner (Chủ quán)
        User mockOwner = User.builder()
                .email("owner.yume@gmail.com")
                .build();

        // Tạo Nhà hàng và gắn Owner vào
        Restaurant mockRestaurant = Restaurant.builder()
                .id(1L)
                .owner(mockOwner)
                .build();

        // Tạo Hóa đơn và gắn Nhà hàng vào
        Order mockOrder = Order.builder()
                .id(1L)
                .restaurant(mockRestaurant) // QUAN TRỌNG: Phải có dòng này
                .subTotal(new BigDecimal("1000000"))
                .surchargeAmount(BigDecimal.ZERO)
                .taxAmount(new BigDecimal("80000"))
                .totalAmount(new BigDecimal("1080000"))
                .status(OrderStatus.OPEN)
                .build();

        MenuItem mockMenu = MenuItem.builder()
                .name("Sashimi Cá Hồi")
                .price(new BigDecimal("185000"))
                .build();
        
        OrderItem mockItem = OrderItem.builder()
                .id(1L)
                .order(mockOrder)
                .menuItem(mockMenu)
                .quantity(1)
                .price(new BigDecimal("185000"))
                .status(OrderItemStatus.PENDING)
                .build();

        // 2. GIẢ LẬP REPOSITORY
        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(mockItem));

        // 3. THỰC THI
        // Lưu ý: Email truyền vào đây phải khớp với Email của mockOwner ở trên
        kitchenService.updateItemStatus(1L, "rejected", "owner.yume@gmail.com");

        // 4. KIỂM TRA KẾT QUẢ (Assertions giữ nguyên)
        BigDecimal expectedSubTotal = new BigDecimal("815000");
        assertEquals(0, expectedSubTotal.compareTo(mockOrder.getSubTotal()));

        BigDecimal expectedTax = new BigDecimal("65200.00");
        assertEquals(0, expectedTax.compareTo(mockOrder.getTaxAmount()));

        BigDecimal expectedTotal = new BigDecimal("880200.00");
        assertEquals(0, expectedTotal.compareTo(mockOrder.getTotalAmount()));

        verify(orderItemRepository, times(1)).save(any());
        verify(orderRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Nghiệp vụ: Thanh toán hóa đơn - Phải giải phóng toàn bộ cụm bàn gộp")
    void checkoutPosOrder_ShouldReleaseAllTablesInGroup() {
        // 1. GIA ĐỊNH DỮ LIỆU
        RestaurantTable masterTable = RestaurantTable.builder()
                .id(2L)
                .tableName("002")
                .status(TableStatus.OCCUPIED)
                .build();

        Restaurant mockRestaurant = Restaurant.builder()
                .id(1L)
                .commissionRate(new BigDecimal("15.0"))
                .build();

        Order mockOrder = Order.builder()
                .id(10L)
                .restaurant(mockRestaurant)
                .table(masterTable)
                .totalAmount(new BigDecimal("1000000"))
                .status(OrderStatus.OPEN)
                .build();

        // 2. GIẢ LẬP REPOSITORY
        when(orderRepository.findById(10L)).thenReturn(Optional.of(mockOrder));
        
        // --- XÓA DÒNGfindAllInGroup Ở ĐÂY VÌ NÓ LÀ THỪA (GÂY LỖI) ---

        // 3. THỰC THI
        kitchenService.checkoutPosOrder(10L, "CASH");

        // 4. KIỂM TRA
        assertEquals(OrderStatus.COMPLETED, mockOrder.getStatus());

        // Kiểm tra xem Service có gọi lệnh update trạng thái cho cả cụm bàn không
        // Đây mới là hàm thực tế được gọi trong KitchenService
        verify(tableRepository, times(1)).updateStatusForTableGroup(2L, TableStatus.AVAILABLE);
        
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Nghiệp vụ: Thêm phụ phí - Phải tính lại thuế VAT dựa trên tổng mới")
    void updateOrderSurcharge_ShouldRecalculateTaxAndTotal() {
        // 1. ARRANGE
        User owner = User.builder().email("manager@test.com").build();
        Restaurant res = Restaurant.builder().owner(owner).build();
        
        Order mockOrder = Order.builder()
                .id(200L)
                .restaurant(res)
                .subTotal(new BigDecimal("1000000")) // 1 triệu tiền món
                .surchargeAmount(BigDecimal.ZERO)
                .taxAmount(new BigDecimal("80000"))   // Thuế cũ 80k
                .totalAmount(new BigDecimal("1080000"))
                .status(OrderStatus.OPEN)
                .build();

        when(orderRepository.findById(200L)).thenReturn(Optional.of(mockOrder));

        // 2. ACT - Thêm phụ phí 100k
        kitchenService.updateOrderSurcharge(200L, "Phí phòng VIP", new BigDecimal("100000"), "manager@test.com");

        // 3. ASSERT
        // Kiểm tra thuế VAT mới (phải là 88k)
        BigDecimal expectedTax = new BigDecimal("88000.00");
        assertEquals(0, expectedTax.compareTo(mockOrder.getTaxAmount()), "Thuế VAT tính sai sau khi thêm phụ phí!");

        // Kiểm tra tổng thanh toán mới (1.188.000)
        BigDecimal expectedTotal = new BigDecimal("1188000.00");
        assertEquals(0, expectedTotal.compareTo(mockOrder.getTotalAmount()), "Tổng tiền hóa đơn sai!");

        verify(orderRepository, times(1)).save(mockOrder);
    }

    @Test
    @DisplayName("Bảo mật: Quản lý nhà hàng A không được phép sửa hóa đơn của nhà hàng B")
    void updateOrderSurcharge_ShouldThrowException_WhenManagerIsUnauthorized() {
        // 1. ARRANGE
        // Nhà hàng B của ông "manager.B@gmail.com"
        User ownerB = User.builder().email("manager.B@gmail.com").build();
        Restaurant resB = Restaurant.builder().owner(ownerB).build();
        
        Order orderOfResB = Order.builder()
                .id(999L)
                .restaurant(resB)
                .build();

        when(orderRepository.findById(999L)).thenReturn(Optional.of(orderOfResB));

        // 2. ACT & 3. ASSERT
        // Ông Manager A cố tình can thiệp vào hóa đơn 999 của ông B
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> {
            kitchenService.updateOrderSurcharge(999L, "Hack phụ phí", new BigDecimal("1000"), "manager.A@gmail.com");
        });
        
        System.out.println("Test Case Pass: Hệ thống đã chặn thành công hành vi truy cập trái phép!");
    }

    @Test
    @DisplayName("Nghiệp vụ POS: Thanh toán phải tự động khấu trừ tiền đặt cọc của khách")
    void checkoutPosOrder_ShouldSubtractDepositFromTotal() {
        // 1. ARRANGE
        // Giả lập tiền cọc 100k
        Reservation mockRes = Reservation.builder()
                .id(100L)
                .depositAmount(new BigDecimal("100000"))
                .build();

        Restaurant mockRest = Restaurant.builder()
                .id(1L)
                .commissionRate(new BigDecimal("15.0"))
                .build();

        // Hóa đơn 1,080,000đ có gắn với đơn đặt bàn trên
        Order mockOrder = Order.builder()
                .id(1L)
                .orderCode("BILL-001")
                .restaurant(mockRest)
                .reservation(mockRes) // Gắn đơn đặt bàn vào bill
                .totalAmount(new BigDecimal("1080000"))
                .status(OrderStatus.OPEN)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // 2. ACT
        kitchenService.checkoutPosOrder(1L, "CASH");

        // 3. ASSERT
        // Kiểm tra xem hệ thống có tạo 1 Payment mới với số tiền đã trừ cọc không
        // Tiền thu thực tế phải là 980,000đ
        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        
        BigDecimal actualCollected = paymentCaptor.getValue().getAmount();
        assertEquals(0, new BigDecimal("980000").compareTo(actualCollected), 
            "Số tiền thu tại quầy chưa trừ tiền cọc!");
        
        System.out.println("Test Case Pass: Thu ngân đã khấu trừ tiền cọc chuẩn xác!");
    }

    @Test
    @DisplayName("Nghiệp vụ Đặt bàn: Phải chặn nếu tổng số khách vượt quá sức chứa thực tế tại khung giờ đó")
    void createReservation_ShouldThrowException_WhenCapacityIsFull() {
        // 1. ARRANGE
        Long resId = 1L;
        Restaurant mockRest = Restaurant.builder()
                .id(resId)
                .maxPax(20)
                .status(RestaurantStatus.ACTIVE)
                .build();

        // Giả lập quán có tổng 10 chỗ (Hàm này Đoan dùng để lấy tổng ghế từ các bàn)
        when(tableRepository.getTotalCapacityByRestaurantId(resId)).thenReturn(10);

        // Giả lập: Tại khung giờ này, đã có người đặt 8 chỗ rồi
        when(reservationRepository.getTotalReservedGuestsForTimeRange(any(), any(), any(), any()))
                .thenReturn(8);

        // Khách mới muốn đặt 3 chỗ
        ReservationRequest request = new ReservationRequest(
                resId, LocalDate.now().plusDays(1), LocalTime.of(19, 0), 3, "Đặt bàn 3 người"
        );

        when(restaurantRepository.findByIdWithPessimisticLock(resId)).thenReturn(Optional.of(mockRest));

        // 2. ACT & 3. ASSERT
        // 8 (cũ) + 3 (mới) = 11 > 10 => Phải báo lỗi kẹt chỗ
        assertThrows(com.dineease.exception.DuplicateResourceException.class, () -> {
            reservationService.createReservation(request, "customer@gmail.com");
        });

        System.out.println("Test Case Pass: Hệ thống chặn đặt bàn khi hết chỗ thành công!");
    }

    @Test
    @DisplayName("Nghiệp vụ Voucher: Áp dụng mã VIP10 - Hệ thống phải tự tính lại số tiền giảm")
    void applyOrderDiscount_ShouldCalculatePercentageDiscountCorrectly() {
        // 1. ARRANGE
        Order mockOrder = Order.builder()
                .id(1L)
                .subTotal(new BigDecimal("1000000"))
                .surchargeAmount(new BigDecimal("100000"))
                .restaurant(Restaurant.builder().owner(User.builder().email("manager@test.com").build()).build())
                .status(OrderStatus.OPEN)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // 2. ACT
        kitchenService.applyOrderDiscount(1L, "VIP10", "Khách VIP", "manager@test.com");

        // 3. ASSERT
        // Tiền giảm 10% của 1.1tr là 110k
        BigDecimal expectedDiscount = new BigDecimal("110000.00");
        assertEquals(0, expectedDiscount.compareTo(mockOrder.getDiscountAmount()), "Số tiền giảm giá bị sai!");

        // Tổng thanh toán: 1.1tr + 88k (thuế) - 110k (giảm) = 1.078.000
        BigDecimal expectedTotal = new BigDecimal("1078000.00");
        assertEquals(0, expectedTotal.compareTo(mockOrder.getTotalAmount()), "Tổng thanh toán sau giảm giá bị sai!");
        
        System.out.println("Test Case 9 Pass: Logic giảm giá % hoạt động chính xác!");
    }

    @Test
    @DisplayName("Nghiệp vụ Voucher: Chống số tiền âm - Giảm giá không được vượt quá tổng Bill")
    void applyOrderDiscount_ShouldCappingDiscount_WhenDiscountExceedsTotal() {
        // 1. ARRANGE
        // Bill trà đá 10k, thuế 800đ => Tổng 10.800đ
        Order smallOrder = Order.builder()
                .id(2L)
                .subTotal(new BigDecimal("10000"))
                .surchargeAmount(BigDecimal.ZERO)
                .restaurant(Restaurant.builder().owner(User.builder().email("manager@test.com").build()).build())
                .status(OrderStatus.OPEN)
                .build();

        when(orderRepository.findById(2L)).thenReturn(Optional.of(smallOrder));

        // 2. ACT - Áp mã giảm 50k
        kitchenService.applyOrderDiscount(2L, "GIAM50K", "Lỗi nhập liệu", "manager@test.com");

        // 3. ASSERT
        // Tổng bill có 10.800đ nên chỉ được giảm tối đa 10.800đ
        BigDecimal totalWithTax = new BigDecimal("10800.00");
        assertEquals(0, totalWithTax.compareTo(smallOrder.getDiscountAmount()), "Tiền giảm giá phải bị giới hạn (Capping)!");
        
        // Tổng thanh toán phải về 0
        assertEquals(0, BigDecimal.ZERO.compareTo(smallOrder.getTotalAmount()), "Tổng thanh toán không được phép âm!");
        
        System.out.println("Test Case 10 Pass: Đã chặn thành công lỗi Bill âm tiền!");
    }

    @Test
    @DisplayName("Nghiệp vụ Order: Chặn tạo đơn hàng nếu chứa món ăn đã hết (SOLD_OUT)")
    void createOrder_ShouldThrowException_WhenItemIsSoldOut() {
        // 1. ARRANGE
        String email = "owner.yume@gmail.com";
        Long tableId = 1L;
        Long menuItemId = 4L;

        // Giả lập Nhà hàng
        User owner = User.builder().email(email).build();
        Restaurant mockRest = Restaurant.builder().id(100L).owner(owner).build();
        when(restaurantRepository.findByOwnerEmail(email)).thenReturn(Optional.of(mockRest));

        // --- BỔ SUNG: Giả lập tìm thấy bàn (Để không bị RuntimeException) ---
        RestaurantTable mockTable = RestaurantTable.builder()
                .id(tableId)
                .tableName("Bàn 001")
                .build();
        when(tableRepository.findById(tableId)).thenReturn(Optional.of(mockTable));
        // -------------------------------------------------------------------

        // Giả lập món ăn đã hết hàng
        MenuItem soldOutItem = MenuItem.builder()
                .id(menuItemId)
                .name("Cua Hoàng Đế")
                .status(MenuItemStatus.SOLD_OUT)
                .build();
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(soldOutItem));

        // Yêu cầu gọi món
        OrderRequest req = new OrderRequest(tableId, List.of(new OrderItemRequest(menuItemId, 1, "", List.of())));

        // 2. ACT & 3. ASSERT
        // Bây giờ hệ thống sẽ chạy qua đoạn check bàn an toàn và ném đúng lỗi IllegalStateException ở đoạn check món ăn
        assertThrows(IllegalStateException.class, () -> {
            kitchenService.createOrder(req, email);
        });

        System.out.println("Test Case 13 Pass: Đã chặn gọi món hết hàng sau khi xác nhận bàn tồn tại!");
    }

    @Test
    @DisplayName("Bảo mật POS: Không được phép chỉnh sửa Phụ phí trên hóa đơn đã thanh toán xong")
    void updateOrderSurcharge_ShouldThrowException_WhenOrderIsAlreadyCompleted() {
        // 1. ARRANGE
        Order completedOrder = Order.builder()
                .id(500L)
                .status(OrderStatus.COMPLETED) // ĐÃ THANH TOÁN
                .restaurant(Restaurant.builder().owner(User.builder().email("manager@test.com").build()).build())
                .build();

        when(orderRepository.findById(500L)).thenReturn(Optional.of(completedOrder));

        // 2. ACT & 3. ASSERT
        assertThrows(IllegalStateException.class, () -> {
            kitchenService.updateOrderSurcharge(500L, "Thêm phí gian lận", new BigDecimal("50000"), "manager@test.com");
        });
        
        System.out.println("Test Case 14 Pass: Hóa đơn đã thanh toán được bảo vệ an toàn!");
    }

    @Test
    @DisplayName("Nghiệp vụ POS: Xử lý hoàn tiền khi tiền cọc lớn hơn tổng giá trị bữa ăn")
    void checkoutPosOrder_ShouldCreateRefund_WhenDepositExceedsTotal() {
        // 1. ARRANGE
        Reservation res = Reservation.builder().depositAmount(new BigDecimal("100000")).build();
        Order cheapOrder = Order.builder()
                .id(1L)
                .reservation(res)
                .totalAmount(new BigDecimal("30000")) // Tổng ăn có 30k
                .restaurant(Restaurant.builder().commissionRate(new BigDecimal("15")).build())
                .status(OrderStatus.OPEN)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(cheapOrder));

        // 2. ACT
        kitchenService.checkoutPosOrder(1L, "CASH");

        // 3. ASSERT
        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        
        // Kiểm tra xem số tiền hoàn lại có đúng là 70k không
        Payment refund = paymentCaptor.getValue();
        assertEquals(PaymentStatus.REFUNDED, refund.getStatus());
        assertEquals(0, new BigDecimal("70000").compareTo(refund.getAmount()));
        
        System.out.println("Test Case 16 Pass: Logic hoàn trả tiền thừa hoạt động chuẩn xác!");
    }
}
