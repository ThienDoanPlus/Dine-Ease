-- ========================================================
-- FILE: 04-menus-and-options.sql
-- ========================================================
INSERT INTO `menu_categories` (`id`, `name`, `restaurant_id`, `sort_order`) VALUES 
(1, 'Sushi & Sashimi', 1, 1), 
(2, 'Món Chính', 1, 2), 
(3, 'Đồ Uống', 1, 3);

INSERT INTO `menu_items` (`id`, `name`, `description`, `price`, `is_bestseller`, `status`, `category_id`, `restaurant_id`, `created_at`, `updated_at`) VALUES
(1, 'Sashimi Cá Hồi Na Uy', '5 miếng cá hồi sống.', 185000, 1, 'AVAILABLE', 1, 1, NOW(), NOW()),
(2, 'Beefsteak Wagyu A5', 'Wagyu Nhật nướng đá.', 1250000, 1, 'AVAILABLE', 2, 1, NOW(), NOW()),
(3, 'Trà Sữa Matcha Zen', 'Matcha Nhật.', 55000, 0, 'AVAILABLE', 3, 1, NOW(), NOW()),
(4, 'Cua Hoàng Đế', 'Hết hàng.', 3500000, 0, 'SOLD_OUT', 2, 1, NOW(), NOW());

INSERT INTO `menu_item_images` (`id`, `menu_item_id`, `image_url`) VALUES 
(1, 1, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600'),
(2, 2, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600'),
(3, 3, 'https://images.unsplash.com/photo-1544145945-f904253db0ad?w=600'),
(4, 4, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600');

INSERT INTO `menu_item_option_groups` (`id`, `menu_item_id`, `name`, `is_required`, `max_choices`) VALUES 
(1, 2, 'Chọn độ chín', 1, 1),
(2, 3, 'Thêm Topping', 0, 3);

-- ĐÃ FIX: Sửa chữ `price` thành `additional_price` để khớp với Entity
INSERT INTO `menu_item_option_choices` (`id`, `group_id`, `name`, `additional_price`) VALUES 
(1, 1, 'Rare', 0.0), 
(2, 1, 'Medium Rare', 0.0), 
(3, 1, 'Well Done', 0.0),
(4, 2, 'Trân châu trắng', 10000.0), 
(5, 2, 'Kem Cheese', 15000.0);

SELECT 'Khởi tạo Thực đơn thành công!' AS result;