Dưới đây là đáp án (Expected Results) cho từng mục kiểm thử trên Dashboard Admin:

---

### 1. Hiển thị số liệu (4 thẻ thống kê ở trên cùng)
Khi bạn vừa vào trang `/admin` (chưa chọn bộ lọc ngày), hệ thống sẽ Query toàn bộ Database. Số liệu hiển thị **ĐÚNG** phải là:

*   **Nhà hàng hoạt động:** `1 Quán`
    *   *Giải thích:* Trong 3 nhà hàng, chỉ có "Yume Sushi Central" có `status = 'ACTIVE'`.
*   **Tổng đơn toàn hệ thống:** `5 Đơn`
    *   *Giải thích:* Bảng `reservations` có đúng 5 dòng dữ liệu.
*   **Đơn thành công:** `2 Đơn`
    *   *Giải thích:* Trong 5 đơn, chỉ có Booking ID 4 và ID 5 có trạng thái `COMPLETE`.
*   **Tổng hoa hồng:** `277.500 VNĐ`
    *   *Giải thích:* Dựa vào Booking ID 4 (Hoa hồng: 150.000) + Booking ID 5 (Hoa hồng: 127.500). Các đơn POS (`orders`) hiện đều đang ở trạng thái `OPEN` nên hoa hồng = 0. Tổng là 150k + 127.5k = 277.500đ.

---

### 2. Lọc theo ngày (Date Range Picker)
Do dữ liệu SQL sử dụng hàm `CURDATE()` (ngày hiện tại lúc bạn chạy file SQL) và trừ lùi ngày (`INTERVAL X DAY`), bạn hãy test như sau:

*   **Bấm "Xóa bộ lọc":** Số liệu trả về đúng 4 con số ở mục 1.
*   **Lọc thiếu ngày (Cố tình gây lỗi):** Chỉ chọn "Từ ngày" mà không chọn "Đến ngày" -> Bấm "Áp dụng" -> Màn hình phải nảy lên Toast màu đỏ báo lỗi: *"Vui lòng chọn đầy đủ cả ngày bắt đầu và ngày kết thúc!"*.
*   **Lọc đúng:** 
    *   Chọn "Từ ngày" là **hôm nay** và "Đến ngày" là **hôm nay**.
    *   Bấm "Áp dụng".
    *   **Kết quả đúng:** 
        *   Tổng đơn: Lên `2` (Booking ID 1 và 2 đặt cho `CURDATE()`).
        *   Đơn thành công: Về `0` (Hôm nay chưa có đơn nào COMPLETE).
        *   Hoa hồng: Về `0`.

---

### 3. Kiểm tra Biểu đồ (Charts)

**A. Biểu đồ tròn (Tỉ lệ đặt bàn theo Ẩm thực):**
*   **Hiển thị đúng:** Biểu đồ sẽ chỉ có 1 màu duy nhất (chiếm 100% hình tròn). 
*   **Tooltip:** Rê chuột vào sẽ thấy chữ **"Món Nhật"** với giá trị là **2**.
*   *Giải thích:* Biểu đồ này đếm số lượng đơn `COMPLETE`. Cả 2 đơn COMPLETE (ID 4, 5) đều thuộc về nhà hàng Yume Sushi (có `cuisine_id = 2` là Món Nhật).

**B. Biểu đồ dạng vùng (Xu hướng kinh doanh 7 ngày):**
*   **Hiển thị đúng:** Trục X (ngang) sẽ hiển thị ngày tháng của 7 ngày gần nhất. Trục Y (dọc) là tiền. Đường dây biểu đồ sẽ nằm bẹp ở số 0, nhưng có **2 đỉnh nhô lên**:
    *   Đỉnh 1 (Cách đây 5 ngày): Rê chuột vào Tooltip hiện **"Doanh thu: 127.500 VNĐ, Đơn: 1"**.
    *   Đỉnh 2 (Cách đây 2 ngày): Rê chuột vào Tooltip hiện **"Doanh thu: 150.000 VNĐ, Đơn: 1"**.
    *   Các ngày còn lại (kể cả hôm nay): Doanh thu = 0.

---

### 4. Bảng xếp hạng (Top Rankings ở dưới cùng)

**A. 🏆 TOP 5 DOANH THU NHÀ HÀNG:**
*   **Hạng 1:** Yume Sushi Central
*   **Đơn thành công:** 2
*   **Tổng doanh thu:** `1.850.000 đ`
*   *Giải thích:* Doanh thu này là tổng tiền khách đã chi trả (Final Total Amount), không phải tiền hoa hồng. Booking ID 4 (1.000.000đ) + Booking ID 5 (850.000đ) = 1.850.000đ.
*   Chỉ hiển thị 1 dòng này, các dòng khác trống.

**B. ⚠️ TOP 5 HỦY ĐƠN ĐẶT BÀN:**
*   **Hạng 1:** Yume Sushi Central
*   **Số lượng hủy:** `1 đơn` (Chữ màu đỏ, nằm trong ô nền hồng nhạt).
*   *Giải thích:* Booking ID 3 bị `CANCELLED`.

---

### 5. Xuất báo cáo (Export)

