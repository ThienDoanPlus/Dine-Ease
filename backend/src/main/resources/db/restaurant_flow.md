### 1. Luồng Xác thực & Trạng thái tài khoản (Auth & Global States)
- [ ] **Đăng nhập:** Đăng nhập bằng tài khoản chủ quán (VD: `yume@gmail.com`) -> Vào đúng `/restaurant`.
- [ ] **Bảo vệ Route:** Cố tình gõ URL `/admin` hoặc `/user/profile` -> Bị văng về `/restaurant`.
- [ ] **Hiển thị Global Warning (Cảnh báo trạng thái):**
  - Đăng nhập tài khoản quán đang `PENDING` -> Thấy thanh cảnh báo đỏ: "Hồ sơ đang CHỜ DUYỆT".
  - Đăng nhập tài khoản quán bị Admin khóa (`INACTIVE`) -> Thấy thanh cảnh báo đỏ: "Nhà hàng đang bị TẠM KHÓA".
  - Đăng nhập tài khoản quán hợp lệ (`ACTIVE`) -> Không thấy thanh cảnh báo.

---

### 2. Luồng Dashboard & Báo cáo (`/restaurant`)
- [ ] **Data & Real-time:** Kiểm tra 4 thẻ thống kê: Doanh thu, Khách đang phục vụ, Đơn mới, Tỉ lệ lấp đầy bàn.
- [ ] **Bộ lọc thời gian:** Chuyển đổi giữa "Hôm nay", "Tuần", "Tháng" -> Đảm bảo Biểu đồ vùng (Area Chart) và Top món ăn bán chạy cập nhật theo.
- [ ] **Lịch sử giao dịch trực tiếp:** Cuộn xuống bảng Lịch sử giao dịch. Chú ý icon phương thức thanh toán (Tiền mặt, QR, Momo) và trạng thái đơn. (Bảng này có cơ chế tự động làm mới `refetchInterval: 10000`).
- [ ] **Xuất báo cáo:** Bấm nút "Xuất báo cáo" -> Tải thành công file Excel doanh thu của quán.

---

### 3. Luồng Quản lý Sơ đồ bàn & Gọi món (`/restaurant/tables`)
**A. Chế độ Vận hành (Mặc định):**
- [ ] **Đổi tầng/Khu vực:** Bấm đổi Tầng 1, Tầng 2, Sảnh chính, Phòng VIP -> Canvas tải lại bàn tương ứng.
- [ ] **Lọc trạng thái bàn:** Bấm các nút "Tất cả", "Trống", "Phục vụ" -> Các bàn mờ đi/sáng lên tương ứng.
- [ ] **Gộp bàn (Merge):** Bấm "Gộp bàn" -> Chọn 2 bàn trống -> Bấm "Xác nhận gộp" -> Bàn phụ hiện nhãn "GỘP #ID_BÀN_CHÍNH". Cố tình gộp 1 bàn chưa lưu (bàn ảo mới tạo) -> Báo lỗi.
- [ ] **Tách bàn (Unmerge):** Bấm "Tách bàn" -> Xác nhận -> Xóa toàn bộ liên kết gộp.
- [ ] **Context Menu (Click vào 1 bàn):**
  - Bấm "Báo hỏng bàn" -> Bàn chuyển sang màu xám/gạch chéo, hiện cảnh báo.
  - Bấm "Đã sửa xong" -> Bàn về lại màu trắng (Trống).

**B. Chế độ Ghi nhận Order (Bấm "Gọi món" trên Context Menu):**
- [ ] **Giao diện Menu Modal:** Search món, chuyển tab danh mục.
- [ ] **Thêm món thường:** Click vào món không có Topping -> Cộng thẳng vào giỏ.
- [ ] **Thêm món Tùy chỉnh (Có Topping/Size):** 
  - Click vào Steak/Coffee -> Bật Popup tùy chọn.
  - Cố tình không chọn "Độ chín" (Bắt buộc) -> Báo lỗi.
  - Chọn Topping tính phí -> Tiền Tạm tính nhảy số. -> Bấm Thêm vào giỏ.
