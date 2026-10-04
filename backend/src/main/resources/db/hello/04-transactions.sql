SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- FILE 4: GIAO DỊCH, ĐẶT BÀN & THÔNG BÁO (BẢN FIX)
-- ========================================================

-- 1. ĐẶT BÀN (Bổ sung cột deposit_amount)
DELETE FROM reservations;
INSERT INTO reservations (id, reservation_date, reservation_time, guest_count, notes, status, restaurant_id, customer_id, assigned_table_id, deposit_amount, final_total_amount, commission_amount, cancel_reason, created_at, updated_at) VALUES 
(1, CURDATE(), '19:00:00', 4, 'Cần 2 ghế trẻ em.', 'PENDING', 1, 2, NULL, 100000, NULL, NULL, NULL, NOW(), NOW()),
(2, CURDATE(), '18:00:00', 2, 'Cần không gian kín đáo.', 'PENDING', 1, 3, NULL, 100000, NULL, NULL, NULL, NOW(), NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', 5, '', 'PENDING', 2, 1, NULL, 100000, NULL, NULL, NULL, NOW(), NOW()),
(4, CURDATE(), '19:30:00', 2, 'Kỷ niệm ngày cưới.', 'CONFIRMED', 1, 4, NULL, 100000, NULL, NULL, NULL, NOW(), NOW()),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '20:30:00', 6, 'Khách hàng thân thiết VIP.', 'CHECKED_IN', 1, 5, 2, 200000, NULL, NULL, NULL, NOW(), NOW()),
(6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '20:00:00', 4, '', 'COMPLETE', 1, 5, 1, 100000, 1250000, 187500, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)), 
(7, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '12:00:00', 4, '', 'CANCELLED', 1, 1, NULL, 100000, NULL, NULL, 'Thay đổi kế hoạch đột xuất', NOW(), NOW()),
(8, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '18:30:00', 2, '', 'COMPLETE', 2, 2, 7, 100000, 850000, 127500, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(9, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '19:00:00', 3, '', 'COMPLETE', 3, 3, 9, 100000, 2500000, 500000, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(12, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '19:00:00', 2, '', 'CANCELLED', 2, 3, NULL, 100000, NULL, NULL, 'Bận việc', NOW(), NOW()),
(13, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '20:00:00', 5, '', 'CANCELLED', 2, 4, NULL, 100000, NULL, NULL, 'Đổi ý', NOW(), NOW()),
(999, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:00:00', 2, 'Test hủy bàn qua AI', 'PENDING', 4, 1, NULL, 100000, NULL, NULL, NULL, NOW(), NOW());

-- 2. THANH TOÁN & REVIEW
DELETE FROM payments;
INSERT INTO payments (id, payment_type, payment_method, status, amount, transaction_code, reservation_id, created_at)
VALUES (1, 'DEPOSIT', 'VNPAY', 'SUCCESS', 200000, 'YUME_1_1714000000', 4, NOW());

DELETE FROM reviews;
INSERT INTO reviews (id, rating, comment, created_at, reservation_id) 
VALUES (1, 5, 'Đồ ăn rất ngon, phục vụ tận tình chuyên nghiệp.', NOW(), 6);

-- 3. HÓA ĐƠN POS & PHIẾU BẾP
DELETE FROM orders;
INSERT INTO orders (id, version, order_code, restaurant_id, table_id, status, created_at, updated_at, sub_total, tax_amount, total_amount, discount_amount, surcharge_amount, commission_amount)
VALUES (1, 0, 'KOT-101', 1, 2, 'OPEN', NOW(), NOW(), 575000, 46000, 621000, 0, 0, 0);

DELETE FROM order_items;
INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, note, status, kot_code, sent_at)
VALUES 
(1, 1, 2, 1, 180000, 'Ít wasabi', 'COOKING', 'KOT-101', NOW()), 
(2, 1, 4, 1, 125000, '', 'PENDING', 'KOT-101', NOW()),           
(3, 1, 5, 2, 45000, '1 ly ít ngọt', 'PENDING', 'KOT-101', NOW()); 

-- 4. LOG & THÔNG BÁO
DELETE FROM audit_logs;
INSERT INTO audit_logs (id, time, admin_email, admin_name, action, old_value, new_value, reason)
VALUES (1, NOW(), 'admin@dineease.com', 'Super Admin', 'Khởi tạo hệ thống', '0%', '15%', 'Thiết lập mặc định khi deploy lần đầu.');

DELETE FROM notification_campaigns;
INSERT INTO notification_campaigns (id, title, content, target_audience, channel, status, admin_id, created_at, scheduled_time) VALUES
(1, 'Cập nhật hệ thống thành công', '<p>Hệ thống DineEase vừa được nâng cấp lên phiên bản v2.0...</p>', 'RESTAURANT', 'IN_APP', 'SENT', 1, NOW(), NOW());

DELETE FROM user_notifications;
INSERT INTO user_notifications (id, title, content, type, is_read, user_id, campaign_id, created_at) VALUES
(1, 'Cập nhật hệ thống thành công', 'Hệ thống DineEase vừa được nâng cấp lên phiên bản v2.0...', 'SYSTEM', 0, 2, 1, NOW()),
(2, 'Có đơn đặt bàn mới', 'Khách hàng Elon Musk vừa đặt bàn cho 4 người...', 'ORDER', 0, 2, NULL, NOW()),
(3, 'Cảm ơn đã đặt bàn!', 'Đơn hàng #4 tại Yume Sushi Central của bạn đã được xác nhận.', 'PROMO', 1, 10, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 5. RESET AUTO_INCREMENT (Chống lỗi duplicate ID khi test app)
ALTER TABLE reservations AUTO_INCREMENT = 1000;
ALTER TABLE payments AUTO_INCREMENT = 2;
ALTER TABLE reviews AUTO_INCREMENT = 2;
ALTER TABLE orders AUTO_INCREMENT = 2;
ALTER TABLE order_items AUTO_INCREMENT = 4;
ALTER TABLE audit_logs AUTO_INCREMENT = 2;
ALTER TABLE notification_campaigns AUTO_INCREMENT = 2;
ALTER TABLE user_notifications AUTO_INCREMENT = 4;

SET FOREIGN_KEY_CHECKS = 1;