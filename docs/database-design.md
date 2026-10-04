# 🗄️ Tài Liệu Thiết Kế Cơ Sở Dữ Liệu (Database Design) - Hệ Thống Đặt Bàn Nhà Hàng

**Sơ đồ (ERD):**

![Sơ đồ Database](screenshots/class_diagram/class_diagram.png)
---

## 📌 DANH SÁCH CÁC ENUMS SỬ DỤNG TRONG HỆ THỐNG
Để tối ưu hóa cơ sở dữ liệu, hệ thống sử dụng các Enum sau cho các cột trạng thái/loại:

*   **USER_ROLE:** `ADMIN`, `RESTAURANT`, `USER`
*   **USER_STATUS:** `ACTIVE`, `INACTIVE`, `BANNED`
*   **STAFF_POSITION:** `OWNER`, `MANAGER`, `RECEPTIONIST`, `CASHIER`
*   **RESTAURANT_STATUS:** `PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `INACTIVE`
*   **TABLE_STATUS:** `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`
*   **MENU_ITEM_STATUS:** `AVAILABLE`, `SOLD_OUT`, `HIDDEN`
*   **DEPOSIT_TYPE:** `FIXED_AMOUNT`, `PERCENTAGE`
*   **RESERVATION_STATUS:** `PENDING`, `AWAITING_DEPOSIT`, `CONFIRMED`, `CHECKED_IN`, `COMPLETE`, `CANCELLED`
*   **PAYMENT_TYPE:** `DEPOSIT`, `FINAL_PAYMENT`
*   **PAYMENT_METHOD:** `CASH`, `MOMO`, `VNPAY`
*   **PAYMENT_STATUS:** `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
*   **CAMPAIGN_TARGET:** `ALL`, `CUSTOMER`, `RESTAURANT`, `SPECIFIC_USER`
*   **CAMPAIGN_CHANNEL:** `IN_APP`, `EMAIL`
*   **CAMPAIGN_STATUS:** `SCHEDULED`, `PROCESSING`, `SENT`, `FAILED`

---

## PHÂN HỆ 1: ADMIN
*Phân hệ lưu trữ thông tin tài khoản, phân quyền, hồ sơ cá nhân và hệ thống thông báo.*

### 1. Bảng `User` (Tài khoản)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | long | **PK** | Định danh tài khoản |
| `email` | varchar | Unique | Email đăng nhập |
| `password` | varchar | | Mật khẩu (Đã mã hóa/Hash) |
| `full_name` | varchar | | Họ và tên |
| `phone` | varchar | Unique | Số điện thoại |
| `status` | enum | | Trạng thái tài khoản (ACTIVE, BANNED...) |
| `created_at` | date | | Ngày tạo tài khoản |
| `updated_at` | date | | Ngày cập nhật gần nhất |
| `avatar_url` | varchar | | Đường dẫn ảnh đại diện |
| `role` | enum | | Phân quyền (ADMIN, RESTAURANT, USER) |

### 2. Bảng `CustomerProfile` (Hồ sơ Khách hàng)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `user_id` | long | **FK** | Trỏ đến `User.id` (1 - 0..1) |
| `loyalty_points` | int | | Điểm tích lũy thành viên |
| `total_bookings` | int | | Tổng số lần đã đặt bàn thành công |

### 3. Bảng `StaffProfile` (Hồ sơ Nhân viên / Chủ quán)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `user_id` | long | **FK** | Trỏ đến `User.id` (1 - 0..1) |
| `restaurant_id` | int | **FK** | Trỏ đến `Restaurant.id` |
| `position` | enum | | Chức vụ (OWNER, MANAGER...) |

### 4. Bảng `NotificationCampaign` (Chiến dịch Thông báo)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `admin_id` | long | **FK** | Trỏ đến `User.id` (Người tạo chiến dịch) |
| `title` | varchar | | Tiêu đề thông báo |
| `content` | varchar | | Nội dung chi tiết |
| `target_audience` | enum | | Đối tượng nhận (ALL, CUSTOMER...) |
| `channel` | enum | | Kênh gửi (IN_APP, EMAIL) |
| `status` | enum | | Trạng thái gửi (SENT, SCHEDULED...) |
| `scheduled_time` | date | | Thời gian hẹn giờ gửi (Nullable) |