*   **Hành động:** Bấm nút "Xuất báo cáo" góc trên bên phải -> Chọn Excel.
*   **Kết quả đúng:** File `Admin_Report.xlsx` được tải về máy.
*   **Mở file ra, đối chiếu số liệu:** 
    *   Dòng Header: `Tổng Nhà Hàng` | `Tổng Đơn` | `Đơn Thành Công` | `Doanh Thu Hoa Hồng (VND)`
    *   Dòng Dữ liệu: `1` | `5` | `2` | `277500.0`
*   (Làm tương tự với file PDF, layout bảng sẽ giống hệt nhưng là định dạng PDF, tên file là `Admin_Report.pdf`).

----

Dưới đây là đáp án (Expected Results) để bạn đối chiếu xem màn hình có đang hoạt động chuẩn xác 100% không:

---

### 1. Lọc trạng thái & Tìm kiếm
Trong dữ liệu Mock, chúng ta có 3 nhà hàng với 3 trạng thái khác nhau:
*   `Yume Sushi Central` (ACTIVE)
*   `Mamma Mia Pasta` (PENDING)
*   `Locked Garden Cafe` (INACTIVE)

**Cách test & Kết quả đúng:**
*   **Tab "Tất cả":** Hiển thị đủ 3 nhà hàng.
*   **Tab "Chờ duyệt":** Chỉ hiển thị duy nhất **1 dòng** là nhà hàng `Mamma Mia Pasta`. Chủ sở hữu là `Giovanni Russo` (Email: `owner.mammam@gmail.com`). Badge trạng thái hiển thị màu Vàng và có hiệu ứng chớp nháy (Pulse).
*   **Tab "Bị từ chối":** Trống trơn (Hiển thị "Không tìm thấy dữ liệu phù hợp").
*   **Thanh tìm kiếm:** Đứng ở tab "Tất cả", gõ chữ `Yume` -> Bảng lập tức lọc chỉ còn lại `Yume Sushi Central`.

---

### 2. Xem chi tiết hồ sơ
**Cách test:** Bấm vào icon con mắt (View) của dòng `Mamma Mia Pasta` (Trạng thái đang Chờ duyệt).
**Kết quả đúng hiển thị trên trang Chi tiết:**
*   **Tiêu đề:** "Chi tiết hồ sơ đối tác" - Mã hồ sơ `#2` - Hoa hồng `15%`.
*   **Thẻ thông tin (Bên trái):**
    *   Đại diện pháp luật: `Giovanni Russo`
    *   Số điện thoại: `0287654321`
    *   Email: `owner.mammam@gmail.com`
    *   Trạng thái: "Chờ duyệt" (Badge màu vàng).
*   **Tab "Thông tin hoạt động":**
    *   Địa chỉ: `45 Thảo Điền, Quận 2, TP. HCM`
    *   Giới thiệu: `Nhà hàng Ý ấm cúng.`
*   **Tab "Tài liệu pháp lý":** 
    *   Sẽ hiển thị **"Chưa có tài liệu đính kèm"**. *(Giải thích: Vì trong file `03-restaurants-and-tables.sql` không có câu lệnh `INSERT` nào cho bảng `legal_documents`. Đây là hành vi đúng, không phải bug).*
*   **Thanh công cụ dưới đáy màn hình (Cực kỳ quan trọng):** Do nhà hàng này đang `PENDING`, bạn bắt buộc phải thấy một khung màu trắng có viền vàng nhạt chứa 3 nút: **[Yêu cầu bổ sung]**, **[Từ chối]** (màu đỏ) và **[Phê duyệt nhà hàng]** (màu xanh lá).

---

### 3. Hành động: Yêu cầu bổ sung
*   **Thao tác:** Bấm nút `[Yêu cầu bổ sung]` -> Form popup hiện lên -> Nhập "Vui lòng đính kèm hình ảnh Giấy phép kinh doanh" -> Bấm Gửi.
*   **Kết quả đúng:** 
    *   Popup đóng lại.
    *   Góc phải màn hình hiện Toast màu xanh: *"Đã gửi email yêu cầu bổ sung đến đối tác!"*.
    *   Trạng thái nhà hàng **vẫn giữ nguyên là "Chờ duyệt"** (PENDING).
    *   *(Nếu bạn mở Console của Backend Spring Boot lên, bạn sẽ thấy log báo: `Thành công: Đã gửi thông báo đến owner.mammam@gmail.com`)*.

---

### 4. Hành động: Từ chối hồ sơ
*   **Thao tác:** Bấm nút `[Từ chối]` (màu đỏ) cho `Mamma Mia Pasta`.
*   **Kết quả đúng:**
    *   Màn hình văng Toast: *"Đã cập nhật trạng thái hồ sơ thành REJECTED"*.
    *   Giao diện **tự động đá bạn về lại** màn hình danh sách `/admin/partners`.
    *   Bây giờ, nếu bạn bấm sang **Tab "Chờ duyệt"**, danh sách sẽ **trống trơn**.
    *   Bấm sang **Tab "Bị từ chối"**, bạn sẽ thấy `Mamma Mia Pasta` nằm ở đây với Badge màu Đỏ.

---

