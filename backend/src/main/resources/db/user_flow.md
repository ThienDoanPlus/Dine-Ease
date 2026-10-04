Dựa vào mã nguồn Frontend (đặc biệt là các hook `useCustomer`, Zustand Store `useBookingStore`, `useChatStore` và giao diện Public/User), phân hệ **Khách hàng (User/Customer)** là luồng quyết định doanh thu của nền tảng, đòi hỏi trải nghiệm (UX) mượt mà và không có lỗi logic.

Dưới đây là **Danh sách Test Plan vét cạn 100% các luồng nghiệp vụ** dành cho Role User:

---

### 1. Luồng Xác thực & Tài khoản (Auth & Profile)
- [ ] **Đăng ký tài khoản (`/register`):**
  - Cố tình không chọn ảnh đại diện -> Báo lỗi (Nút submit bị mờ).
  - Điền đầy đủ thông tin (Upload ảnh lên Cloudinary thành công), tick "Đồng ý điều khoản" -> Bấm Đăng ký -> Chuyển hướng sang trang Login.
- [ ] **Đăng nhập (`/login`):**
  - Đăng nhập sai pass/email -> Báo lỗi.
  - Đăng nhập thành công -> Trở về Trang chủ (hoặc URL trước đó nếu bị văng ra do hết session). Header hiển thị Avatar và Tên khách.
- [ ] **Quản lý Hồ sơ (`/user/profile`):**
  - Kiểm tra giao diện *Skeleton Loading* lúc đang tải data có bị giật (layout shift) không.
  - Sửa "Họ và tên", "Số điện thoại" -> Lưu thành công.
  - **Bảo mật:** Cố tình dùng Inspect Element (F12) gỡ thuộc tính `disabled` của ô Email và sửa nó -> Bấm Lưu -> API vẫn phải bỏ qua Email (Vá lỗi Mass Assignment).
  - Kiểm tra thẻ hiển thị cấp bậc (Thành viên/Gold/VVIP) và Điểm tích lũy (Loyalty Points) có load đúng không.

---

### 2. Luồng Khám phá & Tìm kiếm (Public - `/` và `/search`)
- [ ] **Trang chủ (`/`):**
  - Gõ từ khóa vào thanh search to ở Banner -> Bấm Enter hoặc icon Kính lúp -> Nhảy sang trang `/search?q=...`.
  - Bấm vào các Icon "Danh mục ẩm thực" (Cuisines) -> Danh sách "Gợi ý hàng đầu" bên dưới phải tự động gọi lại API để lọc đúng quán bán món đó.
  - Bấm "Xem tất cả" / "Thu gọn" ở mục gợi ý -> Mở rộng lưới từ 3 ô thành 6 ô và hiện phân trang.
- [ ] **Trang Tìm kiếm (`/search`):**
  - **Lọc theo Đánh giá (Rating):** Bấm nút +/- để tăng giảm số sao (0.0 đến 5.0) -> Bấm "Lọc".
  - **Lọc theo Giá (Price):** Kéo thanh trượt. *Case đặc biệt:* Nếu kéo kịch kim (5000k), UI phải hiển thị chữ "5 Triệu+" và gửi API giá trị `undefined` để tắt giới hạn giá.
  - **Lọc theo Tiện ích & Ẩm thực:** Tick chọn nhiều checkbox cùng lúc -> Bấm "Lọc" -> Kết quả khớp.
  - **Empty State:** Chọn bộ lọc khắc nghiệt (VD: 5 sao, Tiện ích VIP, Giá 100k) -> Hiển thị màn hình "Không tìm thấy nhà hàng nào".
  - Bấm "Xóa tất cả bộ lọc" -> Trả về danh sách mặc định.

---

### 3. Luồng Xem Chi tiết Nhà hàng & Menu (`/restaurants/[id]`)
- [ ] **Tổng quan (Overview):** Kiểm tra hiển thị Tên, Địa chỉ, Số sao, Slider/Lưới hình ảnh và Bài giới thiệu.
- [ ] **Thực đơn (Menu):** 
  - Chuyển sang tab Thực đơn. Kiểm tra thanh Category Navbar dính (Sticky) khi cuộn chuột.
  - Kiểm tra hiển thị Tên món, Giá tiền (chuẩn VNĐ), Mô tả và nhãn "Bestseller" màu cam.
