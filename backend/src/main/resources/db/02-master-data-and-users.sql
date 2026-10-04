-- ========================================================
-- FILE: 02-master-data-and-users.sql
-- ========================================================
INSERT INTO `global_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('DEFAULT_COMMISSION', '15.0', 'Phần trăm hoa hồng mặc định thu trên mỗi đơn hoàn tất (15%)');

INSERT INTO `cuisines` (`id`, `name`, `icon_url`) VALUES 
(1, 'Món Việt', '🍜'), (2, 'Món Nhật', '🍣'), (3, 'Đồ Âu', '🍕'), (4, 'Hải Sản', '🦞'), (5, 'Ăn Chay', '🥗'), (6, 'Steak', '🥩'), (7, 'Món Hàn', '🍱');

INSERT INTO `amenities` (`id`, `name`, `icon`) VALUES 
(1, 'Chỗ đậu ôtô', '🅿️'), (2, 'Có phòng VIP', '👑'), (3, 'Khu vui chơi trẻ em', '👶'), (4, 'Thanh toán thẻ', '💳'), (5, 'Khu vực hút thuốc', '🚬'), (6, 'Lối đi xe lăn', '♿');

-- Bổ sung cột token_version = 1
INSERT INTO `users` (`id`, `email`, `password`, `token_version`, `full_name`, `phone`, `avatar_url`, `status`, `created_at`, `updated_at`) VALUES 
(1, 'admin@dineease.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 1, 'Hệ Thống Admin', '0999999999', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'ACTIVE', NOW(), NOW()),
(2, 'yen.nguyen@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 1, 'Nguyễn Hoàng Yến', '0901111111', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ACTIVE', NOW(), NOW()),
(3, 'newbie@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 1, 'Khách Mới Toanh', '0902222222', NULL, 'ACTIVE', NOW(), NOW()),
(4, 'owner.yume@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 1, 'Kimura Takeshi', '0911222333', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'ACTIVE', NOW(), NOW()),
(5, 'owner.mammam@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 1, 'Giovanni Russo', '0944555666', NULL, 'ACTIVE', NOW(), NOW()),
(6, 'owner.locked@gmail.com', '$2a$10$m/20NWWMYbZdWo1nYEdzCeS1pMsyr.IYk/5tv98Rk6sVtwjEWmsiC', 1, 'Trần Văn Khóa', '0977888999', NULL, 'ACTIVE', NOW(), NOW());

INSERT INTO `user_roles` (`user_id`, `role`) VALUES 
(1, 'ADMIN'), (1, 'CUSTOMER'), (2, 'CUSTOMER'), (3, 'CUSTOMER'), (4, 'RESTAURANT'), (5, 'RESTAURANT'), (6, 'RESTAURANT');

INSERT INTO `customer_profiles` (`id`, `user_id`, `loyalty_points`, `total_bookings`) VALUES 
(1, 2, 5000, 25), (2, 3, 0, 0);

SELECT 'Khởi tạo Master Data và 6 Users thành công!' AS result;