### 5. Bảng `UserNotification` (Thông báo cá nhân)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `user_id` | long | **FK** | Người nhận thông báo (`User.id`) |
| `campaign_id` | int | **FK** | Thuộc chiến dịch nào (`0..1` - Null nếu hệ thống tự động gửi) |
| `title` | varchar | | Tiêu đề hiển thị cho user |
| `content` | varchar | | Nội dung |
| `is_read` | boolean | | Cờ đánh dấu đã đọc |
| `created_at` | int | | Thời gian nhận |

---

## 🏪 PHÂN HỆ 2: NHÀ HÀNG
*Phân hệ lưu trữ thông tin điểm bán, cấu hình, sơ đồ bàn và quản lý danh sách món ăn.*

### 6. Bảng `Restaurant` (Thông tin Nhà hàng)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `status` | enum | | Trạng thái (PENDING, ACTIVE...) |
| `owner_id` | int | **FK** | Trỏ về `User.id` (Chủ sở hữu) |
| `name` | varchar | | Tên nhà hàng |
| `description` | varchar | | Giới thiệu ngắn |
| `address` | varchar | | Địa chỉ chi tiết |
| `phone_contact` | varchar | | SĐT liên hệ của quán |
| `commission_rate` | float | | Mức chiết khấu hoa hồng của Admin (%) |
| `avg_rating` | double | | Điểm đánh giá trung bình |
| `image_main` | varchar | | Ảnh đại diện/Thumbnail chính |

### 7. Bảng `RestaurantConfig` (Cấu hình Nhà hàng)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | Trỏ đến `Restaurant.id` (1-1) |
| `require_deposit` | boolean | | Bắt buộc cọc hay không? |
| `deposit_type` | enum | | Loại cọc (Cố định hay Phần trăm) |
| `deposit_value` | double | | Giá trị tiền cọc |
| `max_pax_per_booking`| int | | Giới hạn số khách tối đa trên 1 đơn |

### 8. Bảng `RestaurantImage` (Thư viện Ảnh)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | Trỏ đến `Restaurant.id` |
| `image_url` | varchar | | URL hình ảnh không gian/món ăn |

### 9. Bảng `OperatingHour` (Giờ Mở Cửa)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | |
| `day_of_week` | int | | Từ 1 (Thứ 2) đến 7 (Chủ nhật) |
| `open_time` | date | | Giờ bắt đầu ca |
| `close_time` | date | | Giờ kết thúc ca |

### 10. Bảng `Cuisine` (Danh mục Ẩm thực)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `name` | varchar | | Tên thẻ (Ví dụ: Món Nhật, Đồ Âu) |
| `icon_url` | varchar | | Icon minh họa |

### 11. Bảng `RestaurantCuisine` (Bảng N-N Nhà hàng - Ẩm thực)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `restaurant_id` | int | **FK** | |
| `cuisine_id` | int | **FK** | |

### 12. Bảng `MenuCategory` (Danh mục Thực đơn của quán)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | |
| `name` | varchar | | Tên danh mục (Khai vị, Tráng miệng) |
| `sort_order` | int | | Thứ tự hiển thị |

### 13. Bảng `MenuItem` (Chi tiết Món ăn)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `category_id` | int | **FK** | Trỏ đến `MenuCategory.id` |
| `restaurant_id` | int | **FK** | |
| `name` | varchar | | Tên món |
| `description` | varchar | | Thành phần/Mô tả |
| `price` | double | | Giá bán |
| `image_url` | varchar | | Ảnh món ăn |
| `is_bestseller` | boolean | | Có phải món bán chạy không? |
| `status` | enum | | Trạng thái (AVAILABLE, SOLD_OUT...) |

### 14. Bảng `OptionGroup` (Nhóm Tùy chọn Món)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | |
| `name` | varchar | | Tên nhóm (Ví dụ: Chọn Size, Topping) |
| `is_mandatory`| int | | Có bắt buộc chọn không? (1=Có, 0=Không) |
| `max_choices` | int | | Số lượng tối đa được chọn |

### 15. Bảng `OptionItem` (Chi tiết Tùy chọn)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `group_id` | int | **FK** | Trỏ về `OptionGroup.id` |
| `name` | varchar | | Tên option (Size L, Thêm phô mai) |
| `additional_price`| double | | Giá cộng thêm |

### 16. Bảng `MenuItem_OptionGroup` (Bảng N-N Món ăn - Tùy chọn)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `menu_item_id` | int | **FK** | |
| `option_group_id`| int | **FK** | Dùng chung Tùy chọn cho nhiều món |

