Để bạn có thể test **vét cạn 100% các luồng nghiệp vụ** cho cả 3 Role (Admin, Restaurant, User) mà không gặp lỗi thiếu dữ liệu, chúng ta cần chuẩn bị các file SQL phủ sóng mọi "edge cases" (trường hợp ngoại lệ/đặc biệt) được đề cập trong Test Plan.

Để quản lý dễ dàng và không bị lỗi khóa ngoại (Foreign Key), tôi sẽ chia bộ dữ liệu test này thành **7 file SQL**. Dưới đây là danh sách và nội dung chứa bên trong mỗi file (Tôi chỉ liệt kê logic, chưa viết code SQL vội theo ý bạn):

---

### 1. `01-clear-database.sql`
* **Mục đích:** Dọn sạch sẽ Database (TRUNCATE) trước khi bơm dữ liệu test để tránh lỗi trùng lặp ID (Duplicate Key).
* **Nội dung:** Tắt kiểm tra khóa ngoại (`SET FOREIGN_KEY_CHECKS = 0;`), chạy lệnh `TRUNCATE` tuần tự từ bảng con đến bảng cha, sau đó bật lại khóa ngoại.

---

### 2. `02-master-data-and-users.sql`
* **Mục đích:** Khởi tạo dữ liệu gốc của hệ thống và các tài khoản để đăng nhập test.
* **Nội dung chi tiết:**
  * **Global Settings:** Setup mức hoa hồng mặc định (15%).
  * **Cuisines & Amenities:** Các loại ẩm thực và tiện ích dùng chung.
  * **Users (Tất cả pass là 123456):**
    * 1 tài khoản `Super Admin`.
    * 1 tài khoản `Customer` cấp VVIP (nhiều điểm).
    * 1 tài khoản `Customer` mới tinh (0 điểm).
    * 3 tài khoản `Restaurant Owner` (Để gắn vào 3 nhà hàng có trạng thái khác nhau ở File 3).

---

### 3. `03-restaurants-and-tables.sql`
* **Mục đích:** Phục vụ test luồng **Duyệt đối tác của Admin** và **Sơ đồ bàn của Restaurant**.
* **Nội dung chi tiết:**
  * **Nhà hàng A (ACTIVE):** Đang hoạt động bình thường. Phục vụ test các luồng chính (Menu, Đặt bàn, KOT, POS).
  * **Nhà hàng B (PENDING):** Đang chờ duyệt. (Dành cho Admin test luồng Phê duyệt / Yêu cầu bổ sung; và Chủ quán đăng nhập vào thấy thanh cảnh báo màu đỏ).
  * **Nhà hàng C (INACTIVE):** Bị Admin khóa. (Dành cho Admin test luồng Mở khóa; User search không thấy; Chủ quán đăng nhập bị cảnh báo).
  * **Tables (Sơ đồ bàn cho Nhà hàng A):**
    * Bàn `001`: Trống (AVAILABLE).
    * Bàn `002`: Đang phục vụ (OCCUPIED).
    * Bàn `003`: Đang gộp với bàn khác (Có `merged_id`).
    * Bàn `004`: Bị hỏng/Bảo trì (MAINTENANCE - Test Context Menu).
    * Dữ liệu JSON `architectural_data`: Tường, cửa sổ.

---

### 4. `04-menus-and-options.sql`
* **Mục đích:** Phục vụ test luồng **Quản lý Menu** và **Tùy chỉnh món tại POS**.
* **Nội dung chi tiết:**
  * **Categories:** Các danh mục Món chính, Nước uống...
  * **Menu Items:**
    * 3 món bình thường (Đang bán - AVAILABLE).
    * 1 món đặc biệt (Hết hàng - SOLD_OUT) -> Để test xem khách/POS có bị chặn không.
  * **Toppings & Options (Cực kỳ quan trọng cho POS):**
    * Cấu hình "Độ chín Steak" (Bắt buộc chọn, max 1).
    * Cấu hình "Thêm Topping Trà sữa" (Không bắt buộc, có cộng thêm tiền).

---

### 5. `05-reservations-and-reviews.sql`
* **Mục đích:** Phục vụ test luồng **Kanban Đặt bàn (Restaurant)** và **Lịch sử đặt bàn (User)**.
* **Nội dung chi tiết (Các Booking mẫu):**
  * **Booking 1 (PENDING):** Đơn mới đặt cho ngày mai (Để chủ quán test nút Xác nhận/Từ chối trên Kanban).
  * **Booking 2 (CONFIRMED):** Đã xác nhận (Để chủ quán test nút Xếp bàn cho khách).
  * **Booking 3 (CANCELLED):** Đơn đã hủy kèm lý do (Để User xem trong lịch sử).
  * **Booking 4 (COMPLETE - Chưa đánh giá):** Đơn đã hoàn tất, nhưng `is_reviewed = false` (Để User test chức năng Submit Review sao).
  * **Booking 5 (COMPLETE - Đã đánh giá):** Có sẵn data trong bảng `reviews` (Để User thấy nút bị vô hiệu hóa "Đã đánh giá").

---

### 6. `06-orders-pos-kitchen.sql`
* **Mục đích:** Phục vụ test luồng **Bếp (KOT)** và **Thu ngân (POS)**.
* **Nội dung chi tiết:**
  * **Order 1 (Đang mở tại bàn 002):**
    * Có 1 món đang `PENDING` (Để test nút Nấu ở Bếp).
    * Có 1 món đang `COOKING` (Để test nút Hoàn tất ở Bếp).
    * Có 1 món đang `READY` (Nấu xong, để test nút Bưng món ở POS).
  * **Order 2 (Test tính toán POS):**
    * Một Order đã được áp sẵn Voucher (giảm tiền) và Phụ phí (Surcharge).
  * **Order 3 (Takeaway):** Order không gắn với `table_id` nào.

---

### 7. `07-notifications-and-logs.sql`
* **Mục đích:** Phục vụ test hộp thư **Thông báo** và **Audit Log của Admin**.
* **Nội dung chi tiết:**
  * **Audit Logs:** 2-3 dòng log ghi nhận Admin đã đổi cấu hình hệ thống (Để test bảng Lịch sử điều chỉnh).
  * **Notification Campaigns:** Một chiến dịch Admin đã gửi "Cập nhật ứng dụng".
  * **User Notifications:**
    * 1 thông báo `SYSTEM` (Chưa đọc).
    * 1 thông báo `ORDER` (Chưa đọc - Chấm đỏ).
    * 1 thông báo `PROMO` (Đã đọc - Chữ xám).

---

Bạn thấy cấu trúc chia file và bao phủ các Test Case như thế này đã hợp lý và đầy đủ chưa? Nếu bạn đồng ý, tôi sẽ bắt tay vào viết code SQL cực kỳ chi tiết cho từng file một!