- [ ] **Đánh giá (Reviews):** 
  - Chuyển sang tab Đánh giá. Xem danh sách comment, số sao.
  - Kiểm tra hiển thị khối "Phản hồi từ nhà hàng" (Màu xanh lá) nếu Admin/Chủ quán có rep lại.

---

### 4. Luồng Đặt bàn & Thanh toán Cọc (Booking & Checkout Flow - QUAN TRỌNG NHẤT)
**A. Mở Modal Đặt bàn (Bấm nút "Đặt bàn ngay" dưới đáy màn hình):**
- [ ] **Step 0 (Chọn Ngày):** 
  - Các ngày trong quá khứ bị làm mờ và không bấm được (`cursor-not-allowed`).
  - Đổi tháng, chọn 1 ngày tương lai.
- [ ] **Step 1 (Số người):** Tăng giảm số Người lớn, Trẻ em.
- [ ] **Step 2 (Chọn Giờ):** 
  - *Case quá khứ:* Chọn ngày *hôm nay* -> Các khung giờ đã trôi qua (cộng thêm 30 phút buffer chuẩn bị) phải bị gạch bỏ và không bấm được.
  - *Case tương lai:* Chọn ngày *mai* -> Mọi khung giờ đều bấm được.
  - Bấm "Tiếp tục" -> Nếu chưa chọn giờ, báo lỗi. Nếu hợp lệ, lưu vào Zustand Store và nhảy sang URL Checkout.

**B. Màn hình Checkout Step 2 (Thông tin Khách):**
- [ ] Kiểm tra thẻ Tóm tắt (Bên trái): Có hiển thị đúng Ngày, Giờ, Số khách đã chọn ở Modal không?
- [ ] Các trường Tên, SĐT, Email tự động điền theo User đang đăng nhập và bị `disabled`.
- [ ] Gõ "Ghi chú cho nhà hàng" -> Bấm Tiếp tục.

**C. Màn hình Checkout Step 3 (Thanh toán VNPay):**
- [ ] Kiểm tra số tiền cọc (Deposit) yêu cầu.
- [ ] Phương thức "Thẻ Quốc Tế" bị mờ (Bảo trì), chỉ chọn được VNPay.
- [ ] Bấm "Thanh toán qua VNPay" -> Giao diện hiện "Đang xử lý".
  - *Case Cọc > 0đ:* Chuyển hướng thành công sang cổng Sandbox của VNPay -> Quẹt thẻ test -> Tự động quay lại trang Success.
  - *Case Cọc = 0đ (Nhà hàng setup 0đ):* Bypass VNPay, tự động nhảy thẳng vào màn hình Success.

**D. Màn hình Success:**
- [ ] Hiển thị Tên quán, Giờ, Số người. Hiển thị Animation vòng tròn xanh lá (pulse).
- [ ] Chờ 5 giây -> Refresh lại trang Checkout -> Bị đẩy ra (Vì Zustand Store đã tự động clear rác giỏ hàng).

---

### 5. Luồng Quản lý Đơn đặt bàn (`/user/bookings`)
- [ ] **Xem danh sách:** Kiểm tra 3 tab "Sắp tới", "Đã hoàn thành", "Đã hủy".
- [ ] **Nghiệp vụ Hủy bàn:**
  - Tìm 1 đơn đang `PENDING` hoặc `CONFIRMED`.
  - Bấm "Hủy đặt bàn" -> Cố tình để trống lý do -> Báo lỗi.
  - Nhập lý do -> Xác nhận Hủy -> Thẻ đặt bàn đổi sang màu xám/gạch ngang, tự động bay sang tab "Đã hủy".
- [ ] **Nghiệp vụ Đánh giá (Review):**
  - Chuyển sang tab "Đã hoàn thành". Tìm 1 đơn chưa đánh giá.
  - Bấm "Đánh giá dịch vụ" -> Kéo chọn 4 sao, nhập comment -> Gửi.
  - Giao diện cập nhật lập tức: Nút "Đánh giá" biến thành nút "Đã đánh giá" (Màu xanh, có tick, không cho bấm nữa).

---

