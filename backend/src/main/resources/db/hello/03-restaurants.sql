SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- FILE 3: DỮ LIỆU NHÀ HÀNG, THỰC ĐƠN & BÀN (BẢN FIX)
-- ========================================================

-- 1. HỒ SƠ NHÀ HÀNG
DELETE FROM restaurants;
INSERT INTO restaurants (id, name, description, address, phone_contact, commission_rate, status, owner_id, avg_rating, image_main, avg_price, cuisine_id, deposit_amount, max_pax, created_at, updated_at) VALUES 
(1, 'Yume Sushi Central', 'Tọa lạc tại trung tâm Quận 1 sôi động, Yume Sushi Central mang đến một hành trình ẩm thực Nhật Bản tinh tế.', '123 Lê Lợi, Quận 1, TP. HCM', '0281234567', 15.0, 'ACTIVE', 2, 4.8, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200', 500000.00, 2, 100000.00, 20, NOW(), NOW()),
(2, 'Mamma Mia', 'Nhà hàng Ý đích thực với Pizza nướng củi và Pasta làm thủ công mỗi ngày.', '45 Thảo Điền, Quận 2, TP. HCM', '0287654321', 15.0, 'ACTIVE', 3, 4.8, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 450000.00, 3, 100000.00, 15, NOW(), NOW()),
(3, 'The Bull Steakhouse', 'Trải nghiệm bò Wagyu A5 và Tomahawk thượng hạng nướng trên đá nóng núi lửa.', '25 Ngô Thời Nhiệm, Quận 3, TP. HCM', '0912333444', 20.0, 'ACTIVE', 4, 4.7, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 900000.00, 6, 200000.00, 10, NOW(), NOW()),
(4, 'Sakura Garden Deli', 'Ẩm thực Nhật Bản truyền thống giữa khu vườn hoa anh đào.', '18 Phan Xích Long, Quận Phú Nhuận, TP.HCM', '0988777666', 15.0, 'ACTIVE', 5, 4.8, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', 350000.00, 2, 50000.00, 30, NOW(), NOW()),
(5, 'L Escale Restaurant', 'Ẩm thực Việt Nam sáng tạo kết hợp Fine Dining đẳng cấp.', '90 Tôn Đức Thắng, Quận 1, TP. HCM', '0933222111', 12.0, 'ACTIVE', 6, 4.6, 'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800', 700000.00, 1, 150000.00, 12, NOW(), NOW());

DELETE FROM restaurant_amenities;
INSERT INTO restaurant_amenities (restaurant_id, amenity_id) VALUES
(1, 2), (1, 4), (2, 4), (2, 1), (3, 1), (3, 2), (3, 4), (4, 1), (4, 4), (4, 6), (5, 2), (5, 4);

-- 2. THỰC ĐƠN
DELETE FROM menu_categories;
INSERT INTO menu_categories (id, name, restaurant_id, sort_order) VALUES 
(1, 'Khai vị', 1, 1), (2, 'Sushi & Sashimi', 1, 2), (3, 'Món nóng', 1, 3), (4, 'Đồ uống', 1, 4),
(5, 'Pizza & Pasta', 2, 1), (6, 'Steak Cuts', 3, 1);

DELETE FROM menu_items;
INSERT INTO menu_items (id, name, description, price, is_bestseller, status, category_id, restaurant_id, created_at, updated_at) VALUES
(1, 'Gỏi cuốn tôm thịt', 'Tôm tươi, thịt ba rọi kèm bún và rau thơm', 45000, 1, 'AVAILABLE', 1, 1, NOW(), NOW()),
(2, 'Sashimi Cá Hồi', '5 miếng cá hồi tươi sống nhập khẩu Na Uy', 180000, 1, 'AVAILABLE', 2, 1, NOW(), NOW()),
(3, 'Combo Sushi Yume 1', 'Gồm 12 miếng sushi tổng hợp đặc biệt', 450000, 1, 'AVAILABLE', 2, 1, NOW(), NOW()),
(4, 'Mì Udon Bò', 'Sợi mì Udon dai ngon cùng thịt bò Mỹ', 125000, 0, 'AVAILABLE', 3, 1, NOW(), NOW()),
(5, 'Trà đào cam sả', 'Giải nhiệt mùa hè', 45000, 0, 'AVAILABLE', 4, 1, NOW(), NOW()),
(6, 'Pizza Margherita', 'Pizza nướng củi chuẩn Napoli', 250000, 1, 'AVAILABLE', 5, 2, NOW(), NOW()),
(7, 'Spaghetti Carbonara', 'Mì Ý sốt kem phô mai, trứng', 280000, 1, 'AVAILABLE', 5, 2, NOW(), NOW()),
(8, 'Bò Tomahawk 1.2kg', 'Lõi vai bò Úc kèm xương', 1800000, 1, 'AVAILABLE', 6, 3, NOW(), NOW());

DELETE FROM menu_item_images;
INSERT INTO menu_item_images (id, menu_item_id, image_url) VALUES 
(1, 1, 'https://images.unsplash.com/photo-1539136788836-5699e78bac75?w=600'),
(2, 2, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600'),
(3, 3, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600'),
(4, 8, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600');

DELETE FROM menu_item_option_groups;
INSERT INTO menu_item_option_groups (id, menu_item_id, name, is_required, max_choices) VALUES
(1, 8, 'Độ chín', 1, 1),
(2, 5, 'Chọn Size', 1, 1),
(3, 5, 'Thêm Topping', 0, 3);

-- FIX LỖI: Đổi cột 'price' thành 'additional_price' để khớp Entity Java
DELETE FROM menu_item_option_choices;
INSERT INTO menu_item_option_choices (id, group_id, name, additional_price) VALUES
(1, 1, 'Rare (Tái)', 0), (2, 1, 'Medium Rare', 0), (3, 1, 'Well Done (Chín kỹ)', 0),
(4, 2, 'Size M', 0), (5, 2, 'Size L', 10000),
(6, 3, 'Thêm Shot Espresso', 15000), (7, 3, 'Trân châu trắng', 10000);

-- 3. SƠ ĐỒ BÀN
DELETE FROM restaurant_tables;
INSERT INTO restaurant_tables (id, table_name, capacity, status, restaurant_id, pos_x, pos_y, width, height, shape, rotation, floor_name) VALUES
(1, '001', 4, 'AVAILABLE', 1, 100, 250, 80, 80, 'rect', 0, '1_main'),
(2, '002', 4, 'OCCUPIED', 1, 250, 250, 80, 80, 'rect', 0, '1_main'),
(3, '003', 2, 'AVAILABLE', 1, 400, 250, 80, 80, 'circle', 0, '1_main'),
(4, '004', 6, 'RESERVED', 1, 550, 250, 120, 80, 'rect', 0, '1_main'),
(5, 'VIP 1', 8, 'AVAILABLE', 1, 300, 300, 150, 150, 'circle', 0, '1_vip1'),
(6, 'G-01', 4, 'AVAILABLE', 1, 100, 100, 80, 80, 'rect', 0, '1_garden'),
(7, 'M1', 4, 'AVAILABLE', 2, 100, 100, 80, 80, 'rect', 0, '1_main'), 
(8, 'M2', 6, 'AVAILABLE', 2, 200, 100, 80, 80, 'rect', 0, '1_main'), 
(9, 'S1', 4, 'AVAILABLE', 3, 100, 100, 80, 80, 'rect', 0, '1_main'), 
(10, 'S2', 2, 'AVAILABLE', 3, 200, 100, 80, 80, 'rect', 0, '1_main'), 
(11, 'SA1', 10, 'AVAILABLE', 4, 100, 100, 80, 80, 'rect', 0, '1_main');

-- 4. RESET AUTO_INCREMENT (Để Java không bị lỗi trùng ID khi thêm món mới)
ALTER TABLE restaurants AUTO_INCREMENT = 6;
ALTER TABLE menu_categories AUTO_INCREMENT = 7;
ALTER TABLE menu_items AUTO_INCREMENT = 9;
ALTER TABLE menu_item_images AUTO_INCREMENT = 5;
ALTER TABLE menu_item_option_groups AUTO_INCREMENT = 4;
ALTER TABLE menu_item_option_choices AUTO_INCREMENT = 8;
ALTER TABLE restaurant_tables AUTO_INCREMENT = 12;

SET FOREIGN_KEY_CHECKS = 1;