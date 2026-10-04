-- ========================================================
-- FILE: 05-reservations-and-reviews.sql
-- MỤC ĐÍCH: Khởi tạo dữ liệu Đặt bàn (Reservations) và Đánh giá (Reviews)
-- Phục vụ test luồng Kanban (Quản lý) và Lịch sử đơn hàng (Khách)
-- ========================================================

-- Lưu ý: 
-- restaurant_id = 1 (Nhà hàng Yume Sushi Central)
-- customer_id = 1 (Hồ sơ của Khách hàng VVIP - Nguyễn Hoàng Yến)

-- 1. ĐƠN ĐẶT BÀN (Reservations)
INSERT INTO `reservations` (
    `id`, `restaurant_id`, `customer_id`, `reservation_date`, `reservation_time`, 
    `guest_count`, `notes`, `deposit_amount`, `final_total_amount`, `commission_amount`, 
    `cancel_reason`, `status`, `assigned_table_id`, `created_at`, `updated_at`
) VALUES 
-- Booking 1: PENDING (Chờ xác nhận) - Đặt cho TỐI NAY (Dùng để test cột 1 trên Kanban)
(1, 1, 1, CURDATE(), '19:00:00', 2, 'Kỷ niệm ngày cưới, quán chuẩn bị giúp mình 1 bông hoa hồng trên bàn nhé.', 
 100000.00, NULL, NULL, NULL, 'PENDING', NULL, NOW(), NOW()),

-- Booking 2: CONFIRMED (Đã xác nhận) - Đặt cho TỐI NAY (Dùng để test chức năng Xếp bàn ở cột 2 trên Kanban)
(2, 1, 1, CURDATE(), '20:30:00', 4, 'Nhà có trẻ nhỏ, cần 1 ghế ngồi cho em bé.', 
 200000.00, NULL, NULL, NULL, 'CONFIRMED', NULL, NOW(), NOW()),

-- Booking 3: CANCELLED (Đã hủy) - Đặt từ hôm qua (Dùng để test hiển thị trạng thái Đã hủy bên màn hình Khách hàng)
(3, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '18:00:00', 2, NULL, 
 100000.00, NULL, NULL, 'Trời mưa quá lớn, nhà mình bận việc không ghé được. Xin lỗi quán.', 'CANCELLED', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Booking 4: COMPLETE (Đã hoàn thành - NHƯNG CHƯA ĐÁNH GIÁ) - (Test nút "Đánh giá dịch vụ" của Khách)
-- Tổng Bill: 1.000.000đ | Hoa hồng 15%: 150.000đ
(4, 1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '19:30:00', 3, 'Khách đặt bàn qua ứng dụng.', 
 100000.00, 1000000.00, 150000.00, NULL, 'COMPLETE', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Booking 5: COMPLETE (Đã hoàn thành - VÀ ĐÃ ĐÁNH GIÁ) - (Test hiển thị nút bị vô hiệu hóa "Đã đánh giá")
-- Tổng Bill: 850.000đ | Hoa hồng 15%: 127.500đ
(5, 1, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '18:30:00', 2, 'Khách quen của quán.', 
 100000.00, 850000.00, 127500.00, NULL, 'COMPLETE', NULL, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));


-- 2. ĐÁNH GIÁ CỦA KHÁCH HÀNG (Reviews)
-- Gắn với Booking 5 (ID = 5)
INSERT INTO `reviews` (
    `id`, `reservation_id`, `rating`, `comment`, `reply_from_restaurant`, `created_at`
) VALUES 
(1, 5, 5, 'Sashimi ở đây cực kỳ tươi ngon, không gian sang trọng, riêng tư và nhân viên phục vụ rất nhiệt tình. Chắc chắn sẽ quay lại ủng hộ Yume Sushi dài dài!', 'Dạ Yume Sushi cảm ơn đánh giá vô cùng tuyệt vời của chị Yến ạ. Rất mong được đón tiếp chị vào một ngày gần nhất!', DATE_SUB(NOW(), INTERVAL 4 DAY));


-- Thông báo hoàn tất
SELECT 'Khởi tạo Đơn đặt bàn và Đánh giá thành công!' AS result;