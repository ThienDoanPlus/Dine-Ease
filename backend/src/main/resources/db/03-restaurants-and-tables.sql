-- ========================================================
-- FILE: 03-restaurants-and-tables.sql
-- ========================================================
-- Bổ sung: deposit_amount, max_pax, logo_url
INSERT INTO `restaurants` (`id`, `name`, `description`, `address`, `phone_contact`, `commission_rate`, `deposit_amount`, `max_pax`, `status`, `owner_id`, `avg_rating`, `image_main`, `logo_url`, `avg_price`, `cuisine_id`, `created_at`, `updated_at`, `architectural_data`) VALUES 
(1, 'Yume Sushi Central', 'Hương vị Nhật Bản đích thực giữa lòng Sài Gòn. Chuyên Sushi và Sashimi tươi sống mỗi ngày.', '123 Lê Lợi, Quận 1, TP. HCM', '0281234567', 15.0, 100000.00, 20, 'ACTIVE', 4, 4.8, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200', 500000.00, 2, NOW(), NOW(), 
'[{"id":"w1","type":"wall","x":50,"y":50,"width":800,"height":20,"rotation":0,"label":"Tường mặt tiền","floorName":"1_main"},{"id":"d1","type":"door","x":400,"y":45,"width":80,"height":30,"rotation":0,"label":"Cửa chính","floorName":"1_main"}]'),

(2, 'Mamma Mia Pasta', 'Nhà hàng Ý ấm cúng.', '45 Thảo Điền, Quận 2, TP. HCM', '0287654321', 15.0, 50000.00, 10, 'PENDING', 5, 0.0, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', NULL, 350000.00, 3, NOW(), NOW(), NULL),

(3, 'Locked Garden Cafe', 'Tạm ngưng hoạt động.', '88 Phan Xích Long, Phú Nhuận', '0900000000', 12.0, 0.00, 5, 'INACTIVE', 6, 4.2, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', NULL, 150000.00, 1, NOW(), NOW(), NULL);

INSERT INTO `restaurant_amenities` (`restaurant_id`, `amenity_id`) VALUES (1, 1), (1, 2), (1, 4);

INSERT INTO `restaurant_tables` (`id`, `table_name`, `capacity`, `status`, `restaurant_id`, `pos_x`, `pos_y`, `width`, `height`, `shape`, `rotation`, `floor_name`, `merged_id`) VALUES 
(1, '001', 4, 'AVAILABLE', 1, 150, 150, 80, 80, 'rect', 0, '1_main', NULL),
(2, '002', 4, 'OCCUPIED', 1, 350, 150, 80, 80, 'rect', 0, '1_main', NULL),
(3, '003', 2, 'OCCUPIED', 1, 350, 250, 60, 60, 'circle', 0, '1_main', 2),
(4, '004', 6, 'MAINTENANCE', 1, 550, 150, 120, 80, 'rect', 0, '1_main', NULL),
(5, '005', 2, 'RESERVED', 1, 150, 300, 60, 60, 'circle', 0, '1_main', NULL),
(6, 'M1', 4, 'AVAILABLE', 2, 100, 100, 80, 80, 'rect', 0, '1_main', NULL),
(7, 'L1', 2, 'AVAILABLE', 3, 100, 100, 80, 80, 'rect', 0, '1_main', NULL);

SELECT 'Khởi tạo 3 Nhà hàng và Sơ đồ bàn thành công!' AS result;