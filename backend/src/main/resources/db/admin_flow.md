### 1. Luồng Xác thực & Bảo mật (Authentication & Security)
- [ ] **Đăng nhập thành công:** Đăng nhập với tài khoản `admin@dineease.com` -> Chuyển hướng đúng vào trang `/admin`.
- [ ] **Phân quyền truy cập (Authorization):** Copy URL của phân hệ nhà hàng (VD: `/restaurant/tables`) dán vào trình duyệt khi đang là Admin -> Bị hệ thống chặn và đá về trang `/admin` (Trừ khi Admin có thêm quyền RESTAURANT).
- [ ] **Hết hạn phiên đăng nhập (Session Expiry):** Giả lập token hết hạn (hoặc lỗi 403) -> Hệ thống tự động xóa Cookie/LocalStorage và văng ra trang `/login?session_expired=true` kèm theo tham số `callbackUrl` để lưu vết.
- [ ] **Đăng xuất:** Bấm nút Đăng xuất trên Header hoặc Sidebar -> Xóa sạch dữ liệu bộ nhớ tạm và về trang Đăng nhập.

---

### 2. Luồng Dashboard & Báo cáo (Tổng quan - `/admin`)
- [ ] **Hiển thị số liệu:** Kiểm tra 4 thẻ thống kê (Tổng quán, Tổng đơn, Đơn thành công, Doanh thu hoa hồng) có load đúng số không.
- [ ] **Lọc theo ngày (Date Range):** 
  - Chọn "Từ ngày" và "Đến ngày" -> Bấm Áp dụng -> Biểu đồ và số liệu thay đổi.
  - Cố tình chỉ chọn 1 trong 2 ngày -> Bấm Áp dụng -> Hệ thống báo lỗi.
  - Bấm "Xóa bộ lọc" -> Trả về dữ liệu toàn thời gian.
- [ ] **Kiểm tra biểu đồ:** Rê chuột vào biểu đồ dạng vùng (Doanh thu) và biểu đồ tròn (Ẩm thực) -> Hiển thị tooltip chi tiết.
- [ ] **Bảng xếp hạng:** Kiểm tra hiển thị đúng "Top 5 Doanh thu" và "Top 5 Hủy đơn".
- [ ] **Xuất báo cáo (Export):**
  - Bấm "Xuất báo cáo" -> Chọn định dạng Excel (`.xlsx`) -> Tải file thành công.
  - Chọn định dạng PDF (`.pdf`) -> Tải file thành công.

---

### 3. Luồng Duyệt đối tác (Quan trọng nhất - `/admin/partners`)
- [ ] **Lọc trạng thái & Tìm kiếm:** Chuyển qua lại giữa các tab "Tất cả", "Chờ duyệt", "Đã duyệt", "Bị từ chối" và thử gõ thanh tìm kiếm.
- [ ] **Xem chi tiết hồ sơ:** Bấm icon con mắt -> Vào trang chi tiết kiểm tra Avatar, Thông tin pháp lý, Giấy tờ đính kèm.
- [ ] **Hành động: Yêu cầu bổ sung:** Ở trạng thái "Chờ duyệt" -> Bấm "Yêu cầu bổ sung" -> Nhập lý do (VD: Căn cước mờ) -> Bấm gửi -> API gọi thành công gửi email cho chủ quán.
- [ ] **Hành động: Từ chối hồ sơ:** Ở trạng thái "Chờ duyệt" -> Bấm "Từ chối" -> Hồ sơ chuyển sang tab "Bị từ chối".
- [ ] **Hành động: Khôi phục hồ sơ:** Vào tab "Bị từ chối" -> Vào chi tiết -> Bấm "Khôi phục về Chờ duyệt".
- [ ] **Hành động: Phê duyệt (Approve):** Bấm "Phê duyệt" (từ ngoài bảng hoặc trong chi tiết) -> Xác nhận -> Hồ sơ chuyển thành "Đã duyệt" -> Hệ thống tự động set hoa hồng mặc định (15%) và gửi email mật khẩu.

---

### 4. Luồng Quản lý Nhà hàng đang hoạt động (`/admin/restaurants`)
- [ ] **Xem danh sách & Phân trang:** Kiểm tra bảng danh sách, test chức năng chuyển trang (Next/Prev).
- [ ] **Bộ lọc:** Lọc theo trạng thái (Đang hoạt động / Tạm khóa) và tìm kiếm theo tên nhà hàng.
- [ ] **Khóa/Mở khóa nhà hàng (Toggle Lock):**
  - Bấm nút Switch (hoặc icon Ổ khóa) trên 1 nhà hàng đang `ACTIVE` -> Xác nhận -> Chuyển thành `INACTIVE` (Ảnh nhà hàng bị xám đi/grayscale).
  - Bấm mở khóa lại -> Chuyển về `ACTIVE`.
- [ ] **Xem chi tiết:** Bấm icon Sửa (Edit) -> Vào xem chi tiết Profile của nhà hàng đang hoạt động (Giống giao diện duyệt hồ sơ nhưng mất đi các nút duyệt).

---