### 17. Bảng `Table` (Sơ đồ Bàn)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | |
| `table_name` | varchar | | Ký hiệu bàn (Ví dụ: VIP-01) |
| `capacity` | int | | Sức chứa (Số ghế) |
| `status` | enum | | Trạng thái hiện tại của bàn |

### 18. Bảng `TableGroup` (Nhóm Bàn - Dùng khi khách đi đông)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | |
| `group_name` | varchar | | Tên nhóm gộp (VD: Gộp Bàn 1+2) |
| `status` | enum | | Trạng thái nhóm (ACTIVE/INACTIVE) |

### 19. Bảng `TableGroupMember` (Bảng N-N Bàn - Nhóm Bàn)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `group_id` | int | **FK** | |
| `table_id` | int | **FK** | |

---

## PHÂN HỆ 3: NGƯỜI DÙNG
*Phân hệ xử lý luồng giao dịch cốt lõi: Đặt chỗ, giữ bàn, thanh toán tiền cọc, voucher và đánh giá.*

### 20. Bảng `Reservation` (Đơn Đặt Bàn)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `customer_id` | long | **FK** | Người đặt |
| `restaurant_id` | int | **FK** | |
| `status` | enum | | Trạng thái đơn (PENDING, COMPLETE...) |
| `reservation_date`| date | | Ngày đến ăn |
| `reservation_time`| time | | Giờ đến ăn |
| `guest_count` | int | | Tổng số lượng khách |
| `notes` | varchar | | Ghi chú yêu cầu đặc biệt |
| `cancel_reason` | varchar | | Lý do hủy (nếu có) |
| `deposit_amount` | double | | Số tiền cọc đã ghi nhận |
| `final_total_amount`| double | | Tổng bill thực tế (Nhà hàng nhập) |
| `commission_amount`| double | | Hoa hồng Admin trích lại từ đơn này |

### 21. Bảng `ReservationTable` (Bảng N-N Đặt Bàn - Bàn thực tế)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `reservation_id`| int | **FK** | |
| `table_id` | int | **FK** | Xếp 1 hoặc nhiều bàn cho 1 đơn đặt |

### 22. Bảng `Payment` (Giao dịch Thanh toán)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `reservation_id`| int | **FK** | Đơn đặt bàn chứa giao dịch này |
| `payment_type` | enum | | Phân loại (DEPOSIT, FINAL_PAYMENT) |
| `payment_method`| enum | | Phương thức (MOMO, VNPAY, CASH) |
| `status` | enum | | Trạng thái thanh toán (SUCCESS, FAILED) |
| `amount` | double | | Số tiền giao dịch |
| `transaction_code`| varchar | | Mã GD từ đối tác ví điện tử |
| `created_at` | date | | Thời gian giao dịch |

### 23. Bảng `Voucher` (Khuyến mãi)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `restaurant_id` | int | **FK** | `0..1` (Null nếu là Voucher toàn sàn) |
| `code` | varchar | Unique | Mã nhập (Ví dụ: GIAM50K) |
| `discount_type` | enum | | Loại giảm (Cố định, Phần trăm) |
| `discount_value`| double | | Mức giảm |
| `min_order_value`| double | | Yêu cầu giá trị đơn tối thiểu |
| `max_discount` | double | | Giảm tối đa bao nhiêu |
| `start_date` | date | | Ngày bắt đầu hiệu lực |
| `end_date` | date | | Ngày hết hạn |
| `usage_limit` | int | | Số lượng mã tối đa được phát hành |

### 24. Bảng `VoucherUsage` (Lịch sử sử dụng Voucher)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `voucher_id` | int | **FK** | |
| `customer_id` | long | **FK** | Người đã dùng mã |
| `reservation_id`| int | **FK** | Đơn đặt bàn áp dụng mã |
| `discount_applied`| double | | Số tiền thực tế được giảm |

### 25. Bảng `Review` (Đánh giá)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `reservation_id`| int | **FK** | Trỏ đến đơn đặt bàn (Mỗi đơn chỉ Review 1 lần) |
| `rating` | int | | Số sao (1 đến 5) |
| `comment` | varchar | | Nội dung đánh giá |
| `reply_from_restaurant`| varchar | | Phản hồi từ phía nhà hàng |
| `created_at` | date | | Thời gian đánh giá |

### 26. Bảng `ReviewMedia` (Ảnh đính kèm Đánh giá)
| Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | int | **PK** | |
| `review_id` | int | **FK** | |
| `media_url` | varchar | | URL hình ảnh / video |