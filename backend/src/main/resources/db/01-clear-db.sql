-- ========================================================
-- FILE: 01-clear-database.sql (Sử dụng DELETE FROM)
-- MỤC ĐÍCH: Dọn dẹp dữ liệu và reset bộ đếm ID về 1
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Nhóm Thông báo & Nhật ký
DELETE FROM `user_notifications`;
ALTER TABLE `user_notifications` AUTO_INCREMENT = 1;

DELETE FROM `notification_campaigns`;
ALTER TABLE `notification_campaigns` AUTO_INCREMENT = 1;

DELETE FROM `audit_logs`;
ALTER TABLE `audit_logs` AUTO_INCREMENT = 1;

-- 2. Nhóm Vận hành (POS & Bếp)
DELETE FROM `order_item_choices`;
ALTER TABLE `order_item_choices` AUTO_INCREMENT = 1;

DELETE FROM `order_items`;
ALTER TABLE `order_items` AUTO_INCREMENT = 1;

DELETE FROM `orders`;
ALTER TABLE `orders` AUTO_INCREMENT = 1;

-- 3. Nhóm Đặt bàn & Đánh giá & Thanh toán
DELETE FROM `reservation_tables`;
ALTER TABLE `reservation_tables` AUTO_INCREMENT = 1;

DELETE FROM `reviews`;
ALTER TABLE `reviews` AUTO_INCREMENT = 1;

DELETE FROM `payments`;
ALTER TABLE `payments` AUTO_INCREMENT = 1;

DELETE FROM `reservations`;
ALTER TABLE `reservations` AUTO_INCREMENT = 1;

-- 4. Nhóm Thực đơn (Menu)
DELETE FROM `menu_item_option_choices`;
ALTER TABLE `menu_item_option_choices` AUTO_INCREMENT = 1;

DELETE FROM `menu_item_option_groups`;
ALTER TABLE `menu_item_option_groups` AUTO_INCREMENT = 1;

DELETE FROM `menu_item_images`;
ALTER TABLE `menu_item_images` AUTO_INCREMENT = 1;

DELETE FROM `menu_items`;
ALTER TABLE `menu_items` AUTO_INCREMENT = 1;

DELETE FROM `menu_categories`;
ALTER TABLE `menu_categories` AUTO_INCREMENT = 1;

-- 5. Nhóm Cấu trúc Nhà hàng
DELETE FROM `restaurant_tables`;
ALTER TABLE `restaurant_tables` AUTO_INCREMENT = 1;

DELETE FROM `restaurant_amenities`;
-- Bảng này thường không có ID tự tăng vì là bảng trung gian, nhưng nếu có bạn hãy thêm ALTER

DELETE FROM `restaurant_images`;
ALTER TABLE `restaurant_images` AUTO_INCREMENT = 1;

DELETE FROM `legal_documents`;
ALTER TABLE `legal_documents` AUTO_INCREMENT = 1;

DELETE FROM `restaurants`;
ALTER TABLE `restaurants` AUTO_INCREMENT = 1;

-- 6. Nhóm Người dùng & Phân quyền
DELETE FROM `customer_profiles`;
ALTER TABLE `customer_profiles` AUTO_INCREMENT = 1;

DELETE FROM `user_roles`;
-- Bảng này thường là bảng trung gian, không cần reset auto_increment

DELETE FROM `users`;
ALTER TABLE `users` AUTO_INCREMENT = 1;

DELETE FROM `invalidated_tokens`;

-- 7. Nhóm Master Data (Dữ liệu dùng chung)
DELETE FROM `cuisines`;
ALTER TABLE `cuisines` AUTO_INCREMENT = 1;

DELETE FROM `amenities`;
ALTER TABLE `amenities` AUTO_INCREMENT = 1;

DELETE FROM `global_settings`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database đã được dọn dẹp và reset ID thành công!' AS result;