### 5. Luồng Quản lý Người dùng (`/admin/users`)
- [ ] **Xem & Tìm kiếm:** Gõ tên hoặc email người dùng.
- [ ] **Ban / Unban tài khoản (Khóa User):**
  - Bấm icon Ổ khóa vào tài khoản `CUSTOMER` hoặc `RESTAURANT` -> Xác nhận -> Trạng thái đổi thành "Bị khóa" (Chấm đỏ).
  - Bấm mở khóa -> Trạng thái đổi thành "Hoạt động" (Chấm xanh lá).
- [ ] **Case bảo vệ Admin:** Tìm một tài khoản có role `ADMIN` (VD: Super Admin) -> Verify rằng UI **không hiển thị** nút khóa tài khoản để tránh Admin tự khóa lẫn nhau.

---

### 6. Luồng Quản lý Danh mục Ẩm thực (Cuisines - `/admin/cuisines`)
- [ ] **Thêm mới:**
  - Bấm "Thêm danh mục" -> Không nhập gì -> Báo lỗi.
  - Nhập Icon (Emoji) và Tên -> Có ký tự đặc biệt (VD: `@#!`) -> Báo lỗi Regex.
  - Nhập hợp lệ -> Lưu thành công -> Danh mục mới hiện lên đầu bảng.
- [ ] **Cập nhật (Sửa):** Bấm icon Sửa -> Đổi Emoji hoặc Tên -> Lưu -> Bảng cập nhật tức thì.
- [ ] **Xóa danh mục:** 
  - Xóa 1 danh mục chưa có ai dùng -> Thành công.
  - **[Cực kỳ quan trọng]:** Thử xóa 1 danh mục đang được gắn cho 1 nhà hàng (VD: "Món Nhật" đang gắn cho Yume Sushi) -> Hệ thống phải báo lỗi (Do ràng buộc khóa ngoại DB).

---

### 7. Luồng Trung tâm Truyền thông (Notifications/Campaigns - `/admin/notifications`)
- [ ] **Tạo thông báo (Gửi ngay):** 
  - Soạn Tiêu đề, Nội dung (Thử up ảnh vào RichText).
  - Phân loại (Hệ thống/Khuyến mãi), Đối tượng (Tất cả/Khách/Chủ quán), Kênh (App/Email).
  - Chọn "Gửi ngay" -> Bấm Lưu -> Chiến dịch vào lịch sử với trạng thái "SENT" hoặc "PROCESSING".
- [ ] **Tạo thông báo (Lên lịch - Scheduled):**
  - Chọn ngày trong quá khứ -> Báo lỗi.
  - Chọn ngày/giờ tương lai -> Bấm Lưu -> Chiến dịch vào lịch sử với trạng thái "SCHEDULED".
- [ ] **Kiểm tra Live Preview:** Đảm bảo khi gõ Tiêu đề/Nội dung, cái điện thoại ảo bên phải nhảy chữ theo thời gian thực (Cắt thẻ HTML).
- [ ] **Hủy chiến dịch khẩn cấp:** Chuyển sang Tab "Lịch sử" -> Tìm chiến dịch đang "SCHEDULED" -> Bấm nút 'X' đỏ -> Xác nhận -> Đổi trạng thái thành "CANCELED".
- [ ] **Dọn rác Cloudinary (Edge case):** Upload 1 ảnh vào khung soạn thảo, sau đó xóa ảnh đó đi, hoặc bấm nút "Hủy" form -> Kiểm tra xem API `useDeleteImage` có được gọi để dọn ảnh thừa không.

---

### 8. Luồng Cấu hình Tài chính & Lịch sử (Settings & Audit Logs - `/admin/settings`)
- [ ] **Cập nhật Hoa hồng hệ thống (Chỉ tương lai):**
  - Bấm "Cập nhật mức hoa hồng" -> Nhập mức mới (VD: 20%) và Ghi chú -> **KHÔNG** check ô Hồi tố -> Lưu.
  - Verify: Các nhà hàng mới duyệt sẽ nhận 20%, nhà hàng cũ vẫn giữ nguyên 15%.
- [ ] **Cập nhật Hoa hồng hệ thống (Hồi tố - Nguy hiểm):**
  - Nhập mức 12%, Ghi chú -> **Check bật ô "Áp dụng hồi tố"** -> Lưu.
  - Verify: Toàn bộ nhà hàng đang hoạt động trong DB bị ép xuống 12%.
- [ ] **Kiểm tra Audit Log:**
  - Nhìn xuống bảng "Lịch sử điều chỉnh". Verify rằng hành động đổi % hoa hồng vừa rồi có lưu lại Tên Admin, Giá trị cũ (15) -> Mới (12) và Ghi chú rõ ràng.
  - Test bộ lọc tìm kiếm và Lọc ngày trên bảng Audit Log.

---

### 9. Luồng Hộp thư Admin (Header & `/admin/alerts`)
- [ ] **Xem thông báo (Bell icon):** Bấm icon Chuông trên Header (nếu có popup) hoặc vào trang `/admin/alerts`.
- [ ] **Trạng thái đọc:** 
  - Bấm vào 1 thông báo in đậm (chưa đọc) -> Thông báo chuyển thành đã đọc (mất chấm đỏ).
  - Bấm "Đánh dấu đã đọc tất cả" -> Toàn bộ danh sách chuyển sang trạng thái đã đọc.

Chỉ khi bạn đi qua hết tất cả các gạch đầu dòng trên, Role Admin mới được coi là đã pass toàn bộ quy trình kiểm thử (QA).