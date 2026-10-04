-- 1. Đảm bảo hỗ trợ Emoji (utf8mb4)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- FILE 2: DỮ LIỆU GỐC & NGƯỜI DÙNG (BẢN ĐÃ FIX)
-- ========================================================

-- 1. NGƯỜI DÙNG (Thêm cột token_version mặc định là 1 để khớp với JwtAuthenticationFilter)
DELETE FROM `users`;
INSERT INTO `users` (id, email, password, full_name, phone, avatar_url, status, token_version, created_at, updated_at) VALUES 
(1, 'admin@dineease.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Super Admin', '0999999999', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'ACTIVE', 1, NOW(), NOW()),
(2, 'yume@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Kimura Takeshi', '0911222333', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'ACTIVE', 1, NOW(), NOW()),
(3, 'mammamia@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Giovanni Russo', '0944555666', NULL, 'ACTIVE', 1, NOW(), NOW()),
(4, 'bullsteak@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'John Smith', '0901234567', NULL, 'ACTIVE', 1, NOW(), NOW()),
(5, 'sakura@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Owner Sakura', '0988111222', NULL, 'ACTIVE', 1, NOW(), NOW()),
(6, 'lescale@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Owner LEscale', '0977333444', NULL, 'ACTIVE', 1, NOW(), NOW()),
(7, 'yen.nguyen@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Nguyễn Hoàng Yến', '0901111111', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ACTIVE', 1, NOW(), NOW()),
(8, 'elon@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Elon Musk', '0902222222', 'https://images.unsplash.com/photo-1564564321837-a57b60845aa4?w=150', 'ACTIVE', 1, NOW(), NOW()),
(9, 'trump@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Donald Trump', '0903333333', 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150', 'ACTIVE', 1, NOW(), NOW()),
(10, 'mytam@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'Thích Mỹ Tâm', '0904444444', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ACTIVE', 1, NOW(), NOW()),
(11, 'annguyen@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 'An Nguyễn', '0905555555', NULL, 'ACTIVE', 1, NOW(), NOW());

-- 2. QUYỀN TRUY CẬP (Đã khớp với IDs ở trên)
DELETE FROM user_roles;
INSERT INTO user_roles (user_id, role) VALUES 
(1, 'ADMIN'), (1, 'CUSTOMER'), 
(2, 'RESTAURANT'), (3, 'RESTAURANT'), (4, 'RESTAURANT'), (5, 'RESTAURANT'), (6, 'RESTAURANT'),
(7, 'CUSTOMER'), (8, 'CUSTOMER'), (9, 'CUSTOMER'), (10, 'CUSTOMER'), (11, 'CUSTOMER');

-- 3. HỒ SƠ KHÁCH HÀNG (Điểm tích lũy)
DELETE FROM customer_profiles;
INSERT INTO customer_profiles (id, user_id, loyalty_points, total_bookings) VALUES 
(1, 7, 1500, 5), (2, 8, 500, 2), (3, 9, 0, 1), (4, 10, 300, 3), (5, 11, 100, 1);

-- 4. DANH MỤC ẨM THỰC (Cuisines)
DELETE FROM cuisines;
INSERT INTO cuisines (id, name, icon_url) VALUES 
(1, 'Món Việt', '🍜'), (2, 'Món Nhật', '🍣'), (3, 'Đồ Âu', '🍕'), 
(4, 'Hải Sản', '🦞'), (5, 'Ăn Chay', '🥗'), (6, 'Steak', '🥩'), (7, 'Món Hàn', '🍱');

-- 5. TIỆN ÍCH (Amenities)
DELETE FROM amenities;
INSERT INTO amenities (id, name, icon) VALUES 
(1, 'Chỗ đậu ôtô', '🅿️'), (2, 'Có phòng VIP', '👑'), (3, 'Khu vui chơi trẻ em', '👶'),
(4, 'Thanh toán thẻ', '💳'), (5, 'Khu vực hút thuốc', '🚬'), (6, 'Lối đi xe lăn', '♿');

-- 6. CẤU HÌNH HỆ THỐNG
DELETE FROM global_settings;
INSERT INTO global_settings (setting_key, setting_value, description) 
VALUES ('DEFAULT_COMMISSION', '15.0', 'Mức hoa hồng mặc định áp dụng cho nhà hàng mới.');

-- 7. RESET AUTO_INCREMENT (Quan trọng: Để Java insert không bị trùng ID)
ALTER TABLE users AUTO_INCREMENT = 12;
ALTER TABLE customer_profiles AUTO_INCREMENT = 6;
ALTER TABLE cuisines AUTO_INCREMENT = 8;
ALTER TABLE amenities AUTO_INCREMENT = 7;

SET FOREIGN_KEY_CHECKS = 1;