- [ ] **Giỏ hàng:** Tăng/giảm số lượng, gõ ghi chú (VD: "Ít cay"), xóa món.
- [ ] **Gửi bếp:** Bấm "Gửi Bếp (In Phiếu)" -> Bàn chuyển sang màu Vàng (Đang phục vụ), còi báo chớp nháy.

**C. Chế độ Thiết kế (Bấm "Thiết Kế"):**
- [ ] **Thêm vật thể:** Thêm Bàn tròn, Bàn vuông, Tường, Cửa đi.
- [ ] **Tùy chỉnh vật thể:** Chọn bàn -> Sửa Tên bàn (VD: "VIP-1"), Sửa số ghế (VD: 8 ghế). Đảm bảo UI vẽ đúng 8 cái chấm tròn xung quanh bàn.
- [ ] **Kéo thả & Resize:** Nắm kéo bàn sang vị trí mới, thu phóng kích thước tường/bàn. (Test lỗi trượt chuột khi Zoom in/out).
- [ ] **Lưu sơ đồ:** Bấm "Lưu sơ đồ" -> Tắt chế độ Edit, vị trí được lưu vào Database.

---

### 4. Luồng Quản lý Thực đơn (`/restaurant/menu`)
- [ ] **Quản lý Danh mục (Categories):** Mở Modal Danh mục -> Thêm danh mục mới -> Xóa danh mục cũ (Cố tình xóa danh mục đang có món ăn -> Báo lỗi ràng buộc).
- [ ] **Tìm kiếm & Lọc:** Chuyển Tab Danh mục, gõ tìm tên món ăn trong ô Search.
- [ ] **Thêm món ăn mới:**
  - Nhập Tên, Giá, Chọn danh mục.
  - Upload ảnh: Thử upload 2-3 ảnh cùng lúc (Giới hạn tối đa 5 ảnh). Thử bấm icon Thùng rác để xóa 1 ảnh đang preview.
  - Lưu -> Hiện lên bảng.
- [ ] **Chỉnh sửa món ăn:** Mở món cũ -> Đổi giá -> Lưu.
- [ ] **Bật/Tắt phục vụ (Sold out):** Bấm công tắc (Switch) trên bảng -> Đổi trạng thái Hết hàng/Đang bán. Món sẽ không cho phép order bên màn hình Sơ đồ bàn.
- [ ] **Xóa món:** Bấm icon Thùng rác -> Xác nhận xóa.

---

### 5. Luồng Quản lý Đặt bàn - Kanban (`/restaurant/reservations`)
- [ ] **Tìm kiếm & Lọc:** Chọn ngày tương lai/quá khứ trên bộ chọn ngày, gõ tên khách hàng.
- [ ] **Xử lý cột "Yêu cầu mới" (Pending):**
  - Bấm "Từ chối" -> Đơn bay sang cột "Hoàn thành/Hủy".
  - Bấm "Xác nhận" -> Đơn bay sang cột "Đã xác nhận".
- [ ] **Xử lý cột "Đã xác nhận" (Xếp bàn):**
  - Khách đến quán -> Bấm "Xếp bàn" -> Modal hiện danh sách các bàn đang Trống -> Chọn bàn "002" -> Đơn lưu mã bàn xếp.
- [ ] **Hoàn tất đơn (Tính tiền & Hoa hồng):**
  - Bấm "Hoàn tất đơn" -> Modal hiện ra yêu cầu nhập tiền.
  - Nhập số tiền KHÁCH THỰC TRẢ (VD: 1.000.000đ) -> Xác nhận -> Backend tính 15% hoa hồng (150.000đ) và cộng điểm cho user. Đơn bay sang cột Hoàn thành.

---

