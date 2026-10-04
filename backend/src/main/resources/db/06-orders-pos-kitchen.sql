-- ========================================================
-- FILE: 06-orders-pos-kitchen.sql
-- MỤC ĐÍCH: Khởi tạo dữ liệu Đơn hàng tại bàn (POS) và Phiếu bếp (KOT)
-- Phục vụ test luồng Thu ngân và Đầu bếp
-- ========================================================

-- Lưu ý cấu trúc Menu (Từ file 04):
-- Món 1: Sashimi (185.000đ)
-- Món 2: Steak (1.250.000đ)
-- Món 3: Trà sữa (55.000đ)

-- ========================================================
-- 1. KHỞI TẠO HÓA ĐƠN TỔNG (Orders)
-- ========================================================
INSERT INTO `orders` (
    `id`, `version`, `order_code`, `restaurant_id`, `table_id`, `reservation_id`, 
    `sub_total`, `surcharge_amount`, `surcharge_note`, `tax_amount`, 
    `discount_amount`, `voucher_code`, `discount_reason`, `total_amount`, 
    `commission_amount`, `status`, `created_at`, `updated_at`
) VALUES 
-- ORDER 1 (Bàn 002): Đang phục vụ. Dùng để test màn hình BẾP (KOT).
-- Không giảm giá, không phụ phí.
-- SubTotal: 1.585.000đ | Tax 8%: 126.800đ | Total: 1.711.800đ
(1, 0, 'KOT-000001', 1, 2, NULL, 
 1585000.00, 0.00, NULL, 126800.00, 
 0.00, NULL, NULL, 1711800.00, 
 0.00, 'OPEN', NOW(), NOW()),

-- ORDER 2 (Bàn 005): Đang mở. Dùng để test TÍNH TOÁN POS (Thu ngân).
-- Có Phụ phí phòng VIP (50.000đ) + Có Voucher GIAM50K (Trừ 50.000đ).
-- Món ăn (Sashimi x2) = 370.000đ
-- Base tính thuế = 370.000đ + 50.000đ (Phụ phí) = 420.000đ. 
-- Tax 8% = 33.600đ. Tổng sau thuế: 453.600đ
-- Trừ Voucher 50.000đ -> Total Cuối Cùng = 403.600đ
(2, 0, 'KOT-000002', 1, 5, NULL, 
 370000.00, 50000.00, 'Phụ phí phòng VIP', 33600.00, 
 50000.00, 'GIAM50K', 'Khách VIP check-in', 403600.00, 
 0.00, 'OPEN', NOW(), NOW()),

-- ORDER 3 (Takeaway): Bán mang đi (table_id = NULL).
-- Trà sữa x1 = 55.000đ | Tax 8% = 4.400đ | Total = 59.400đ
(3, 0, 'KOT-000003', 1, NULL, NULL, 
 55000.00, 0.00, NULL, 4400.00, 
 0.00, NULL, NULL, 59400.00, 
 0.00, 'OPEN', NOW(), NOW());


-- ========================================================
-- 2. CHI TIẾT MÓN ĂN TRONG ĐƠN (Order Items)
-- ========================================================
INSERT INTO `order_items` (
    `id`, `order_id`, `menu_item_id`, `quantity`, `price`, 
    `note`, `status`, `kot_code`, `sent_at`
) VALUES 
-- THUỘC ORDER 1 (Test Bếp)
-- Item 1: Đang CHỜ NẤU (PENDING) -> Để bếp bấm nút "Nấu" (Ngọn lửa)
(1, 1, 1, 1, 185000.00, 'Xin ít gừng hồng', 'PENDING', 'KOT-000001', NOW()),

-- Item 2: ĐANG NẤU (COOKING) -> Để bếp bấm nút "Xong" (Dấu Check xanh)
(2, 1, 2, 1, 1250000.00, 'Ra món nhanh giúp', 'COOKING', 'KOT-000001', NOW()),

-- Item 3: ĐÃ XONG (READY) -> Nằm im bên bếp. Thu ngân/Phục vụ sẽ bấm "Xác nhận bưng" bên POS.
-- Giá: 55k (Gốc) + 10k (Size L) + 10k (Trân châu) = 75k. Bàn gọi 2 ly.
(3, 1, 3, 2, 75000.00, NULL, 'READY', 'KOT-000001', NOW()),


-- THUỘC ORDER 2 (Test tính tiền POS - Món đã dọn lên bàn hết rồi)
(4, 2, 1, 2, 185000.00, NULL, 'SERVED', 'KOT-000002', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),


-- THUỘC ORDER 3 (Takeaway mang đi - Vừa order xong)
(5, 3, 3, 1, 55000.00, 'Cho nhiều đá', 'PENDING', 'KOT-000003', NOW());


-- ========================================================
-- 3. TÙY CHỌN & TOPPING ĐI KÈM CỦA MÓN ĂN (Order Item Choices)
-- ========================================================
INSERT INTO `order_item_choices` (
    `id`, `order_item_id`, `group_name`, `choice_name`, `additional_price`
) VALUES 
-- Topping của món Steak (Item ID = 2)
(1, 2, 'Chọn độ chín (Doneness)', 'Medium Rare (Tái vừa)', 0.00),

-- Topping của món Trà sữa (Item ID = 3)
(2, 3, 'Chọn Size', 'Size L', 10000.00),
(3, 3, 'Thêm Topping', 'Trân châu trắng', 10000.00);


-- Thông báo hoàn tất
SELECT 'Khởi tạo Hóa đơn POS và Phiếu Bếp (KOT) thành công!' AS result;