### 5. Hành động: Khôi phục hồ sơ
*   **Thao tác:** Đang đứng ở **Tab "Bị từ chối"**, bấm icon con mắt vào lại `Mamma Mia Pasta`.
*   **Kết quả đúng:**
    *   Kéo xuống đáy màn hình, thanh công cụ lúc nãy đã **đổi sang giao diện màu Đỏ**. Có dòng chữ cảnh báo: *"Hồ sơ đã bị từ chối"*.
    *   Chỉ có duy nhất 1 nút bấm: **[Khôi phục về Chờ duyệt]**.
    *   Bấm vào nút này -> Có Toast báo thành công -> Hệ thống đá về trang danh sách -> `Mamma Mia Pasta` đã quay lại Tab "Chờ duyệt" y như cũ.

---

### 6. Hành động: Phê duyệt (Approve) - BƯỚC CHỐT
*   **Thao tác:** Từ màn hình danh sách (cột Hành động) hoặc trong màn hình Chi tiết, bấm nút **[Duyệt] / [Phê duyệt nhà hàng]** màu xanh lá cây cho `Mamma Mia Pasta`. Xác nhận popup (nếu có).
*   **Kết quả đúng:**
    *   Màn hình văng Toast: *"Hồ sơ #2 đã được phê duyệt! Email chứa mật khẩu đã được gửi cho đối tác."*
    *   `Mamma Mia Pasta` **biến mất** khỏi Tab "Chờ duyệt".
    *   Bạn chuyển sang **Tab "Đã duyệt"**, sẽ thấy `Mamma Mia Pasta` nằm ở đây với trạng thái `APPROVED` (Màu xanh lá).
    *   **(Logic ngầm Backend đã chạy):** Tài khoản `owner.mammam@gmail.com` đã được tự động cấp quyền `ROLE_RESTAURANT`, sinh password ngẫu nhiên, tăng Token Version (để đá văng nếu họ đang cố hack session) và hệ thống gửi Email chúc mừng duyệt thành công.

---
Dưới đây là đáp án (Expected Results) chi tiết cho từng bước test của bạn:

---

### 1. Xem danh sách & Phân trang
Khi vừa truy cập vào trang `/admin/restaurants` (mặc định bộ lọc là "Tất cả"), hệ thống sẽ hiển thị bảng danh sách.
**Kết quả đúng:**
*   **Bảng dữ liệu có 3 dòng:**
    1.  `Yume Sushi Central` (Status: ACTIVE). Nút Switch (công tắc) đang **BẬT** (màu xanh ngọc/emerald). Hình ảnh hiển thị màu sắc đầy đủ, chữ đậm.
    2.  `Mamma Mia Pasta` (Status: PENDING). Nút Switch đang **TẮT**.
    3.  `Locked Garden Cafe` (Status: INACTIVE). Nút Switch đang **TẮT**.
*   **Hiệu ứng thị giác (Rất quan trọng):** Dòng số 3 (`Locked Garden Cafe`) do đang bị Tạm khóa nên **hình ảnh đại diện phải bị chuyển sang trắng đen (Grayscale) và mờ đi (Opacity 60%)**, tên nhà hàng màu xám thay vì đen đậm.
*   **Phân trang:** Góc dưới cùng bên trái sẽ hiện "Hiển thị 3 của 3 kết quả". Do `pageSize` mặc định là 10 mà ta chỉ có 3 dòng, nên 2 nút "Trước" và "Sau" sẽ bị làm mờ (disabled).

---

### 2. Bộ lọc (Filters)
**Cách test & Kết quả đúng:**
*   **Lọc theo Tên:** Gõ chữ `Cafe` vào ô tìm kiếm -> Bảng chỉ còn lại 1 dòng là `Locked Garden Cafe`.
*   **Lọc theo trạng thái "Đang hoạt động":** 
    *   Chọn dropdown trạng thái thành "Đang hoạt động" (Gửi value `ACTIVE` xuống API).
    *   Kết quả: Bảng chỉ còn lại duy nhất `Yume Sushi Central`.
*   **Lọc theo trạng thái "Tạm khóa":**
    *   Chọn "Tạm khóa" (Gửi value `INACTIVE`).
    *   Kết quả: Bảng chỉ còn lại duy nhất `Locked Garden Cafe`.
*   **Xóa bộ lọc:** Bấm chữ "Xóa bộ lọc" màu đỏ cạnh dropdown -> Bảng trả về đủ 3 nhà hàng ban đầu.

---

### 3. Khóa/Mở khóa nhà hàng (Toggle Lock)
Đây là nghiệp vụ cấm quyền truy cập của chủ quán nếu họ vi phạm chính sách.
**Cách test & Kết quả đúng:**

*   **Test Khóa (Lock):**
    *   Bấm vào nút Switch đang bật màu xanh của `Yume Sushi Central`.
    *   Màn hình văng Toast màu xanh: *"Đã khóa nhà hàng #1"*.
    *   Nút Switch lập tức trượt sang trái và mất màu xanh.
    *   **UI lập tức thay đổi:** Hình ảnh dĩa Sushi của Yume lập tức biến thành **màu trắng đen (Grayscale) và mờ đi**, tên nhà hàng chuyển thành màu xám.
    *   *(Logic ngầm: Nếu lúc này chủ quán dùng email `owner.yume@gmail.com` để đăng nhập, hệ thống sẽ chặn và báo lỗi "Tài khoản nhà hàng đang bị Tạm khóa").*