### 6. Luồng Quản lý Bếp - KOT (`/restaurant/kitchen`)
- [ ] **Đồng bộ thời gian thực:** Mở sẵn tab này, lấy thiết bị khác order 1 món. Chờ tối đa 10s -> Phiếu tự động nhảy vào màn hình Bếp.
- [ ] **Lọc trạng thái:** Chuyển tab Chờ nấu, Đang nấu, Hoàn tất.
- [ ] **Cập nhật từng món (Order Items):**
  - Món đang "Chờ nấu": Bấm nút Ngọn lửa (Đang nấu). Hoặc bấm nút X (Báo hết nguyên liệu -> Hủy & Trừ tiền khách).
  - Món "Đang nấu": Bấm nút Dấu Check (Món đã nấu xong).
- [ ] **Trạng thái phiếu tổng:** Khi TẤT CẢ các món trong 1 phiếu KOT đều là "Đã xong" (hoặc hủy) -> Cả cái thẻ Ticket bị xám đi và chìm xuống.
- [ ] **In phiếu KOT:** Bấm "In phiếu" -> Popup render bill máy in nhiệt (có Barcode) -> Bấm In sẽ gọi lệnh in của trình duyệt.

---

### 7. Luồng Thu ngân & POS (`/restaurant/pos`)
- [ ] **Tìm Hóa đơn:** Gõ mã bàn (VD: "002") hoặc "TAKEAWAY" -> Load chi tiết hóa đơn (Các món ăn, trạng thái nấu).
- [ ] **Bưng món:** Nhìn vào danh sách món, món nào bếp nấu xong (Trạng thái READY) -> Bấm "Xác nhận bưng" -> Trạng thái đổi thành SERVED (Gạch ngang).
- [ ] **Tính năng Phụ phí:** Bấm "Phụ phí" -> Nhập tên (VD: Phí mở rượu vang) và Tiền (500.000đ) -> Bill cộng thêm dòng phụ phí.
- [ ] **Tính năng Voucher:** Bấm "Mã giảm giá" -> Nhập mã -> Backend tính toán -> Bill thêm dòng trừ tiền.
- [ ] **Nghiệp vụ Thanh toán (Checkout):**
  - *Case 1 - Tiền mặt:* Chọn "Tiền mặt" -> Bấm Numpad hoặc Phím nhanh (VD: 500k) -> Nhập số tiền < Tổng Bill -> Bấm Hoàn tất -> Báo lỗi "Chưa đủ". Nhập số tiền > Tổng Bill -> Máy tính tự tính tiền thừa (Màu vàng) -> Cho phép hoàn tất.
  - *Case 2 - Chuyển khoản (QR/Card/Momo):* Chọn QR -> Numpad bị vô hiệu hóa -> Bấm Hoàn tất luôn.
  - *Case 3 - Bill 0đ (Do cọc/Voucher cover hết):* Numpad bị vô hiệu hóa -> Hiện nút "XÁC NHẬN (HÓA ĐƠN 0Đ)".
- [ ] **Giải phóng bàn:** Thanh toán xong -> Bàn 002 tự động bị dọn dẹp, màn hình Sơ đồ bàn chuyển bàn 002 về màu trắng (Trống).

---

### 8. Luồng Cấu hình Quán (`/restaurant/settings`)
- [ ] **Thông tin chung:** Upload Logo mới, Cover mới. Cập nhật Tên quán, mô tả, thay đổi Tiện ích (Thêm "Chỗ đậu xe").
- [ ] **Cấu hình Đặt bàn:** Đổi Tiền cọc (VD: Đổi thành 0đ để khách không cần thanh toán VNPay khi đặt), Đổi số khách tối đa.
- [ ] **Giờ hoạt động:** Bật công tắc "Chủ Nhật" (Active), sửa giờ từ 09:00 đến 23:00.
- [ ] **Lưu cấu hình:** Bấm "Lưu thay đổi" -> Sang tab Public của Khách hàng tìm quán mình -> Verify ảnh, tiện ích, giờ mở cửa đã cập nhật đúng.

---

### 9. Luồng Hộp thư (`/restaurant/notifications`)
- [ ] Tương tự như Admin: Xem danh sách, nhấp vào để đọc, đánh dấu đã đọc tất cả, kiểm tra icon/màu sắc ứng với phân loại thông báo (VD: Đơn hàng mới màu xanh lá).