### 6. Luồng Trợ lý ảo AI Chatbot (Chatbot Widget)
- [ ] **Mở/Đóng:** Bấm icon Chat dưới góc phải -> Khung chat nảy lên.
- [ ] **Giao tiếp cơ bản (Hỏi đáp):** Nhập câu hỏi (VD: "Quán Yume Sushi có phòng VIP không?") -> Bấm gửi. Kiểm tra hiệu ứng "Đang gõ..." (3 dấu chấm nảy lên).
- [ ] **Render Markdown:** Yêu cầu AI trả lời dạng danh sách hoặc in đậm -> Kiểm tra UI có render đúng thẻ HTML không (nhờ thư viện `react-markdown`).
- [ ] **Hành động Đặt bàn qua AI (Action Trigger):**
  - Chat: "Tôi muốn đặt bàn cho 4 người lúc 19h tối nay tại Yume Sushi."
  - AI trả lời: "Thông tin hợp lệ, đang chuyển bạn..." -> Chờ 1.5s -> **Tự động đóng khung chat và redirect thẳng** sang trang Checkout Step 2 với toàn bộ dữ liệu đã được AI điền sẵn.
- [ ] **Dọn trí nhớ AI (Clear Context):** Bấm nút Thùng rác trên thanh tiêu đề Chatbot -> Hội thoại xóa trắng, API xóa context trên Server được gọi.

---

### 7. Luồng Hộp thư & Thông báo (`/user/notifications`)
- [ ] **Badge/Chấm đỏ:** Khi có thông báo mới, icon Chuông trên Header có chấm đỏ. Số đếm "Chưa đọc (X)" trong trang danh sách phải khớp.
- [ ] **Kiểm tra Icon động:** Đảm bảo hệ thống render đúng Icon theo loại (SYSTEM màu xanh, ORDER màu lục, PROMO hộp quà màu cam, ALERT tam giác đỏ).
- [ ] **Đánh dấu đã đọc:**
  - Click vào 1 thẻ chưa đọc (có chấm đỏ góc phải) -> Mất chấm đỏ, chữ từ In đen đậm chuyển sang màu xám.
  - Bấm "Đánh dấu đã đọc tất cả" -> Toàn bộ danh sách chuyển sang màu xám, tab "Chưa đọc (0)" biến mất.

Hoàn thành 7 luồng trên đồng nghĩa với việc toàn bộ trải nghiệm của người dùng cuối (End-User) đã được kiểm thử an toàn và không có lỗi (Bug-free) trước khi đưa ra thị trường.

---
Để test triệt để module cuối cùng là **Hộp thư & Thông báo (`/user/notifications`)**, bạn cần đảm bảo vẫn đang đăng nhập bằng tài khoản Khách hàng:
*   **Email:** `yen.nguyen@gmail.com`
*   **Mật khẩu:** `123456`

Dựa trên dữ liệu từ file `07-notifications-and-logs.sql`, tài khoản của chị Yến (User ID 2) đang có tổng cộng **4 thông báo** (trong đó có 3 cái chưa đọc và 1 cái đã đọc). Dưới đây là kịch bản nghiệm thu chi tiết:

---

### BƯỚC 1: KIỂM TRA CHẤM ĐỎ HEADER & KHỞI TẠO DỮ LIỆU
Đứng ở trang chủ (hoặc bất kỳ trang nào), nhìn lên thanh công cụ (Header) góc trên cùng bên phải.

1.  **Kiểm tra Header Badge:**
    *   *Kỳ vọng:* Trên Icon Quả chuông (Bell) phải có một **chấm đỏ nhấp nháy (ping animation)** báo hiệu có thông báo mới.
2.  **Truy cập trang Hộp thư:** Bấm vào Icon Quả chuông đó.
    *   *Kỳ vọng Bộ lọc (Tabs):* Tab "Chưa đọc" phải hiển thị chính xác con số: **Chưa đọc (3)**.