*   **Test Mở khóa (Unlock):**
    *   Tìm dòng `Locked Garden Cafe` (đang bị trắng đen), bấm vào nút Switch đang tắt.
    *   Màn hình văng Toast: *"Đã mở khóa nhà hàng #3"*.
    *   Nút Switch trượt sang phải và sáng màu xanh.
    *   **UI lập tức thay đổi:** Hình ảnh của quán lập tức **phục hồi màu sắc rực rỡ và rõ nét 100%**, tên nhà hàng đậm lên.

---

### 4. Xem chi tiết (Profile nhà hàng đang hoạt động)
**Cách test:** Bấm vào icon "Cây bút" (Edit / Xem chi tiết) trên dòng của `Yume Sushi Central`.
**Kết quả đúng:**
*   Hệ thống chuyển hướng bạn sang trang `/admin/1`.
*   Bạn sẽ thấy giao diện y hệt như lúc duyệt hồ sơ:
    *   Thông tin đại diện: `Kimura Takeshi`, `0911222333`.
    *   Địa chỉ: `123 Lê Lợi, Quận 1...`
    *   Mô tả: `Hương vị Nhật Bản đích thực...`
    *   Hồ sơ đính kèm: *(Trống)*.
    *   Badge trạng thái trên góc phải báo màu Xanh lá: **"ACTIVE"**.
*   **Điểm chốt hạ (Quan trọng nhất):** Bạn cuộn trang xuống tận cùng đáy màn hình. **KHÔNG ĐƯỢC CÓ** bất kỳ thanh công cụ nào chứa các nút (Yêu cầu bổ sung, Từ chối, Phê duyệt). Thanh công cụ đó phải **HOÀN TOÀN BIẾN MẤT** vì nhà hàng này đã hoạt động rồi, không còn ở trạng thái chờ duyệt (PENDING) nữa.
---

Dưới đây là đáp án (Expected Results) chi tiết để bạn đối chiếu xem màn hình có đang hoạt động chuẩn xác theo logic hay không:

---

### 1. Xem & Tìm kiếm
Khi vừa truy cập trang `/admin/users`, bảng dữ liệu sẽ hiển thị đủ **6 tài khoản** (1 Admin, 2 Customer, 3 Restaurant). Mặc định tất cả đều có trạng thái "Hoạt động".

**Cách test & Kết quả đúng:**
*   **Tìm theo Tên:** Gõ chữ `Yến` vào thanh tìm kiếm.
    *   **Kết quả:** Bảng lập tức lọc lại, chỉ còn duy nhất 1 dòng là `Nguyễn Hoàng Yến` (Role: CUSTOMER).
*   **Tìm theo Email:** Xóa chữ cũ, gõ chữ `owner`.
    *   **Kết quả:** Bảng lọc ra 3 dòng là các chủ quán: `owner.yume...`, `owner.mammam...`, `owner.locked...`.

---

### 2. Ban / Unban tài khoản (Khóa User)
Đây là nghiệp vụ quan trọng để Admin cấm cửa người dùng vi phạm. Chúng ta sẽ test trên tài khoản của khách hàng **Khách Mới Toanh** (`newbie@gmail.com`).

**Cách test & Kết quả đúng:**
*   **Bước 1 - Thực hiện Khóa (Ban):**
    *   Tại dòng của `Khách Mới Toanh`, cột trạng thái đang là chữ **"Hoạt động" (Có chấm tròn màu xanh lá cây chớp nháy - animate pulse)**.
    *   Bấm vào icon **Ổ khóa đóng (Lock)** ở cột Hành động.
    *   Trình duyệt hiện popup xác nhận: *"Bạn có chắc chắn muốn khóa tài khoản này?"* -> Bấm OK.
    *   **Hiệu ứng UI:** Màn hình văng Toast *"Đã khóa tài khoản thành công!"*. Cột trạng thái lập tức biến thành chữ **"Bị khóa" (Màu đỏ, chấm tròn đỏ đứng im)**. Icon ổ khóa ở cột Hành động biến thành **Ổ khóa mở (Unlock)**.
    *   *(Logic ngầm: Backend đã đổi Token Version. Nếu lúc này user "Khách Mới Toanh" đang dùng app, họ bấm vào bất kỳ nút nào cũng sẽ bị đá văng ra màn hình đăng nhập ngay lập tức).*

*   **Bước 2 - Thực hiện Mở khóa (Unban):**
    *   Bấm vào icon **Ổ khóa mở (Unlock)** trên chính dòng `Khách Mới Toanh` vừa nãy -> Xác nhận OK.
    *   **Hiệu ứng UI:** Màn hình văng Toast *"Đã mở khóa..."*. Trạng thái quay trở lại **"Hoạt động" (Màu xanh lá, chớp nháy)**. Icon đổi lại thành Ổ khóa đóng.

---

### 3. Case bảo vệ Admin (Anti Self-Destruct)
Đây là tính năng bảo mật tối quan trọng (được code ở dòng `if (user.roles?.includes("ADMIN")) return null;` trên Frontend). Nó ngăn chặn việc Admin vô tình (hoặc cố ý) khóa tài khoản của chính mình hoặc khóa tài khoản của các Super Admin khác gây sập hệ thống.

