-- ========================================================
-- FILE 1: DỌN SẠCH TOÀN BỘ DATABASE
-- (Xóa theo thứ tự từ bảng con đến bảng cha)
-- ========================================================
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM user_notifications;
DELETE FROM notification_campaigns; 
DELETE FROM restaurant_amenities; 
DELETE FROM amenities; 
DELETE FROM audit_logs;
DELETE FROM global_settings;
DELETE FROM order_item_choices;       
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM reservation_tables;
DELETE FROM reviews;
DELETE FROM payments;
DELETE FROM reservations;
DELETE FROM menu_item_option_choices; 
DELETE FROM menu_item_option_groups;  
DELETE FROM menu_item_images;         
DELETE FROM menu_items;
DELETE FROM menu_categories;
DELETE FROM restaurant_tables;
DELETE FROM restaurant_images;
DELETE FROM restaurants;
DELETE FROM cuisines;
DELETE FROM customer_profiles;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM invalidated_tokens;

SET FOREIGN_KEY_CHECKS = 1;