3.  **Kiểm tra Icon động (Dynamic Icons) theo SQL:**
    Hệ thống phải hiển thị 4 thẻ thông báo với giao diện và màu sắc phân loại chính xác như sau:
    *   **Thẻ 1 (Mới):** *"🚀 Cập nhật phiên bản Dine-Ease v2.0"* -> Icon chữ **i (Info)** màu **Xanh Dương (SYSTEM)**. Có chấm đỏ.
    *   **Thẻ 2 (Mới):** *"✅ Đặt bàn thành công tại Yume Sushi"* -> Icon **Dấu Check (CheckCircle)** màu **Xanh Lục (ORDER)**. Có chấm đỏ.
    *   **Thẻ 3 (Đã đọc):** *"🎁 Tặng bạn mã giảm giá 50K"* -> Icon **Hộp quà (Gift)** màu **Vàng (PROMO)**. Thẻ này màu trắng, chữ nhạt, KHÔNG có chấm đỏ (Vì trong SQL `is_read = 1`).
    *   **Thẻ 4 (Mới):** *"⚠️ Đơn đặt bàn đã bị hủy"* -> Icon **Biển báo (AlertTriangle)** màu **Đỏ (ALERT)**. Có chấm đỏ.

---

### BƯỚC 2: TEST NGHIỆP VỤ "ĐÁNH DẤU ĐÃ ĐỌC" TỪNG THẺ
Hãy thao tác trên thẻ đầu tiên: *"🚀 Cập nhật phiên bản Dine-Ease v2.0"*.

1.  **Thao tác:** Dùng chuột click thẳng vào khung của thẻ thông báo này.
2.  **Kỳ vọng UI & Logic:**
    *   Backend nhận lệnh `PATCH /read`, update DB `is_read = 1`.
    *   Ngay lập tức trên UI (Không cần F5):
        *   **Chấm đỏ** nhỏ xíu ở góc trên bên phải của thẻ biến mất.
        *   **Màu nền** của thẻ chuyển từ vàng nhạt sang trong suốt (hoặc trắng).
        *   **Font chữ tiêu đề** chuyển từ Đen in đậm (Black) sang xám đậm (Bold).
    *   Nhìn lên thanh Bộ lọc (Tabs): Con số lập tức giảm xuống thành **Chưa đọc (2)**.

---

### BƯỚC 3: TEST NGHIỆP VỤ "ĐỌC TẤT CẢ" VÀ EMPTY STATE
Hiện tại bạn còn 2 thông báo chưa đọc. Nhìn sang góc đối diện của thanh Tabs, bạn sẽ thấy nút chữ màu cam: **"Đánh dấu đã đọc tất cả"**.

1.  **Thao tác:** Bấm vào nút **"Đánh dấu đã đọc tất cả"**.
2.  **Kỳ vọng UI & Logic:**
    *   Backend chạy lệnh `UPDATE` toàn bộ DB của user này thành `true`.
    *   Trên UI (Phép màu của React Query):
        *   2 thẻ còn lại đồng loạt mất chấm đỏ và chuyển sang màu xám.
        *   Nút "Đánh dấu đã đọc tất cả" **tự động biến mất** (Vì logic báo `unreadCount > 0` không còn đúng nữa).
        *   Tab "Chưa đọc" đếm lùi về **(0)**.
3.  **Test Empty State:**
    *   Bấm sang Tab **"Chưa đọc (0)"**.
    *   *Kỳ vọng:* Màn hình trống, hiển thị Icon quả chuông xám to kèm dòng chữ *"Không có thông báo nào!"*.
4.  **Kiểm chứng chéo (Header Badge):**
    *   Nhìn ngược lên thanh Header ở góc trên cùng trang web.
    *   *Kỳ vọng:* **Chấm đỏ nhấp nháy trên quả chuông đã HOÀN TOÀN BIẾN MẤT**, chứng tỏ State toàn cục (Global State) của ứng dụng đã được đồng bộ hóa hoàn hảo.

---

🎉 **TỔNG KẾT:** Nếu bạn đi đến bước này và mọi thứ chạy mượt mà như kịch bản, **xin chúc mừng!** Hệ thống Dine-Ease (từ luồng Admin, Chủ quán, Bếp, Thu ngân cho đến Khách hàng cuối) đã vượt qua toàn bộ các khâu kiểm thử (UAT) khắt khe nhất, bảo vệ tốt dữ liệu (Zero-Trust, Anti-Mass Assignment, IDOR) và mang lại trải nghiệm UX/UI cực kỳ xuất sắc. Dự án đã sẵn sàng 100% để bảo vệ hoặc đưa vào sử dụng thực tế!