**Cách test & Kết quả đúng:**
*   **Thao tác:** Tìm dòng đầu tiên có tên **Hệ Thống Admin** (Email: `admin@dineease.com`). Ở cột Vai trò, bạn sẽ thấy các badge ghi `ADMIN` và `CUSTOMER`.
*   **Kiểm chứng (Verify):** Nhìn sang cột "Hành động" ngoài cùng bên phải của dòng này. Chỗ đó phải **TRỐNG TRƠN (Không có bất kỳ icon ổ khóa nào để bấm)**.
*   **So sánh:** Các dòng bên dưới (của Yến, Kimura, Giovanni...) đều có icon ổ khóa, riêng dòng của Admin thì biến mất hoàn toàn.

***
**KẾT LUẬN:** Nếu bạn làm theo kịch bản này, thấy thanh search lọc đúng data, nút khóa/mở khóa đổi màu UI (Xanh <-> Đỏ) chuẩn xác, và đặc biệt là **tài khoản Admin được miễn nhiễm (không có nút khóa)**, thì chức năng này của bạn đã đạt chuẩn bảo mật và Pass QA 100%!
---
Dưới đây là kịch bản test và đáp án (Expected Results) chi tiết:

---

### 1. Thêm mới (Create Cuisine)
Khi bấm nút **[+ Thêm danh mục mới]**, Modal sẽ hiện ra.

**Cách test & Kết quả đúng:**
*   **Case 1: Không nhập gì (Empty Validation):**
    *   Xóa trắng ô "Tên danh mục". Để nguyên hoặc xóa ô Emoji. Bấm "Lưu Danh Mục".
    *   **Kết quả:** Màn hình lập tức hiện Toast đỏ: *"Vui lòng nhập tên danh mục ẩm thực!"*. Modal không đóng lại, API không được gọi.
*   **Case 2: Ký tự đặc biệt (Regex Validation):**
    *   Nhập Emoji: `🍔`, Nhập tên: `Thức ăn nhanh @#!` -> Bấm Lưu.
    *   **Kết quả:** Màn hình hiện Toast đỏ: *"Tên danh mục không được chứa ký tự đặc biệt (Ví dụ: < > @ # !)"*. API bị chặn ngay tại trình duyệt.
*   **Case 3: Nhập hợp lệ (Success):**
    *   Nhập Emoji: `🍔`, Nhập tên: `Thức ăn nhanh` -> Bấm Lưu.
    *   **Kết quả:** 
        *   Modal đóng lại.
        *   Toast xanh lá: *"Đã thêm danh mục "Thức ăn nhanh" thành công!"*.
        *   **Bảng dữ liệu:** Danh mục mới lập tức xuất hiện ở **dòng đầu tiên** của bảng (Do Frontend đang sort ID giảm dần: mới nhất lên đầu).

---

### 2. Cập nhật (Sửa - Update)
**Cách test & Kết quả đúng:**
*   **Thao tác:** Bấm icon **Cây bút (Edit)** ở dòng `Ăn Chay` (ID: 5).
*   **Kết quả 1:** Modal hiện lên và đã tự động điền sẵn Emoji `🥗` và tên `Ăn Chay`.
*   **Thao tác tiếp:** Đổi tên thành `Thuần Chay`, đổi Emoji thành `🥦` -> Bấm Lưu.
*   **Kết quả 2:** 
    *   Modal đóng lại. Toast báo thành công.
    *   Nhìn ra ngoài bảng, dòng ID số 5 đã lập tức đổi thành `🥦` và `Thuần Chay` mà **không cần tải lại trang** (Nhờ React Query `invalidateQueries`).

---

### 3. Xóa danh mục (Delete) - [TEST EDGE CASE QUAN TRỌNG]
Dựa vào Mock SQL, chúng ta biết:
*   `Món Việt` (ID 1) đang gắn cho *Locked Garden Cafe*.
*   `Món Nhật` (ID 2) đang gắn cho *Yume Sushi Central*.
*   `Đồ Âu` (ID 3) đang gắn cho *Mamma Mia Pasta*.
*   Các món từ ID 4 đến 7 (Hải Sản, Thuần Chay, Steak, Món Hàn) **chưa có nhà hàng nào dùng**.

**Cách test & Kết quả đúng:**
*   **Case 1: Xóa danh mục NHÀN RỖI (Safe Delete):**
    *   Bấm icon **Thùng rác** ở dòng `Món Hàn` (ID 7) hoặc `Hải Sản` (ID 4).
    *   Trình duyệt hỏi: *"Bạn có chắc chắn muốn xóa danh mục này?"* -> Bấm OK.
    *   **Kết quả:** Toast xanh báo *"Đã xóa danh mục thành công!"*. Dòng `Món Hàn` biến mất khỏi bảng.
