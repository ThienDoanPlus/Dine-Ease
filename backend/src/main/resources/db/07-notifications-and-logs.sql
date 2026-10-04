-- ========================================================
-- FILE: 07-notifications-and-logs.sql
-- ========================================================

-- 1. NHẬT KÝ ĐIỀU CHỈNH HỆ THỐNG (Audit Logs)
INSERT INTO `audit_logs` (`id`, `time`, `admin_email`, `admin_name`, `action`, `old_value`, `new_value`, `reason`) VALUES 
(1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'admin@dineease.com', 'Hệ Thống Admin', 'Cập nhật mức chiết khấu', '10.0%', '15.0%', 'Tăng chiết khấu để bù đắp chi phí server.'),
(2, DATE_SUB(NOW(), INTERVAL 5 HOUR), 'admin@dineease.com', 'Hệ Thống Admin', 'Thay đổi trạng thái Nhà hàng', 'ACTIVE', 'INACTIVE', NULL),
(3, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'admin@dineease.com', 'Hệ Thống Admin', 'Xóa Danh mục', 'Món Thái', 'Đã Xóa', NULL);

-- 2. CHIẾN DỊCH THÔNG BÁO TỪ ADMIN (Notification Campaigns)
INSERT INTO `notification_campaigns` (`id`, `title`, `content`, `target_audience`, `channel`, `status`, `type`, `scheduled_time`, `admin_id`, `created_at`) VALUES 
(1, '🚀 Cập nhật phiên bản Dine-Ease v2.0', '<p>Chào mừng bạn đến với phiên bản mới của <strong>Dine-Ease</strong>.</p><p>Hệ thống vừa được nâng cấp tính năng Sơ đồ bàn kéo thả và Trợ lý ảo AI.</p>', 'ALL', 'IN_APP', 'SENT', 'SYSTEM', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 3. HỘP THƯ THÔNG BÁO CÁ NHÂN (User Notifications)
INSERT INTO `user_notifications` (`id`, `title`, `content`, `is_read`, `type`, `user_id`, `campaign_id`, `created_at`) VALUES 
(1, '🚀 Cập nhật phiên bản Dine-Ease v2.0', '<p>Chào mừng bạn đến với phiên bản mới của <strong>Dine-Ease</strong>.</p><p>Hệ thống vừa được nâng cấp tính năng Sơ đồ bàn kéo thả và Trợ lý ảo AI.</p>', 0, 'SYSTEM', 2, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, '✅ Đặt bàn thành công tại Yume Sushi', 'Đơn đặt bàn <strong>#2</strong> của bạn lúc 20:30 tối nay đã được nhà hàng xác nhận. Nhớ đến đúng giờ nhé!', 0, 'ORDER', 2, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, '🎁 Tặng bạn mã giảm giá 50K', 'Sử dụng ngay mã <strong>GIAM50K</strong> để được giảm 50.000đ cho hóa đơn tiếp theo.', 1, 'PROMO', 2, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, '⚠️ Đơn đặt bàn đã bị hủy', 'Đơn đặt bàn #3 của bạn ngày hôm qua đã bị hủy do yêu cầu từ phía bạn.', 0, 'ALERT', 2, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, '🔔 Bạn có 1 đơn đặt bàn mới', 'Khách hàng Nguyễn Hoàng Yến vừa đặt 1 bàn cho 2 người lúc 19:00 hôm nay. Vui lòng xác nhận.', 0, 'ORDER', 4, NULL, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Báo cáo hoàn tất
SELECT 'Khởi tạo Log và Thông báo thành công!' AS result;