*   **Case 2: Xóa danh mục ĐANG ĐƯỢC SỬ DỤNG (Blocked by Foreign Key):**
    *   Bấm icon **Thùng rác** ở dòng **`Món Nhật` (ID 2)**.
    *   Trình duyệt hỏi -> Bấm OK.
    *   **Kết quả chuẩn xác 100%:** 
        *   Hệ thống Backend truy vấn DB và phát hiện `Yume Sushi` đang dùng ID 2 này. Lỗi `IllegalStateException` được ném ra từ `CuisineService.java`.
        *   Màn hình Frontend văng Toast Đỏ: **"Không thể xóa! Đang có nhà hàng sử dụng danh mục ẩm thực này. Hãy đổi danh mục cho nhà hàng trước khi xóa."** (Hoặc câu thông báo cấu hình fallback: *"Xóa thất bại. Có thể danh mục đang được sử dụng."*)
        *   Dòng `Món Nhật` **VẪN CÒN NGUYÊN** trên bảng, không bị xóa.
---

Dưới đây là kịch bản test và đáp án (Expected Results) chi tiết cho 5 gạch đầu dòng của bạn:

---

### 1. Tạo thông báo (Gửi ngay)
**Cách test & Kết quả đúng:**
*   **Thao tác:** 
    *   Nhập Tiêu đề: `Tặng mã giảm giá 50K`
    *   Nội dung: Soạn 1 đoạn văn bản, bôi đậm vài chữ. Bấm icon **Image** trong thanh công cụ RichText để upload 1 bức ảnh.
    *   Loại thông báo: Chọn `Khuyến mãi/Voucher (Màu Vàng)`.
    *   Kênh: Chọn `App Notification`. Đối tượng: `Khách hàng`.
    *   Lịch: Giữ nguyên `Gửi ngay`. Bấm **[Lưu Chiến Dịch]**.
*   **Kết quả đúng (UI):**
    *   Màn hình văng Toast xanh: *"Đã lưu chiến dịch truyền thông thành công!"*
    *   Form nhập liệu bị xóa sạch. Trình duyệt tự động chuyển sang tab **"Lịch sử chiến dịch"**.
    *   Chiến dịch mới xuất hiện ở trên cùng. Cột Trạng thái sẽ hiển thị Badge **"Đang chạy"** (Màu xanh dương, chớp nháy pulse) hoặc **"Đã gửi"** (Màu xanh lá) vì Backend dùng `@Async` chạy luồng ngầm rất nhanh.

---

### 2. Tạo thông báo (Lên lịch - Scheduled)
**Cách test & Kết quả đúng:**
*   **Case 1: Lỗi quá khứ (Past Date):**
    *   Bấm "Lên lịch gửi". Bạn sẽ thấy Lịch (Calendar) đã **khóa (mờ đi)** các ngày trước hôm nay nhờ thuộc tính `min={todayStr}`.
    *   Cố tình lách luật bằng cách chọn ngày hôm nay, nhưng nhập giờ là **cách đây 10 phút** -> Bấm Lưu.
    *   **Kết quả:** Màn hình văng Toast đỏ: *"Lịch gửi thông báo không được nằm ở trong quá khứ!"* (Chặn ngay tại Frontend). Kể cả dùng Postman bắn API, Backend cũng sẽ ném lỗi `IllegalArgumentException` tương tự.
*   **Case 2: Hợp lệ (Future Date):**
    *   Chọn ngày là **Ngày mai**, giờ bất kỳ -> Bấm Lưu.
    *   **Kết quả:** Tab Lịch sử hiện ra dòng chiến dịch mới. Trạng thái hiển thị **"Đã lên lịch"** (Màu vàng). Ở cột "Hành động" ngoài cùng bên phải, xuất hiện icon **Dấu X màu đỏ** (Nút hủy khẩn cấp).

---

### 3. Kiểm tra Live Preview (Mô phỏng điện thoại)
**Cách test & Kết quả đúng:**
*   **Thao tác:** Về lại form tạo mới. Ở ô Tiêu đề gõ `Thông báo khẩn`. Ở ô Nội dung, bôi đậm, in nghiêng chữ `Nhà hàng đóng cửa`, sau đó chèn 1 cái ảnh vào.
*   **Kết quả đúng:** 
    *   Bên trong cái điện thoại mô phỏng (Phone Mockup) màu tím, chữ `Thông báo khẩn` hiện lên tức thì.
    *   Dòng nội dung nhỏ bên dưới điện thoại sẽ hiển thị: `Nhà hàng đóng cửa` (Chữ thuần túy). Nó **không bị lộ mã HTML** (như `<strong>`, `<img src=.../>`) nhờ thuật toán Regex cắt thẻ HTML ở file Frontend: `body.replace(/<[^>]*>?/gm, "")`. 

---

### 4. Hủy chiến dịch khẩn cấp
Đây là tính năng "Cứu nguy" (Kill-switch) nếu Admin lỡ lên lịch nhầm nội dung.
**Cách test & Kết quả đúng:**
*   **Thao tác:** Vào tab Lịch sử, tìm dòng chiến dịch đang có trạng thái **"Đã lên lịch"** (Tạo ở Bước 2). Bấm vào icon **Dấu X màu đỏ**.
*   **Kết quả đúng:**
    *   Trình duyệt hỏi: *"Bạn có chắc chắn muốn hủy chiến dịch này?"* -> Bấm OK.
    *   Màn hình văng Toast xanh: *"Đã hủy chiến dịch thành công!"*.
    *   Badge trạng thái của dòng đó lập tức đổi thành **"Đã hủy"** (Màu xám/mặc định).
    *   Icon Dấu X màu đỏ **biến mất** (thay bằng dấu trừ `-`), không cho phép tương tác nữa.
    *   *(Logic ngầm: Backend đã ghi lại 1 dòng Audit Log để truy vết Admin nào vừa hủy chiến dịch).*

---

### 5. Dọn rác Cloudinary (Edge case đỉnh cao)
Bạn đã thiết kế logic rất thông minh ở hàm `handleSaveCampaign` và `handleCancel` để tránh bị "tràn rác" Cloudinary khi Admin thao tác.
**Cách test & Kết quả đúng:**
*   **Case 1: Bấm nút Hủy form:**
    *   Vào form Tạo mới. Tải lên 1 bức ảnh vào RichText. Đợi ảnh load xong.
    *   Thay vì bấm Lưu, bạn bấm nút **[Hủy]** ở dưới cùng.
    *   **Kết quả:** Form xóa trắng. *Ở Backend, nếu bạn nhìn vào Terminal Console, bạn sẽ thấy log in ra: `Đã dọn dẹp rác (xóa ảnh cũ) trên Cloudinary: dineease-menu/xxx...`*.
*   **Case 2: Up 2 ảnh, tự tay xóa 1 ảnh rồi mới Lưu:**
    *   Tải lên **Ảnh A** và **Ảnh B** vào khung soạn thảo.
    *   Bôi đen **Ảnh A** và nhấn phím Backspace/Delete để xóa nó khỏi khung soạn thảo.
    *   Bấm **[Lưu Chiến Dịch]**.
    *   **Kết quả:** Chiến dịch được lưu bình thường chứa Ảnh B. Tuy nhiên, thuật toán quét rác `orphanedImages` của bạn đã nhận diện ra Ảnh A bị bỏ rơi và **gọi API xóa Ảnh A khỏi Cloudinary**. Terminal Backend sẽ báo log dọn rác thành công Ảnh A.
  
---
Dưới đây là kịch bản test và đáp án (Expected Results) chi tiết để bạn tự tin verify luồng này hoạt động chuẩn 100%:

---

### 1. Cập nhật Hoa hồng hệ thống (Chỉ tương lai)
**Cách test & Kết quả đúng:**
*   **Thao tác:** 
    *   Tại thẻ "Mức hoa hồng mặc định", bấm nút **[Cập nhật mức hoa hồng]**.
    *   Màn hình hiện Modal Cảnh báo.
    *   Nhập "Mức hoa hồng mới": `20`
    *   Nhập "Lý do thay đổi": `Tăng chi phí vận hành server`
    *   Khối Checkbox "Áp dụng hồi tố" (màu đỏ) -> **BỎ QUA, KHÔNG BẬT**.
    *   Bấm **[Xác nhận thay đổi]**.
*   **Kết quả trên UI:**
    *   Modal đóng lại. Màn hình văng Toast xanh: *"Cập nhật thành công mức hoa hồng mới: 20%"*.
    *   Con số khổng lồ trên thẻ cấu hình thay đổi từ **15.0%** thành **20.0%**.
*   **Cách Verify (Xác minh không bị lỗi side-effect):**
    *   Bạn mở 1 tab mới, truy cập vào trang Quản lý nhà hàng (`/admin/restaurants`).
    *   Nhìn vào cột "Hoa hồng" của nhà hàng *Yume Sushi Central*, con số vẫn đang giữ nguyên là **15%** (Vì cấu hình 20% chỉ áp dụng cho các quán Đăng ký MỚI từ nay về sau, không ép buộc quán cũ).

---

### 2. Cập nhật Hoa hồng hệ thống (Hồi tố - Nguy hiểm)
Tính năng này ảnh hưởng đến toàn bộ doanh thu của các nhà hàng đang kinh doanh.
**Cách test & Kết quả đúng:**
*   **Thao tác:**
    *   Bấm **[Cập nhật mức hoa hồng]** lần nữa.
    *   Mức hiện tại đang hiển thị là 20.0%. Nhập mức mới: `12`
    *   Lý do: `Khuyến mãi kích cầu đối tác mùa dịch`
    *   Khối Checkbox "Áp dụng hồi tố": **BẬT CÔNG TẮC LÊN** (Nút Switch trượt sang phải và chuyển màu Đỏ).
    *   Bấm **[Xác nhận thay đổi]**.
*   **Kết quả trên UI:**
    *   Con số trên thẻ cấu hình thay đổi thành **12.0%**.
*   **Cách Verify (Xác minh lệnh Bulk Update hoạt động):**
    *   Vào lại trang Quản lý nhà hàng (`/admin/restaurants`), bấm F5 (Tải lại trang).
    *   Bạn sẽ thấy cột "Hoa hồng" của nhà hàng *Yume Sushi Central* **đã bị ép giảm xuống còn 12%**. Toàn bộ Database đã được đồng bộ hàng loạt (Bulk Update) thành công!

---

### 3. Kiểm tra Audit Log (Lịch sử truy vết)
Bảo mật hệ thống đòi hỏi mọi hành động thay đổi tiền bạc đều phải được ghi danh (Log). Bạn hãy cuộn chuột xuống bảng **"Lịch sử điều chỉnh - Audit Log"** ở ngay bên dưới.

**Cách test & Kết quả đúng:**
*   **Kiểm tra Dữ liệu Log (Top 2 dòng trên cùng sẽ là 2 hành động bạn vừa làm):**
    *   **Dòng số 1 (Mới nhất - Hành động hồi tố):**
        *   Người thực hiện: `Hệ Thống Admin` (Có kèm avatar).
        *   Hành động: *Cập nhật mức chiết khấu hệ thống (Đã áp dụng hồi tố cho 1 nhà hàng đang hoạt động)* -> Backend của bạn trả về dòng text rất thông minh để báo cáo số lượng nhà hàng bị ảnh hưởng.
        *   Giá trị: `20% -> 12%` (Số 12% sẽ có màu vàng/cam nổi bật).
        *   Lý do: `Khuyến mãi kích cầu đối tác mùa dịch`.
    *   **Dòng số 2 (Hành động đổi tương lai):**
        *   Hành động: *Cập nhật mức chiết khấu hệ thống* (Không có chữ hồi tố).
        *   Giá trị: `15.0% -> 20%`.
        *   Lý do: `Tăng chi phí vận hành server`.

*   **Kiểm tra thanh Tìm kiếm (Search):**
    *   Gõ chữ `Khuyến mãi` vào ô tìm kiếm -> Bảng lập tức ẩn đi dòng số 2 và các dòng log cũ (từ file mock), chỉ giữ lại duy nhất dòng Log Hồi tố (Dòng 1).

*   **Kiểm tra Lọc ngày (Date Range):**
    *   Xóa thanh tìm kiếm. Bấm vào nút Lịch.
    *   Chọn "Từ ngày": **Hôm qua**. Chọn "Đến ngày": **Hôm qua**. Bấm Áp dụng.
    *   **Kết quả:** 2 hành động bạn vừa test hôm nay sẽ **biến mất**. Bảng chỉ hiện các log cũ trong Mock SQL (Vì trong file `07-notifications-and-logs.sql`, bạn có 1 log update hoa hồng được tạo từ `INTERVAL 2 DAY`).
    *   Bấm "Xóa bộ lọc" -> Tất cả log xuất hiện trở lại.
----
Dưới đây là đáp án (Expected Results) để bạn chốt hạ luồng QA này:

---

### 1. Xem thông báo (`/admin/alerts`)
*   **Thao tác:** Từ Sidebar bên trái, bấm vào menu **Thông báo** (hoặc truy cập thẳng `/admin/alerts`).
*   **Kết quả đúng hiển thị trên UI:**
    *   Giao diện tải lên thành công với tiêu đề "Hộp thư hệ thống".
    *   Bộ lọc Segmented Control hiển thị 2 tab: **"Tất cả"** và **"Chưa đọc (X)"** (Với X là số lượng thông báo mới).
    *   Trong danh sách, bạn sẽ thấy thông báo *"Tặng mã giảm giá 50K"* mà bạn vừa tự tạo ở bài test số 7. (Hệ thống gửi cho "Tất cả" nên Admin cũng nhận được).
    *   Thẻ thông báo này sẽ có viền vàng nhạt, chữ in đậm đen tuyền (Black font), có **1 chấm đỏ** ở góc trên cùng bên phải, và Icon hình Hộp quà màu vàng (Vì lúc tạo bạn chọn type là PROMO).

---

### 2. Trạng thái đọc (Read Status)
Chức năng này kiểm tra việc đồng bộ trạng thái từ Frontend xuống Database.

**A. Đọc từng thông báo:**
*   **Thao tác:** Click chuột vào chính cái thẻ thông báo *"Tặng mã giảm giá 50K"* đang chưa đọc đó.
*   **Kết quả đúng:**
    *   **Ngay lập tức:** Chấm đỏ ở góc phải **biến mất**.
    *   Tiêu đề từ chữ In đậm màu đen (`font-black text-brand-dark`) chuyển sang chữ nhạt hơn màu xám (`font-bold text-stone-700`).
    *   Màu nền thẻ chuyển từ vàng nhạt sang trong suốt (nền trắng).
    *   Con số trên tab "Chưa đọc" giảm đi 1.
    *   *(Logic ngầm: API `PATCH /api/v1/my-notifications/{id}/read` đã được gọi thành công và Update trường `is_read = true` dưới Database, IDOR check cũng đã cho qua vì đúng email).*

**B. Đánh dấu đã đọc tất cả (Mark All As Read):**
*   *Lưu ý: Nếu bạn vừa click đọc hết rồi thì tab "Chưa đọc" sẽ bằng 0 và nút này bị ẩn. Để test, hãy vào lại luồng số 7, tạo nhanh 2-3 thông báo gửi ngay cho "ALL", sau đó quay lại trang này.*
*   **Thao tác:** Bấm vào dòng chữ màu cam **"Đánh dấu đã đọc tất cả"** ở góc phải phía trên danh sách.
*   **Kết quả đúng:**
    *   Toàn bộ các thẻ thông báo trong danh sách đồng loạt **mất chấm đỏ** và chuyển sang màu xám.
    *   Tab "Chưa đọc" hiển thị số **(0)**.
    *   **Đặc biệt:** Cái nút "Đánh dấu đã đọc tất cả" sẽ **tự động biến mất** khỏi màn hình (Vì UI của bạn code rất chuẩn: `{unreadCount > 0 && <button>}`).

***
