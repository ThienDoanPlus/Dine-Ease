
### Danh sách tài khoản test (Lấy từ file `02` và `03`)
1. **Quán Đang hoạt động (ACTIVE):** `owner.yume@gmail.com` (Yume Sushi Central)
2. **Quán Chờ duyệt (PENDING):** `owner.mammam@gmail.com` (Mamma Mia Pasta)
3. **Quán Bị khóa (INACTIVE):** `owner.locked@gmail.com` (Locked Garden Cafe)

---

### BƯỚC 1: TEST ĐĂNG NHẬP (Luồng Happy Path)

**Mục tiêu:** Đăng nhập thành công và được điều hướng đúng trang dành cho chủ quán.

1. Mở trình duyệt, truy cập trang đăng nhập: `http://localhost:3000/login`.
2. Nhập thông tin tài khoản hợp lệ:
   * **Email:** `owner.yume@gmail.com`
   * **Mật khẩu:** `123456`
3. Bấm **"Đăng nhập ngay"**.
4. **Kết quả mong đợi:** 
   * Hiển thị thông báo (Toast): *"Chào mừng trở lại, Kimura Takeshi!"*
   * Trình duyệt tự động chuyển hướng (Redirect) vào trang `http://localhost:3000/restaurant`.
   * Giao diện hiển thị Sidebar của Restaurant (Tổng quan, Sơ đồ bàn, Thực đơn...). Không thấy thanh cảnh báo đỏ nào.

---

### BƯỚC 2: TEST BẢO VỆ ROUTE (Route Protection)

**Mục tiêu:** Đảm bảo tài khoản RESTAURANT không thể đi lạc sang trang của ADMIN hoặc trang khách hàng, và không bị kẹt ở trang Login.

**(Đảm bảo bạn vẫn đang đăng nhập bằng tài khoản `owner.yume@gmail.com` ở Bước 1)**

1. **Test chặn vào trang Admin:**
   * Lên thanh địa chỉ trình duyệt, gõ tay URL: `http://localhost:3000/admin` rồi nhấn Enter.
   * **Kết quả mong đợi:** File `proxy.ts` sẽ phát hiện bạn không có quyền `ADMIN`, lập tức đá bạn quay ngược lại URL `http://localhost:3000/restaurant`.

2. **Test chặn quay lại trang Login/Register:**
   * Gõ tay URL: `http://localhost:3000/login` hoặc `/register` rồi nhấn Enter.
   * **Kết quả mong đợi:** File `proxy.ts` nhận diện Token vẫn còn hợp lệ, không cho phép hiển thị form đăng nhập mà tự động nảy (bounce) bạn về lại `http://localhost:3000/restaurant`.

---

### BƯỚC 3: TEST TRẠNG THÁI TÀI KHOẢN (Global Warning & Khóa tài khoản)

⚠️ **LƯU Ý QUAN TRỌNG TỪ CODE CỦA BẠN:** 
Khi đọc file Backend `AuthService.java` và Frontend `proxy.ts`, tôi thấy hệ thống của bạn được thiết kế **bảo mật rất chặt chẽ**. Nó **KHÔNG CHO PHÉP** quán `PENDING` hoặc `INACTIVE` đăng nhập thành công. Do đó, bài test này sẽ diễn ra theo 2 kịch bản:

#### Kịch bản 3.1: Đăng nhập từ đầu với tài khoản bị khóa/chờ duyệt
1. Bạn hãy bấm nút **Đăng xuất** tài khoản hiện tại.
2. Đăng nhập bằng tài khoản chờ duyệt: `owner.mammam@gmail.com` / `123456`
   * **Kết quả:** Sẽ có Toast báo lỗi màu đỏ (từ `AuthService` trả về 403): *"Tài khoản nhà hàng của bạn đang ở trạng thái: PENDING. Không thể truy cập hệ thống!"*. Bạn bị kẹt lại ở trang Login.
3. Đăng nhập bằng tài khoản bị khóa: `owner.locked@gmail.com` / `123456`
   * **Kết quả:** Có Toast báo lỗi: *"Tài khoản nhà hàng của bạn đang ở trạng thái: INACTIVE. Không thể truy cập hệ thống!"*.

*(Vì hệ thống chặn ngay từ cửa Login, nên Component `GlobalRestaurantWarning.tsx` sẽ không bao giờ xuất hiện theo cách thông thường).*

#### Kịch bản 3.2: Khóa tài khoản "Nóng" khi chủ quán đang sử dụng (Test Component UI)
Để test được Component `GlobalRestaurantWarning.tsx` xuất hiện thanh màu đỏ trên Header, bạn cần mô phỏng việc **Admin bất ngờ khóa quán trong lúc chủ quán đang online**.

1. Mở cửa sổ trình duyệt 1 (Chế độ ẩn danh): Đăng nhập bằng tài khoản Admin (`admin@dineease.com` / `123456`).
2. Mở cửa sổ trình duyệt 2 (Chế độ thường): Đăng nhập bằng tài khoản chủ quán (`owner.yume@gmail.com` / `123456`). Bạn đang ở trang `/restaurant`.
3. Trở lại màn hình của **Admin (Trình duyệt 1)**:
   * Vào mục **QL Nhà hàng**.
   * Tìm nhà hàng **Yume Sushi Central**.
   * Bấm vào nút gạt (Switch) ở cột Trạng thái để tắt nó đi (Chuyển sang `INACTIVE`).
4. Trở lại màn hình của **Chủ nhà hàng (Trình duyệt 2)**:
   * Trong React/NextJS, State của Context chưa được cập nhật ngay lập tức. Hãy thực hiện 1 thao tác chuyển trang nhẹ (Ví dụ bấm vào Sidebar mục "Sơ đồ bàn").
   * Nếu bạn cấu hình Polling API `/auth/me` tốt, State `user.restaurantStatus` sẽ cập nhật thành `INACTIVE`.
   * **Kết quả:** Component `GlobalRestaurantWarning` sẽ lập tức hiện ra dòng chữ đỏ: **"NHÀ HÀNG CỦA BẠN ĐANG BỊ TẠM KHÓA..."** ngay bên dưới Header.
   * *Lưu ý:* Nếu bạn bấm F5 (Tải lại trang toàn bộ), file `proxy.ts` sẽ chạy, phát hiện status là `INACTIVE`, nó sẽ **xóa Cookie** và đá bạn văng ra ngoài trang Login với URL: `/login?error=restaurant_locked`.
----






Để test chính xác luồng **Dashboard & Báo cáo** của nhà hàng, bạn hãy đăng nhập bằng tài khoản chủ quán của **Yume Sushi Central**:
* **Email:** `owner.yume@gmail.com`
* **Mật khẩu:** `123456`

Truy cập vào màn hình **Tổng quan** (`/restaurant`). Dưới đây là đối chiếu chi tiết giữa dữ liệu render trên UI và file SQL để bạn dễ dàng recheck:

---

### BƯỚC 1: KIỂM TRA 4 THẺ THỐNG KÊ (Mặc định: Hôm nay)

Dựa vào file `05-reservations-and-reviews.sql` và `06-orders-pos-kitchen.sql`, dữ liệu hiển thị sẽ như sau:

1. **Doanh thu tổng:** `0 VNĐ`
   * *Giải thích:* Backend (hàm `sumRevenueByDate`) chỉ cộng doanh thu của các hóa đơn POS có trạng thái `COMPLETED`. Trong file `06`, cả 3 Order tạo ra hôm nay đều đang ở trạng thái `OPEN` (Chờ thu ngân tính tiền). Do đó doanh thu tạm thời là 0đ.
2. **Đơn hàng mới:** `3 Order`
   * *Giải thích:* Tương ứng với 3 phiếu `KOT-000001`, `KOT-000002` và `KOT-000003` được tạo trong ngày hôm nay (`NOW()`).
3. **Đang phục vụ & Tỉ lệ lấp đầy bàn:** *(Phụ thuộc vào giờ bạn test)*
   * *Giải thích:* Backend lấy sức chứa các bàn hợp lệ (Bàn 1, 2, 3, 5 = **12 chỗ**; bỏ qua bàn 4 vì đang Bảo trì). 
   * Số lượng khách đang phục vụ được tính bằng các đơn đặt bàn có giờ đến dao động trong khoảng `[Hiện tại - 2h, Hiện tại + 2h]`. Nếu lúc bạn test rơi vào khung 19:00 - 20:30, số khách sẽ nhảy lên `2` hoặc `4` hoặc `6`, kéo theo tỉ lệ lấp đầy sẽ là `17%`, `33%` hoặc `50%`.

---

### BƯỚC 2: KIỂM TRA BỘ LỌC THỜI GIAN (Hôm nay / Tuần / Tháng)

1. **Thao tác:** Bấm chọn sang tab **"Tuần"** hoặc **"Tháng"**.
2. **Biểu đồ vùng (Area Chart):** 
   * Bạn sẽ thấy trục X đổi từ dạng giờ (`HH:00`) sang dạng ngày (`dd/MM`).
   * Do chưa có đơn POS nào `COMPLETED` trong khoảng thời gian này, đường đồ thị sẽ nằm sát đáy ở mốc 0.
3. **Thực đơn bán chạy (Top Items):**
   * Sẽ hiển thị: **"Chưa có dữ liệu."**
   * *Giải thích:* Hàm `findTopSellingItems` cũng chỉ gom nhóm các món ăn thuộc đơn hàng đã `COMPLETED`. 
   * *Tip:* Lát nữa khi bạn test màn hình POS, hãy thanh toán thử 1-2 đơn. Quay lại trang này, bạn sẽ thấy đồ thị giật lên và danh sách món (Sashimi, Trà sữa...) xuất hiện kèm phần trăm!

---

### BƯỚC 3: BẢNG LỊCH SỬ GIAO DỊCH TRỰC TIẾP

Cuộn xuống dưới cùng, bảng này lấy 10 giao dịch gần nhất không phân biệt trạng thái (`findRecentOrders`). Bạn sẽ thấy chính xác **3 dòng** theo thứ tự từ mới nhất đến cũ nhất:

* **Dòng 1 (Order 3 - Bán mang đi):**
  * **Mã & Trạng thái:** `KOT-000003` | Status: `Đang chờ` (Màu vàng, nhấp nháy).
  * **Phương thức:** Mặc định hiện icon `Tiền mặt` (Vì đơn đang OPEN, chưa chọn phương thức thanh toán).
  * **Sản phẩm:** *Trà Sữa Matcha Zen*.
  * **Tổng thanh toán:** `59.400 VNĐ` (Đã tính: 55k gốc + 8% VAT).
* **Dòng 2 (Order 2 - Bàn 005):**
  * **Mã & Trạng thái:** `KOT-000002` | Status: `Đang chờ`.
  * **Sản phẩm:** *Sashimi Cá Hồi...*
  * **Tổng thanh toán:** `403.600 VNĐ` (Đã tính: 370k món + 50k phụ phí + 8% VAT - 50k Voucher).
* **Dòng 3 (Order 1 - Bàn 002):**
  * **Mã & Trạng thái:** `KOT-000001` | Status: `Đang chờ`.
  * **Sản phẩm:** *Sashimi Cá Hồi, Beefsteak...*
  * **Tổng thanh toán:** `1.711.800 VNĐ`.

**Test Real-time (Auto Refetch):**
Hãy giữ nguyên tab Dashboard này. Mở 1 tab ẩn danh khác đăng nhập vào Admin hoặc Postman bắn API tạo 1 đơn POS mới. Quai lại tab này chờ tối đa **10 giây**, bảng Lịch sử giao dịch sẽ tự động giật nhẹ và đùn thêm 1 dòng mới lên trên cùng mà không cần F5.

---

### BƯỚC 4: TEST TÍNH NĂNG XUẤT BÁO CÁO (Excel)

1. Bấm vào nút **"Xuất báo cáo"** (Có icon tải xuống) ở góc trên bên phải.
2. Trạng thái nút sẽ đổi thành *"Đang xuất..."* kèm icon xoay (Spinning loader).
3. **Kết quả:**
   * Một thông báo xanh hiện lên: *"Đã kết xuất báo cáo thành công!"*.
   * Trình duyệt tải xuống file: `Restaurant_Report.xlsx`.
   * Mở file ra, bạn sẽ thấy các cột *Mã Đơn, Bàn, Tổng Tiền, Thời Gian*. Hiện tại file sẽ chỉ có phần Tiêu đề (Header) và không có dòng dữ liệu nào (Vì chưa có đơn POS `COMPLETED`). Lát nữa thu ngân chốt đơn xong xuất lại sẽ có data.

---
Dưới đây là hướng dẫn chi tiết để test **Luồng Quản lý Sơ đồ bàn & Gọi món (Chế độ Vận hành)** dựa trên dữ liệu từ file `03-restaurants-and-tables.sql` và `06-orders-pos-kitchen.sql`.

Hãy đăng nhập bằng tài khoản chủ quán: `owner.yume@gmail.com` / `123456` và truy cập menu **Sơ đồ bàn** (`/restaurant/tables`).

---

### BƯỚC 0: KIỂM TRA DỮ LIỆU HIỂN THỊ BAN ĐẦU (Recheck UI)
Khi vừa vào trang, hãy nhìn vào khu vực Canvas (Sảnh chính - Tầng 1), bạn sẽ thấy dữ liệu render khớp 100% với Database:
* **Tường mặt tiền & Cửa chính:** Render dưới dạng khối màu xám và viền đứt nét màu cam.
* **Bàn 001:** Màu trắng (Trạng thái `AVAILABLE` - Trống).
* **Bàn 002:** Màu vàng, có dấu chấm than nhấp nháy (Trạng thái `OCCUPIED` - Có hóa đơn `KOT-000001` đang mở).
* **Bàn 003 (Bàn tròn):** Màu vàng, có nhãn **"GỘP #2"** ở trên đầu (Do `mergedId = 2` và ăn theo trạng thái của bàn 002).
* **Bàn 004:** Màu xám, có dải ruy băng chéo **"ĐANG HỎNG"** (Trạng thái `MAINTENANCE`).
* **Bàn 005 (Bàn tròn):** Màu xanh dương (Trạng thái `RESERVED` - Khách đã đặt trước).

---

### BƯỚC 1: TEST ĐỔI TẦNG / KHU VỰC

1. Nhìn lên thanh công cụ góc trên bên phải.
2. Bấm chọn **"Tầng 2"** hoặc đổi Dropdown sang **"Phòng VIP 1"**.
3. **Kết quả:** Bản vẽ lập tức trống trơn. *(Vì trong SQL, toàn bộ bàn đang được gán `floor_name = '1_main'`)*.
4. Chọn lại **"Tầng 1"** và **"Sảnh chính"**, các bàn sẽ xuất hiện trở lại.

---

### BƯỚC 2: TEST LỌC TRẠNG THÁI BÀN

Nằm ở thanh công cụ góc trái (ngay trên bản vẽ):
1. Bấm nút **"Trống"**: 
   * **Kết quả:** Chỉ còn **Bàn 001** hiển thị trên màn hình. Các bàn khác biến mất.
2. Bấm nút **"Phục vụ"**: 
   * **Kết quả:** Chỉ hiển thị **Bàn 002** và **Bàn 003**.
3. Bấm lại nút **"Tất cả"** để hiển thị lại toàn bộ sơ đồ.

---

### BƯỚC 3: TEST TÁCH BÀN VÀ GỘP BÀN (MERGE / UNMERGE)

Luồng này backend bắt logic rất chặt để chống sai lệch hóa đơn kế toán. Hãy test theo trình tự sau:

#### Kịch bản 3.1: Test Tách bàn (Dính lỗi chặn logic)
Trong sơ đồ đang có Bàn 003 gộp vào Bàn 002 và đang có khách ngồi ăn.
1. Bấm nút màu đỏ **"Tách bàn"** ở thanh công cụ.
2. Bấm **"OK"** ở popup xác nhận của trình duyệt.
3. **Kết quả:** Hệ thống báo lỗi đỏ: *"Thao tác thất bại: Không thể tách bàn '003' vì cụm bàn này đang có khách hoặc chưa hoàn tất thanh toán Hóa đơn!"* (Logic bảo vệ toàn vẹn dữ liệu từ Spring Boot hoạt động tốt).

#### Kịch bản 3.2: Test Gộp bàn ảo (Lỗi chưa lưu DB)
1. Bấm nút đen **"Thiết Kế"** (Góc trên phải).
2. Bấm **"Bàn vuông"** ở Sidebar bên trái -> Một bàn tên "Mới" hiện ra (ID lúc này là ID ảo `el_123...`).
3. Bấm lại nút **"Lưu Sơ Đồ"** để tắt chế độ thiết kế (NHƯNG khoan, để tạo lỗi, bạn vừa tạo xong hãy **refresh (F5)** lại trang để mất bàn đó, hoặc làm nhanh tay: Bấm "Thiết kế" -> "Bàn vuông" -> Lập tức bấm **"Gộp bàn"** ở thanh công cụ).
   * *Nếu làm đúng luồng test:* Bấm **"Gộp bàn"** -> Chọn **Bàn 001** và bàn **"Mới"** -> Bấm **"Xác nhận gộp"**.
   * **Kết quả:** Báo lỗi đỏ: *"Vui lòng bấm 'Lưu Sơ Đồ' trước khi thực hiện gộp các bàn mới!"*.

#### Kịch bản 3.3: Test Gộp bàn thực tế (Happy Path)
1. Bấm F5 để tải lại trạng thái sạch.
2. Bấm nút **"Gộp bàn"**. Thanh công cụ đổi sang chế độ chọn.
3. Click vào **Bàn 001** (Được tính là bàn Master).
4. Click vào **Bàn 004** (Bàn con sẽ bị gộp).
5. Bấm **"Xác nhận gộp"** (Nút màu xanh dương).
6. **Kết quả:** 
   * Toast xanh: *"Đã lưu sơ đồ đồng bộ lên hệ thống!"*.
   * **Bàn 004** xuất hiện nhãn đen **"GỘP #1"** trên đầu. Trạng thái của 004 sẽ nương theo 001.

---

### BƯỚC 4: TEST CONTEXT MENU (Click phải/trái vào bàn)

1. **Test Báo hỏng bàn:**
   * Click chuột vào **Bàn 001** (Đang màu trắng).
   * Một menu ngữ cảnh nhỏ sẽ mọc ra tại vị trí bàn.
   * Bấm dòng cuối cùng: **"Báo hỏng bàn"** (Icon Cờ lê màu đỏ).
   * **Kết quả:** Bàn 001 lập tức chuyển sang màu Xám, có dải chéo **"ĐANG HỎNG"**.

2. **Test Đã sửa xong:**
   * Click chuột vào **Bàn 004** (Vốn đang hỏng từ trong file SQL).
   * Menu ngữ cảnh hiện ra. Dòng cuối cùng lúc này sẽ đổi thành **"Đã sửa xong"** (Icon Cờ lê màu xanh lá).
   * Bấm vào **"Đã sửa xong"**.
   * **Kết quả:** Bàn 004 lập tức rũ bỏ nhãn "ĐANG HỎNG", sáng lên màu trắng bình thường (Trạng thái `AVAILABLE`).

3. **Test tắt Menu:** Click vào khoảng trống bất kỳ trên nền caro xám, menu sẽ tự động đóng lại.







---
Để test chính xác luồng **Ghi nhận Order (Gọi món)**, chúng ta sẽ dựa vào bộ dữ liệu thực đơn cực kỳ chi tiết từ file `04-menus-and-options.sql`. 

Hãy đảm bảo bạn đang ở trang **Sơ đồ bàn** (`/restaurant/tables`) và đăng nhập bằng tài khoản `owner.yume@gmail.com`. Để kết quả test chính xác nhất, hãy nhấn **F5** để làm mới lại trạng thái trang.

---

### BƯỚC 1: MỞ GIAO DIỆN GHI NHẬN ORDER

1. Trên bản vẽ, click chuột trái vào **Bàn 001** (Đang màu trắng - Trống).
2. Menu ngữ cảnh (Context Menu) sẽ hiện ra, bấm vào dòng đầu tiên: **"Gọi món"** (Icon ly cà phê).
3. **Kết quả:** 
   * Một Modal lớn (OrderMenuModal) mở ra chèn lên màn hình.
   * Góc trên bên trái hiển thị chữ màu cam: **"Bàn: 001"**.
   * Bên trái là Menu món ăn, bên phải là Giỏ hàng trống.

---

### BƯỚC 2: TEST BỘ LỌC & TÌM KIẾM MÓN ĂN

1. Trên thanh danh mục (Categories), bấm qua lại giữa các tab **"Món Chính"**, **"Đồ Uống"**. Bạn sẽ thấy danh sách món thay đổi tương ứng.
2. Tại ô Tìm kiếm, gõ chữ **"Sashimi"**.
3. **Kết quả:** Chỉ còn duy nhất món *Sashimi Cá Hồi Na Uy* hiển thị trên màn hình. Xóa chữ trong ô tìm kiếm để hiện lại toàn bộ.

---

### BƯỚC 3: TEST THÊM MÓN THƯỜNG (Không có Topping)

1. Tìm và click thẳng vào món **Sashimi Cá Hồi Na Uy** (Giá 185.000đ).
2. **Kết quả:** 
   * Món ăn lập tức bay thẳng sang Giỏ hàng bên phải (Vì trong SQL món này không cấu hình `option_groups`).
   * Cột "Tổng tạm tính" góc dưới bên phải cập nhật thành **185.000đ**.

---

### BƯỚC 4: TEST THÊM MÓN TÙY CHỈNH (Có Topping/Size)

#### Kịch bản 4.1: Bắt validate tùy chọn Bắt buộc (Required)
1. Click vào món **Beefsteak Wagyu A5** (Có icon bánh răng màu xanh ở góc).
2. Một Popup cấu hình món hiện ra. Món này có nhóm tùy chọn **"Chọn độ chín"** (Bắt buộc chọn 1).
3. Cố tình KHÔNG chọn độ chín nào, bấm thẳng nút **"Thêm vào giỏ"**.
4. **Kết quả:** Hệ thống báo lỗi đỏ: *"Vui lòng chọn: Chọn độ chín"*.
5. Khắc phục: Tick chọn **Medium Rare**, rồi bấm **"Thêm vào giỏ"**. Món sẽ được đẩy sang cột bên phải kèm theo dòng chữ ghi chú nhỏ bên dưới tên món: *Medium Rare*.

#### Kịch bản 4.2: Test Cộng dồn tiền Topping
1. Click vào món **Trà Sữa Matcha Zen**.
2. Popup hiện ra. Nhìn xuống góc trái dưới, "Tạm tính" đang là **55.000đ**.
3. Tick chọn **Size L** (+10.000đ) và **Trân châu trắng** (+10.000đ).
4. **Kết quả trên UI:** Số tiền "Tạm tính" nhảy realtime lên **75.000đ**.
5. Bấm **"Thêm vào giỏ"**. Món Trà sữa (75k) xuất hiện bên giỏ hàng, bên dưới có 2 tag: *Size L (+10k)* và *Trân châu trắng (+10k)*.

---

### BƯỚC 5: TEST TƯƠNG TÁC GIỎ HÀNG (Sửa/Xóa/Ghi chú)

Lúc này giỏ hàng đang có 3 món. Hãy thao tác bên cột Giỏ hàng:
1. **Tăng/Giảm số lượng:** Ở món *Sashimi*, bấm nút **(+)**. Số lượng nhảy lên `2`. Tổng tiền tự động cộng thêm 185k. Bấm **(-)** để lùi về `1`.
2. **Ghi chú riêng:** Ở ô input mờ bên dưới món *Beefsteak*, gõ chữ: `"Thái miếng vuông nhỏ giúp em"`. (Text này lát nữa sẽ được in ra phiếu bếp).
3. **Xóa món:** Ở món *Trà Sữa*, bấm vào nút thùng rác màu đỏ. Món lập tức bốc hơi khỏi giỏ, tổng tiền bị trừ đi 75k.

---

### BƯỚC 6: CHỐT ĐƠN & GỬI BẾP

1. Kiểm tra lại Giỏ hàng hiện tại (Sashimi x1, Beefsteak x1).
2. Bấm nút màu cam to đùng ở góc dưới cùng bên phải: **"Gửi Bếp (In Phiếu)"**.
3. **Kết quả mong đợi:**
   * Một thông báo xanh hiện lên: *"Đã bắn order xuống bếp thành công!"*.
   * Modal tự động đóng lại, đưa bạn về màn hình Sơ đồ bàn.
   * **Bàn 001** (Lúc nãy màu trắng) nay đã chuyển sang **Màu Vàng** (`OCCUPIED` - Đang phục vụ).
   * Góc phải dưới của Bàn 001 xuất hiện icon dấu chấm than **[!]** nhấp nháy, báo hiệu bàn này vừa có action mới.

🎉 **Hoàn thành!** Lúc này, nếu bạn mở tab ẩn danh đăng nhập vào màn hình **Quản lý Bếp** (`/restaurant/kitchen`), bạn sẽ thấy 1 phiếu KOT mới toanh vừa chạy ra cho Bàn 001 với đầy đủ độ chín và ghi chú bạn vừa gõ!



---Để test chính xác module **Sơ đồ bàn - Chế độ Thiết kế (`/restaurant/tables`)**, bạn tiếp tục sử dụng tài khoản Chủ nhà hàng **Yume Sushi Central**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456`

*(Màn hình này sử dụng thư viện `react-rnd` kết hợp `react-zoom-pan-pinch` nên việc xử lý tọa độ khi Zoom là phần rất quan trọng).*

Dưới đây là kịch bản test chi tiết:

---

### BƯỚC 1: KIỂM TRA KHỞI TẠO & VÀO CHẾ ĐỘ THIẾT KẾ
1. Truy cập vào **Sơ đồ bàn**. 
2. *Kỳ vọng ban đầu:* Bạn sẽ thấy 5 bàn (001, 002, 003, 004, 005) mang các màu sắc khác nhau (Trống, Đang phục vụ, Đã đặt, Đang hỏng) và 1 bức tường, 1 cửa ra vào.
3. Bấm nút **"Thiết Kế"** (Màu đen ở góc phải trên).
4. *Kỳ vọng UI:* 
    * Chuyển sang chế độ lưới mờ (Grid). 
    * Xuất hiện thanh **Sidebar màu trắng bên trái** chứa các nút Thêm bàn/Tường/Cửa. 
    * Tất cả các bàn trên sơ đồ biến thành **màu trắng viền xám** (Vì trong chế độ thiết kế không quan tâm đến việc khách đang ngồi hay không).

---

### BƯỚC 2: TEST THÊM VẬT THỂ MỚI
Tại Sidebar bên trái:
1. Bấm **Bàn Tròn**.
2. Bấm **Vật cản** (Tường).
3. Bấm **Cửa đi**.
*   *Kỳ vọng UI:* Các vật thể lập tức xuất hiện trên khung vẽ ở góc trên cùng bên trái (tọa độ x:100, y:100). Mã ID tạm thời sẽ sinh ra dạng `el_1714...` (Chưa có trong Database).

---

### BƯỚC 3: TEST TÙY CHỈNH VẬT THỂ VÀ RENDER GHẾ (CHAIRS)
Chọn cái **Bàn Tròn** vừa thêm.
1. Nhìn sang Sidebar trái, sửa ô **Tên bàn** thành: `VIP-1`.
2. Sửa ô **Số ghế** thành: `8`.
3. Nhấp chuột ra ngoài khoảng trống.
*   *Kỳ vọng UI (Thuật toán lượng giác vòng tròn):* 
    * Tên bàn lập tức đổi thành **VIP-1**.
    * Quan trọng nhất: UI tự động vẽ **chính xác 8 cái chấm tròn (ghế) bao quanh mép bàn**. Khoảng cách các ghế được chia đều tăm tắp thành hình bát giác. Chiều xoay của ghế hướng vuông góc vào tâm bàn.
*   *(Tương tự, nếu bạn chọn bàn Vuông và nhập 8 ghế, code sẽ tự chia: Top 2, Bottom 2, Left 2, Right 2 ghế bám sát theo 4 cạnh viền).*

---

### BƯỚC 4: TEST KÉO THẢ, RESIZE VÀ "LỖI TRƯỢT CHUỘT KHI ZOOM"
Đây là lỗi kinh điển nhất của các Web App vẽ sơ đồ. Code của bạn đã được vá bằng công thức: `delta / state.scale`. Hãy test để nghiệm thu:

1. **Zoom In:** Dùng lăn chuột hoặc bấm nút `+` góc phải dưới để phóng to sơ đồ lên mức **1.5x** hoặc **2.0x**.
2. **Test Kéo thả (Drag):** Nắm kéo bàn `VIP-1` sang một vị trí tít góc phải màn hình.
    *   *Kỳ vọng:* Con trỏ chuột của bạn **ghim chặt** vào vị trí bạn đã click trên bàn. Bàn di chuyển mượt mà cùng tốc độ với chuột, **không hề bị trôi (drifting) hay chạy nhanh/chậm hơn chuột**.
3. **Test Kéo giãn (Resize):** Chọn một bức tường. Kéo nắm ở góc phải dưới của bức tường để làm nó dài ra.
    *   *Kỳ vọng:* Cạnh của bức tường bám sát theo con trỏ chuột. Không bị lệch khung dù đang Zoom to.

---

### BƯỚC 5: LƯU SƠ ĐỒ VÀ KIỂM CHỨNG DATABASE
Sau khi đã kéo thả ngổn ngang, ta tiến hành lưu:
1. Bấm nút **"Lưu Sơ Đồ"** (Màu đen góc phải trên).
2. *Kỳ vọng UI:* Toast xanh báo "Đã lưu sơ đồ đồng bộ lên hệ thống!". Sidebar bên trái biến mất. Sơ đồ trở lại chế độ vận hành (Màu sắc các bàn đang có khách hiện lại bình thường).
3. **Kỳ vọng Database (Hoạt động ngầm):**
    *   **Bảng `restaurant_tables`:** Các bàn cũ (001, 002...) được cập nhật cột `pos_x`, `pos_y`, `width`, `height`. Bàn mới `VIP-1` được INSERT thành 1 dòng mới, có sinh ID thật (Ví dụ: ID 8), status mặc định là `AVAILABLE`.
    *   **Bảng `restaurants`:** Cột `architectural_data` được cập nhật lại chuỗi JSON chứa các bức tường và cửa đi mới nhất cùng tọa độ mới.
4. **F5 (Tải lại trang):** Bàn `VIP-1` và các bức tường vẫn nằm y nguyên vị trí bạn vừa kéo thả.

Nếu các chấm ghế (chairs) render chuẩn số lượng và chuột không bị "tuột" khi kéo thả lúc Zoom, thì chúc mừng bạn, Frontend Canvas kéo thả của bạn đã xử lý **toán học và UX cực kỳ xuất sắc**!

---
Dựa trên các file SQL và mã nguồn (Frontend + Backend) bạn đã cung cấp, tôi sẽ hướng dẫn bạn test chi tiết module **Quản lý Thực đơn (`/restaurant/menu`)**. 

Đầu tiên, bạn cần đăng nhập bằng tài khoản của **Chủ nhà hàng 1 (Yume Sushi Central)**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456` *(Hệ thống sinh hash tự động cho 123456)*

Dưới đây là kịch bản test từng bước và **Dữ liệu chính xác 100% phải render ra UI** dựa theo file SQL:

---

### BƯỚC 1: KIỂM TRA DỮ LIỆU KHỞI TẠO (INITIAL RENDER)
Vào route `/restaurant/menu`, hệ thống phải hiển thị chính xác các thông tin sau:

**1. Thanh Tab Danh Mục (Menu Categories):**
*   Phải có 4 Tab: `Tất cả` | `Sushi & Sashimi` | `Món Chính` | `Đồ Uống` *(Lấy từ bảng `menu_categories`)*.

**2. Bảng Danh sách món ăn (Menu Items):**
Hiển thị tổng cộng **4 món ăn**, kiểm tra kỹ các thông số sau:
1.  **Sashimi Cá Hồi Na Uy:**
    *   Giá: `185.000đ` | Tag Danh mục: `Sushi & Sashimi`
    *   Badge: Có chữ **"Bestseller"** *(Vì is_bestseller = 1)*
    *   Công tắc Phục vụ (Switch): **ĐANG BẬT** *(AVAILABLE)*
2.  **Beefsteak Wagyu A5:**
    *   Giá: `1.250.000đ` | Tag Danh mục: `Món Chính`
    *   Badge: Có chữ **"Bestseller"**
    *   Công tắc Phục vụ: **ĐANG BẬT**
3.  **Trà Sữa Matcha Zen:**
    *   Giá: `55.000đ` | Tag Danh mục: `Đồ Uống`
    *   Badge: *Không có*
    *   Công tắc Phục vụ: **ĐANG BẬT**
4.  **Cua Hoàng Đế:**
    *   Giá: `3.500.000đ` | Tag Danh mục: `Món Chính`
    *   Badge: *Không có*
    *   Công tắc Phục vụ: **ĐANG TẮT** (Màu xám) *(Vì trong SQL status = 'SOLD_OUT')*

---

### BƯỚC 2: TEST QUẢN LÝ DANH MỤC (CATEGORIES)
Bấm nút **"Danh mục"** (Có icon LayoutList).

*   **Test Thêm mới:** 
    *   Nhập tên "Tráng miệng" -> Bấm **Thêm**.
    *   *Kỳ vọng:* Báo Toast xanh "Thêm danh mục thành công". Chữ "Tráng miệng" xuất hiện trong danh sách Popup và sẽ xuất hiện trên thanh Tab ở màn hình chính sau khi đóng popup.
*   **Test Ràng buộc Xóa (Lỗi FK):**
    *   Bấm icon Thùng rác ở danh mục **"Món Chính"**.
    *   *Kỳ vọng:* Hệ thống chặn lại và văng lỗi (Do "Món Chính" đang chứa món Bò Wagyu và Cua Hoàng Đế, ràng buộc Khóa ngoại Database sẽ ném DataIntegrityViolationException).
*   **Test Xóa thành công:**
    *   Bấm icon Thùng rác ở danh mục **"Tráng miệng"** (vừa tạo, chưa có món nào).
    *   *Kỳ vọng:* Xóa thành công, biến mất khỏi UI.

---

### BƯỚC 3: TEST TÌM KIẾM VÀ BỘ LỌC
*   **Lọc theo Tab:** Bấm qua Tab **"Đồ Uống"**. 
    *   *Kỳ vọng:* Bảng chỉ còn duy nhất 1 món là `Trà Sữa Matcha Zen`. Số lượng góc phải hiển thị `1 Món`.
*   **Tìm kiếm text:** Bấm về Tab **"Tất cả"**. Gõ chữ `"cá hồi"` vào ô tìm kiếm.
    *   *Kỳ vọng:* Bảng chỉ còn hiển thị món `Sashimi Cá Hồi Na Uy`.

---

### BƯỚC 4: TEST THÊM MÓN MỚI (CÓ XỬ LÝ ẢNH)
Bấm nút **"Thêm món mới"**. Form Modal hiện lên trống rỗng.

*   **Test Validate:** Bấm "Lưu món ăn" khi chưa điền gì -> *Kỳ vọng:* Báo lỗi "Vui lòng điền đủ Tên, Giá, Danh mục".
*   **Test Upload Ảnh (Cloudinary):**
    *   Điền: Tên `"Sake Bomb"`, Giá `"120000"`, Chọn Danh mục `"Đồ Uống"`.
    *   Chọn upload 3 bức ảnh cùng lúc.
    *   Bấm icon Thùng rác (màu đỏ) trên UI preview để xóa thử 1 bức ảnh.
    *   Bấm **"Lưu món ăn"**.
    *   *Kỳ vọng:* Đợi vài giây (do phải đẩy ảnh lên Cloudinary). Sau đó Modal đóng, bảng xuất hiện món `Sake Bomb` với giá `120.000đ`.

---

### BƯỚC 5: TEST CHỈNH SỬA MÓN ĂN (SỬA ẢNH & DATA)
Bấm icon **Sửa (Bút chì)** ở món `Trà Sữa Matcha Zen`.

*   **Test Data Binding:**
    *   *Kỳ vọng:* Form đổ đúng tên "Trà Sữa Matcha Zen", Giá "55000", Danh mục "Đồ Uống". Có đúng 1 hình ảnh Preview đang hiện.
*   **Test Sửa:**
    *   Sửa Giá thành `60000`.
    *   Đổi Danh mục sang `Món Chính`.
    *   Chọn thêm 1 hình ảnh mới từ máy tính.
    *   Bấm **Lưu món ăn**.
    *   *Kỳ vọng:* Modal đóng. Ngoài UI món Trà sữa đã nhảy giá thành `60.000đ` và Tag chuyển thành `Món Chính`. *(Backend sẽ gọi Cloudinary up ảnh mới lên và giữ nguyên ảnh cũ)*.

---

### BƯỚC 6: TEST BẬT / TẮT PHỤC VỤ (SOLD_OUT)
Công tắc (Switch) trên bảng là tính năng giúp nhà hàng báo Hết nguyên liệu cấp tốc.

*   **Thao tác 1:** Tắt công tắc ở món `Sashimi Cá Hồi Na Uy`.
    *   *Kỳ vọng:* Công tắc gạt sang trái (Màu xám). Toast báo "Đã báo hết hàng món này". Trạng thái DB thành `SOLD_OUT`. (Khách hàng bên App hoặc Quét mã QR tại bàn sẽ thấy món này bị mờ đi).
*   **Thao tác 2:** Bật công tắc ở món `Cua Hoàng Đế` (Lúc nãy đang tắt).
    *   *Kỳ vọng:* Công tắc gạt sang phải (Màu hổ phách). Toast báo "Đã mở bán lại món ăn". Trạng thái DB thành `AVAILABLE`.

---

### BƯỚC 7: TEST XÓA MÓN ĂN (SOFT DELETE)
Trong nghiệp vụ POS, không được xóa hẳn món ăn (Hard Delete) vì sẽ gây lỗi cho các Hóa đơn cũ đã bán. Mã của bạn xử lý bằng **Soft Delete**.

*   **Thao tác:** Bấm icon **Thùng rác** ở món `Beefsteak Wagyu A5`. Xác nhận Xóa.
*   **Kỳ vọng:**
    1.  Món Wagyu biến mất ngay lập tức khỏi UI bảng.
    2.  Check dưới DB: Dòng Wagyu vẫn còn, nhưng cột `status` đã bị update thành `HIDDEN`.
    3.  *(Chéo module)*: Check sang màn hình KOT hoặc Báo cáo doanh thu cũ xem các bill cũ chứa Wagyu có bị sập hay mất tên không (Sẽ không sập vì món vẫn tồn tại dưới DB).




---
Dưới đây là kịch bản test chi tiết cho module **Quản lý Đặt bàn (Kanban Board - `/restaurant/reservations`)**. 

Để test, hãy đảm bảo bạn đang đăng nhập bằng tài khoản Chủ nhà hàng **Yume Sushi Central**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456`

Do Backend đã được tối ưu chống tràn RAM bằng cách **ép lọc theo ngày (targetDate)**, nên giao diện sẽ thay đổi dựa vào ngày bạn chọn trên bộ lịch.

---

### BƯỚC 1: KIỂM TRA DỮ LIỆU KHỞI TẠO (Ngày hôm nay)
Ngay khi vừa vào trang, bộ lọc ngày mặc định là **Hôm nay**. Hệ thống phải render chính xác dữ liệu từ file SQL (`05-reservations-and-reviews.sql`):

*   **Cột 1 (Yêu cầu mới): 1 Đơn**
    *   Tên: **Nguyễn Hoàng Yến** | Khách: **2** | Giờ: **19:00**
    *   Trạng thái ngầm định: `PENDING`
    *   Ghi chú: *"Kỷ niệm ngày cưới, quán chuẩn bị giúp mình 1 bông hoa hồng..."*
    *   Các nút: **Xác nhận** (màu đen) và **Từ chối** (màu viền đỏ).
*   **Cột 2 (Đã xác nhận): 1 Đơn**
    *   Tên: **Nguyễn Hoàng Yến** | Khách: **4** | Giờ: **20:30**
    *   Trạng thái ngầm định: `CONFIRMED`
    *   Ghi chú: *"Nhà có trẻ nhỏ, cần 1 ghế ngồi cho em bé."*
    *   Các nút: **Xếp bàn** (có icon MapPin) và **Hoàn tất đơn** (màu hổ phách).
*   **Cột 3 (Hoàn thành / Hủy): 0 Đơn** (Vì các đơn hoàn thành/hủy trong SQL đều là của ngày hôm qua và các ngày trước đó).

---

### BƯỚC 2: TEST TÌM KIẾM VÀ LỌC THEO NGÀY
Đặc sản của module này là bảo vệ Database, không bao giờ Query toàn bộ dữ liệu.

1.  **Đổi ngày trên Calendar thành Hôm qua (Yesterday):**
    *   *Kỳ vọng:* Cột 1 và 2 trống rỗng. Cột 3 (Hoàn thành / Hủy) xuất hiện **1 đơn của Nguyễn Hoàng Yến** (Hủy lúc 18:00). Ghi chú: *"Lý do hủy: Trời mưa quá lớn..."*.
2.  **Đổi ngày trên Calendar thành 2 ngày trước:**
    *   *Kỳ vọng:* Cột 3 xuất hiện đơn **Hoàn thành** lúc 19:30, khách 3 người.
3.  **Test ô Search (Chuyển ngày lại thành Hôm nay):**
    *   Gõ chữ `"Yến"`: Vẫn giữ nguyên 2 thẻ.
    *   Gõ chữ `"Vãng lai"`: Bảng trống rỗng.

---

### BƯỚC 3: TEST XỬ LÝ CỘT "YÊU CẦU MỚI" (PENDING)
Thao tác trên đơn **Nguyễn Hoàng Yến (19:00 - 2 Khách)** ở Cột 1.

*   **Nếu bấm "Từ chối":** Thẻ sẽ bay thẳng sang Cột 3 (Trạng thái chuyển thành `CANCELLED`). (Trường hợp này đừng bấm để lát test Xếp bàn).
*   **Thao tác chuẩn:** Bấm nút **Xác nhận (Check)**.
    *   *Kỳ vọng UI:* Thẻ mượt mà bay từ Cột 1 sang **Cột 2 (Đã xác nhận)**. Toast báo thành công. UI Cột 1 hiện chữ "Chưa có dữ liệu". Trạng thái Backend thành `CONFIRMED`.

---

### BƯỚC 4: TEST XỬ LÝ CỘT "ĐÃ XÁC NHẬN" (XẾP BÀN)
Bây giờ Cột 2 đang có 2 thẻ. Chọn thao tác trên đơn **Nguyễn Hoàng Yến (20:30 - 4 Khách)**.

1.  Bấm nút **Xếp bàn**. Modal danh sách bàn trống hiện lên.
2.  **Kiểm tra tính đúng đắn của SQL:**
    *   Bạn yêu cầu test: *Chọn bàn "002"* -> **Bạn sẽ KHÔNG THỂ THẤY bàn "002" trong Modal này!**
    *   *Lý do (Logic Backend tuyệt vời):* Trong file SQL `03-restaurants-and-tables.sql`, bàn "002" đang ở trạng thái `OCCUPIED` (Có khách), bàn "004" là `MAINTENANCE`. Mã Frontend của bạn (`availableTables.filter(t => t.status === "AVAILABLE")`) đã **chặn không cho hiển thị bàn đang có người/hỏng**. 
    *   *Thực tế trên UI:* Bạn chỉ thấy nút cho bàn **"001"** (Vì nó là bàn `AVAILABLE` duy nhất của nhà hàng Yume Sushi có trong SQL).
3.  **Thao tác:** Bấm chọn bàn **"001"**.
    *   *Kỳ vọng UI:* Modal đóng. Thẻ đơn hàng xuất hiện thêm 1 dòng Badge màu xanh lá cây: **"Bàn xếp: 001"**. Thẻ vẫn nằm ở Cột 2 (Trạng thái nội bộ là `CHECKED_IN`).

---

### BƯỚC 5: HOÀN TẤT ĐƠN (TÍNH TIỀN & HOA HỒNG)
Thao tác trên chính đơn vừa xếp bàn xong (Đơn 20:30, Khách 4 người, Bàn 001).

1.  Bấm nút **Hoàn tất đơn (Màu vàng)**. Modal tính tiền hiện lên.
2.  **Nhập số tiền:** Gõ `1000000` (1 triệu đồng).
3.  Bấm **Xác nhận & Tính điểm**.
4.  **Kỳ vọng UI:** 
    *   Toast báo *"Đã hoàn tất đơn & Tính hoa hồng!"*.
    *   Thẻ đơn hàng lập tức **bay sang Cột 3 (Hoàn thành / Hủy)**.
    *   Thẻ chuyển sang màu xám (grayscale) báo hiệu đã đóng.
5.  **Kỳ vọng Database (Logic xử lý ngầm đã chạy thành công):**
    *   **Bảng `reservations`:** Cột `final_total_amount` được ghi 1.000.000đ. Cột `commission_amount` tự động tính 15% (Lấy cấu hình của nhà hàng 1) = **150.000đ**. Trạng thái = `COMPLETE`.
    *   **Bảng `customer_profiles`:** Khách đi 4 người -> 4 x 10 điểm = 40 điểm. Điểm cũ của khách Yến trong SQL là 5000 -> Điểm mới update thành **5040 điểm**.
    *   **Bảng `restaurant_tables`:** Bàn "001" được tự động trả từ `OCCUPIED` về lại `AVAILABLE` (sẵn sàng đón khách mới).
    *   **Bảng `payments`:** Hệ thống tự động sinh 1 dòng Payment (Tiền khách thanh toán thêm) = 1.000.000 - 200.000 (cọc) = 800.000đ. Phương thức: `CASH`.

Nếu mọi thứ trên màn hình diễn ra đúng như kịch bản này, tính năng Kanban của bạn hoạt động **chính xác 100%** và xử lý cực kỳ chặt chẽ!
---
Để test chính xác module **Quản lý Bếp - KOT (`/restaurant/kitchen`)**, bạn tiếp tục sử dụng tài khoản Chủ nhà hàng **Yume Sushi Central**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456`

Kịch bản test này bám sát 100% vào dữ liệu đã được nạp từ file `06-orders-pos-kitchen.sql`. 

---

### BƯỚC 1: KIỂM TRA DỮ LIỆU KHỞI TẠO VÀ REAL-TIME
Ngay khi mở trang Quản lý Bếp, bạn sẽ thấy góc trên bên phải có nút **"LIVE SYNC ON"** với dấu chấm xanh nhấp nháy. Cứ mỗi 10 giây, Frontend sẽ tự động gọi ngầm (polling) API để check món mới.

Kiểm tra số lượng trên thanh Tab (Segmented Control). Hệ thống phải tự động phân loại như sau:
*   **Chờ nấu (2):** Chứa phiếu của Bàn 002 và phiếu Mang đi.
*   **Đang nấu (0)**
*   **Hoàn tất (1):** Chứa phiếu của Bàn 005 (Vì trong SQL, các món của Bàn 005 đều đã ở trạng thái `SERVED`).

**Kiểm tra giao diện 2 Phiếu Bếp (Ticket) đang hiển thị ở Tab "Chờ nấu":**

**1. Phiếu số 1 (KOT-000001):**
*   **Tiêu đề:** `002` (Tên bàn).
*   **Danh sách món:**
    1.  `1x Sashimi Cá Hồi Na Uy` | Ghi chú: *"Xin ít gừng hồng"* | UI: Chữ màu đen bình thường. Hiển thị 2 nút: **Từ chối (X màu đỏ)** và **Nấu (Ngọn lửa màu vàng)** *(Trạng thái PENDING)*.
    2.  `1x Beefsteak Wagyu A5` | Ghi chú: *"Medium Rare"*, *"Ra món nhanh giúp"* | UI: Hiển thị 1 nút duy nhất: **Xong (Dấu Check màu xanh lá nhấp nháy)** *(Trạng thái COOKING)*.
    3.  `2x Trà Sữa Matcha Zen` | UI: Chữ màu xám gạch ngang. Hiển thị icon **Đã hoàn tất** *(Trạng thái READY)*.

**2. Phiếu số 2 (KOT-000003):**
*   **Tiêu đề:** `Mang đi` (Takeaway).
*   **Danh sách món:**
    1.  `1x Trà Sữa Matcha Zen` | Ghi chú: *"Cho nhiều đá"* | UI: Hiển thị nút **Từ chối (X)** và **Nấu (Ngọn lửa)**.

---

### BƯỚC 2: TEST CẬP NHẬT TRẠNG THÁI MÓN (COOKING / READY)
Test quy trình chuẩn của một đầu bếp:

1.  **Nhận nấu:** Nhìn vào thẻ **"Mang đi"**, bấm nút **Ngọn lửa (Màu vàng)** ở món Trà sữa.
    *   *Kỳ vọng UI:* Toast xanh báo "Đã nhận nấu món!". Nút Ngọn lửa biến thành nút **Check màu xanh lá nhấp nháy**. (Nếu bạn chuyển sang tab "Đang nấu", phiếu này sẽ nằm ở đó).
2.  **Báo nấu xong:** Nhìn vào thẻ **Bàn 002**, bấm nút **Check màu xanh (Đang nhấp nháy)** ở món Beefsteak Wagyu.
    *   *Kỳ vọng UI:* Toast báo "Món đã hoàn tất!". Chữ Beefsteak chuyển thành màu xám và bị gạch ngang. Nút bấm biến thành 1 icon tĩnh (Chỉ báo trạng thái READY, chờ nhân viên phục vụ bê đi).

---

### BƯỚC 3: TEST "BÁO HẾT NGUYÊN LIỆU" VÀ TRẠNG THÁI PHIẾU TỔNG
Bếp phát hiện hết cá hồi, cần hủy món và trừ tiền cho khách.
Thao tác trên món **Sashimi Cá Hồi Na Uy** của **Bàn 002**.

1.  Bấm nút **X (Màu đỏ)** bên cạnh món Sashimi.
2.  Hệ thống hiện popup cảnh báo browser: *"Báo hết nguyên liệu món "Sashimi Cá Hồi Na Uy" và trừ tiền khách?"* -> Bấm **OK**.
3.  **Kỳ vọng UI từng món:**
    *   Chữ Sashimi chuyển sang **màu đỏ và bị gạch ngang**.
    *   Nút bấm biến mất, thay bằng nhãn đỏ ghi chữ **"Đã báo hết"**.
4.  **Kỳ vọng UI Phiếu tổng (Kanban Ticket):**
    *   Ngay lúc này, phiếu Bàn 002 có 3 món mang trạng thái: Đã hủy (Rejected), Đã xong (Ready), Đã xong (Ready).
    *   Vì KHÔNG CÒN món nào đang chờ (Pending) hay đang nấu (Cooking), **toàn bộ thẻ Ticket Bàn 002 sẽ tự động chuyển sang màu xám mờ (Grayscale)** và bay sang tab **"Hoàn tất"**. Thể hiện bếp đã xử lý xong hoàn toàn order này!
5.  **Kỳ vọng Database (Nghiệp vụ kế toán chạy ngầm):**
    *   Backend đã tự động mở lại hóa đơn `KOT-000001` của Bàn 002. Trừ đi 185.000đ tiền Sashimi.
    *   Tự động tính toán lại Thuế VAT 8% dựa trên số tiền mới.
    *   *(Bạn có thể vào tính năng POS Thu ngân, nhập mã bàn 002 để kiểm chứng hóa đơn đã tự động giảm tiền, món Sashimi trong bill POS cũng bị gạch bỏ đỏ).*

---

### BƯỚC 4: TEST IN PHIẾU KOT (MÁY IN NHIỆT)
Bấm nút **"In phiếu bếp KOT"** ở dưới cùng của thẻ **Bàn 002**.

*   **Kỳ vọng Modal hiển thị:** 
    *   Popup hiện lên với giao diện tờ giấy in nhiệt (viền giấy hình răng cưa ở viền trên và viền dưới nhờ CSS Radial Gradient).
    *   Chữ đen trắng chuẩn font Monospace. Có tên "BÀN 002", thời gian, và danh sách các món kèm theo ghi chú (VD: `>> Medium Rare`).
    *   Cuối phiếu có một mã vạch giả lập (Barcode).
*   **Thao tác In:** Bấm nút **"In Phiếu Này"** (Màu đen).
    *   *Kỳ vọng:* Trình duyệt bật hộp thoại Print mặc định (Ctrl+P / Cmd+P). 
    *   Nhờ CSS `@media print` đã được cấu hình trong `globals.css`, **tất cả các thành phần rườm rà của web (Sidebar, Nút bấm, Header) đều biến mất**. Trên trang xem trước bản in (Print Preview) **chỉ còn duy nhất tờ Phiếu bếp với kích thước khổ 80mm** (Chuẩn máy in K80 của nhà hàng).
*   






----
Để test module **Thu ngân & POS (`/restaurant/pos`)**, bạn tiếp tục sử dụng tài khoản Chủ nhà hàng **Yume Sushi Central**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456`

*(Lưu ý: Kịch bản này dựa trên dữ liệu gốc của file SQL. Nếu ở bước 6 (Test Bếp) bạn đã bấm Hủy hoặc Bưng món nào đó, trạng thái và giá tiền có thể sẽ thay đổi tương ứng. Kịch bản dưới đây giả định bạn dùng data SQL nguyên bản).*

---

### BƯỚC 1: TÌM HÓA ĐƠN VÀ TEST CẬP NHẬT TRẠNG THÁI (BƯNG MÓN)
1.  **Tìm hóa đơn:** Tại ô tìm kiếm, gõ **`002`** (Hoặc 2) và bấm **Enter** (hoặc nút Tìm Bill).
2.  **Kỳ vọng UI render (Check Data SQL):**
    *   Màn hình bên trái load ra Bill của Bàn 002 (Mã: `KOT-000001`).
    *   Danh sách món gồm 3 món:
        *   **Sashimi Cá Hồi** (Chờ nấu).
        *   **Beefsteak Wagyu** (Đang nấu - Chữ nhấp nháy).
        *   **Trà Sữa Matcha Zen** (Kèm nút màu xanh **"Xác nhận bưng"** - Vì trong SQL món này có status = `READY`).
    *   **Tạm tính:** 1.585.000đ | **Thuế VAT:** 126.800đ | **Cần thanh toán:** 1.711.800đ.
3.  **Test Bưng món:** 
    *   Bấm nút **"Xác nhận bưng"** ở món Trà sữa.
    *   *Kỳ vọng:* Toast xanh báo thành công. Món trà sữa bị gạch ngang, đổi sang nhãn màu xám "Đã lên món". (Lúc này Bếp không còn trách nhiệm với ly trà sữa này nữa).

---

### BƯỚC 2: TEST TÍNH NĂNG PHỤ PHÍ VÀ THUẾ VAT (Toán học Zero-Trust)
Hệ thống Backend được thiết kế để tự động tính lại thuế mỗi khi có sự thay đổi về tiền.
1.  Bấm nút **"+ Phụ phí"** (Màu vàng).
2.  Nhập Lý do: `Phí phòng VIP`. Nhập số tiền: `200000`. Bấm **Lưu Phụ Phí**.
3.  **Kỳ vọng UI & Logic Backend:**
    *   Bill xuất hiện thêm dòng màu cam: `Phí phòng VIP: + 200.000đ`.
    *   *Tính toán lại Thuế (Base = 1.585.000 + 200.000 = 1.785.000đ):* Thuế VAT 8% tự động nhảy thành **142.800đ**.
    *   Màn hình OLED "Cần thanh toán" nhảy lên số mới: **1.927.800đ**.

---

### BƯỚC 3: TEST MÃ VOUCHER (% CHIẾT KHẤU)
Backend quy định cứng 3 mã hợp lệ: `GIAM50K`, `GIAM100K`, `VIP10`. Ta sẽ test mã phần trăm.
1.  Bấm nút **"Mã giảm giá"** (Màu xanh).
2.  Nhập bậy bạ: `CODE_DEU` -> Bấm Áp dụng -> *Kỳ vọng:* Báo lỗi đỏ "Mã Voucher không hợp lệ".
3.  Nhập đúng: `VIP10` (Giảm 10% trên giá gốc + phụ phí). Bấm Áp dụng.
4.  **Kỳ vọng UI & Logic Backend:**
    *   Bill xuất hiện dòng màu đỏ: `Mã giảm giá (VIP10): - 178.500đ`.
    *   Màn hình OLED "Cần thanh toán" nhảy số cuối cùng: **1.749.300đ**.

---

### BƯỚC 4: TEST NGHIỆP VỤ THANH TOÁN (TIỀN MẶT - CHỐNG SAI SÓT)
Hóa đơn Bàn 002 đang chốt ở mức **1.749.300đ**.
1.  Bấm vào ô Numpad (Phím số trên màn hình) nhập: `1000000` (1 Triệu).
    *   *Kỳ vọng:* Chữ góc trái màn hình hiện đỏ **"CHƯA ĐỦ"**. Tiền thừa hiện 0đ.
2.  Bấm nút **Hoàn tất thanh toán** (Màu xám) -> *Kỳ vọng:* Nút bị block, hiện thông báo lỗi "Tiền khách đưa chưa đủ!".
3.  Bấm nút **C** (Clear) để xóa. Bấm phím tắt **500.000đ** bốn lần để màn hình hiện số tiền khách đưa là `2.000.000`.
    *   *Kỳ vọng:* Chữ góc trái màn hình chuyển xanh **"ĐÃ ĐỦ"**.
    *   Tiền thừa tự động tính: **250.700đ** (Màu vàng). Nút Hoàn tất sáng lên màu Cam và nhấp nháy.
4.  Bấm **Hoàn tất thanh toán**.
    *   *Kỳ vọng:* Báo thành công, Reset toàn bộ màn hình POS về 0. Bàn 002 dưới Database đã được xóa bill và chuyển về trạng thái `AVAILABLE`.

---

### BƯỚC 5: TEST THANH TOÁN CHUYỂN KHOẢN (QR) & BILL 0Đ
Chúng ta sẽ mượn data của Bàn 005 để test.
1.  Gõ **`005`** vào ô tìm kiếm.
2.  *Kỳ vọng render (SQL Data)*: Bill 005 có sẵn Phụ phí 50k, Voucher GIAM50K. Tổng thanh toán: **403.600đ**.
3.  **Test Chuyển khoản (QR/Momo):**
    *   Chọn phương thức **Quét QR**.
    *   *Kỳ vọng:* Bàn phím số (Numpad) lập tức bị mờ đi (Disabled) vì khách chuyển khoản thì ngân hàng tự khớp số, thu ngân không cần bấm tiền thừa. Chữ góc màn hình đổi thành **"SẴN SÀNG"**. Nút Hoàn tất sáng lên.
4.  **Test Bill 0đ (Khống chế Voucher chống âm tiền):**
    *   Chọn lại nút **"Mã giảm giá"**.
    *   Trời sinh thu ngân ngáo ngơ, nhập mã: `GIAM500K` (Không tồn tại) -> Backend chửi.
    *   Vậy ta vào tab Sơ đồ bàn (`/restaurant/tables`). Tạo 1 Order mới cho Bàn 003, chỉ gọi 1 ly Trà sữa (55k + 4.4k Thuế = 59.400đ).
    *   Quay lại POS, tìm Bàn **003**. Nhập mã Voucher: `GIAM100K`.
    *   *Kỳ vọng Logic Zero-Trust Backend:* Mặc dù Voucher trị giá 100k, nhưng tổng bill chỉ có 59.4k. Backend tự động **"Capped" (Khống chế)** tiền giảm giá ở mức 59.400đ để tránh việc nhà hàng phải "thối lại tiền mặt" cho khách khi xài voucher.
    *   *Kỳ vọng UI:* Dòng voucher ghi chú *(Không hoàn tiền thừa voucher)*. Cần thanh toán = **0đ**. Bàn phím Numpad tê liệt hoàn toàn. Nút thanh toán đổi chữ thành: **"XÁC NHẬN (HÓA ĐƠN 0Đ)"**. 
    *   Bấm Xác nhận -> Thành công!

---

### BƯỚC 6: KIỂM TRA ĐỒNG BỘ "GIẢI PHÓNG BÀN"
*   Sau khi thanh toán xong Bàn 002, 005 và 003. Bạn hãy chuyển sang Tab **Sơ đồ bàn (`/restaurant/tables`)**.
*   **Kỳ vọng:** Cả 3 bàn này đều đã trở về màu trắng tinh khôi (Trạng thái `AVAILABLE`), không còn hiện dấu chấm than đỏ hay màu cam nữa. Hệ thống đã tự động dọn bàn thành công!
*   

------
Để test chính xác module **Cấu hình Quán (`/restaurant/settings`)**, bạn tiếp tục sử dụng tài khoản Chủ nhà hàng **Yume Sushi Central**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456`

Kịch bản test này sẽ kiểm tra luồng dữ liệu hai chiều: Lưu từ trang Quản lý (Dashboard) và render ra ngoài trang Khách hàng (Public).

---

### BƯỚC 1: KIỂM TRA DỮ LIỆU KHỞI TẠO (SQL INITIAL STATE)
Ngay khi truy cập `/restaurant/settings`, form phải tự động đổ dữ liệu (Data Binding) chính xác từ file SQL `03-restaurants-and-tables.sql` và `02-master-data-and-users.sql`.

*   **Cột trái (Profile Card & Tài khoản):**
    *   Tên nhà hàng: `Yume Sushi Central`.
    *   Hotline: `0281234567`.
    *   Ảnh Logo và Ảnh Bìa: Hiển thị hình ảnh đĩa Sushi (Lấy từ URL Unsplash trong DB).
    *   Mức hoa hồng: **15%** (Màu cam, Read-only - Cột này do Admin set, chủ quán không sửa được).
*   **Tab "Thông tin chung":**
    *   Địa chỉ: `123 Lê Lợi, Quận 1, TP. HCM`.
    *   Giới thiệu: *"Hương vị Nhật Bản đích thực..."*.
    *   Tiện ích: Có 3 nút đang sáng màu xanh lá: **Chỗ đậu ôtô**, **Có phòng VIP**, **Thanh toán thẻ**. (Khớp với bảng `restaurant_amenities`).
*   **Tab "Cấu hình đặt bàn":**
    *   Tiền cọc bắt buộc: `100000` (100.000đ).
    *   Số khách tối đa 1 bàn: `20`.
*   **Tab "Giờ hoạt động":**
    *   Do dưới DB hiện tại đang `NULL`, code Frontend sẽ tự động lấy mảng `defaultHours` (Thứ 2 - Thứ 7 bật sáng, Chủ Nhật bị làm mờ đi).

---

### BƯỚC 2: TEST CẬP NHẬT THÔNG TIN CHUNG (ẢNH & CHỮ)
Thực hiện các thay đổi sau tại Tab **Thông tin chung**:
1.  **Ảnh đại diện & Ảnh bìa:** Bấm vào 2 ô tải ảnh, chọn 2 tấm ảnh bất kỳ từ máy tính của bạn. 
    *   *Kỳ vọng:* Ảnh preview hiện lên ngay lập tức.
2.  **Thông tin Text:**
    *   Sửa tên thành: `Yume Sushi Premium`.
    *   Sửa Mô tả: Thêm dòng chữ *"Khuyến mãi tặng kèm Sake cho khách đặt bàn hôm nay!"*.
3.  **Tiện ích:**
    *   Bấm vào nút **"Có phòng VIP"** -> *Kỳ vọng:* Nút mất màu xanh, chuyển về màu xám (Tắt).
    *   Bấm vào nút **"Khu vực hút thuốc"** -> *Kỳ vọng:* Nút sáng màu xanh lên (Bật).

---

### BƯỚC 3: TEST CẬP NHẬT CẤU HÌNH ĐẶT BÀN & GIỜ MỞ CỬA
4.  Chuyển sang Tab **Cấu hình đặt bàn**:
    *   Sửa ô "Tiền cọc bắt buộc" thành: `0` (Để lát test luồng Bypass VNPay).
    *   Sửa "Số khách tối đa" thành: `50`.
5.  Chuyển sang Tab **Giờ hoạt động**:
    *   Gạt công tắc (Switch) ở dòng **Chủ Nhật**. -> *Kỳ vọng:* Dòng Chủ Nhật sáng lên, ô nhập giờ không còn bị `disabled`.
    *   Sửa giờ mở cửa của Chủ Nhật thành `09:00` đến `23:00`.
6.  **Bấm nút "LƯU THAY ĐỔI" (Góc phải dưới màn hình):**
    *   *Kỳ vọng UI:* Nút bấm xoay icon Loading tròn. 
    *   *Kỳ vọng Logic Backend:* Hệ thống đẩy ảnh lên Cloudinary. Cập nhật các bảng `restaurants`, `restaurant_amenities`. Toast báo *"Đã lưu cấu hình nhà hàng thành công!"*.

---

### BƯỚC 4: KIỂM CHỨNG TRÊN MÀN HÌNH KHÁCH HÀNG (CROSS-MODULE CHECK)
Mở một tab mới trên trình duyệt (hoặc cửa sổ ẩn danh) và truy cập vào Trang chủ Khách hàng (`/`).

1.  **Kiểm tra Thẻ nhà hàng (Restaurant Card):**
    *   Tìm thẻ của quán.
    *   *Kỳ vọng:* Tên đã đổi thành **Yume Sushi Premium**. Ảnh thumbnail của thẻ đã đổi thành ảnh mới vừa upload.
2.  **Kiểm tra Trang Chi tiết (`/restaurants/1`):**
    *   Bấm vào xem chi tiết quán.
    *   *Kỳ vọng:* Ảnh bìa (Cover) to chà bá phía trên đã đổi. Đoạn văn giới thiệu có dòng *"Khuyến mãi tặng kèm Sake..."*.
3.  **Test luồng Đặt bàn 0đ (Bypass Payment):**
    *   Bấm nút **"Đặt bàn ngay"** màu cam ở dưới cùng màn hình.
    *   Thử tăng số người lên 25 -> Vẫn cho phép (Vì lúc nãy đã sửa Max Pax = 50).
    *   Hoàn tất chọn Ngày, Giờ, Số người -> Bấm **Tiếp tục**.
    *   Nhập ghi chú -> Bấm **Xác nhận & Tiếp tục**.
    *   **TẠI BƯỚC 3 (THANH TOÁN CHI TIẾT):**
        *   *Kỳ vọng UI:* Màn hình hiện "Tiền đặt cọc giữ chỗ: **0đ**". Dòng Floating Bottom Bar hiện "Cần thanh toán: **0đ**".
        *   Bấm nút **"Thanh toán qua VNPay"**.
        *   *Kỳ vọng Logic:* Do tiền cọc = 0đ, Backend sẽ KHÔNG sinh ra link VNPay. Frontend (file `CheckoutStep3/page.tsx`) sẽ tự động nhận diện `vnpayRes.paymentUrl` bị rỗng và **nhảy thẳng (Bypass) sang trang Success luôn**!
        *   Khách hàng đặt bàn thành công mà không phải qua cổng VNPay. Đơn hàng sinh ra dưới DB mang trạng thái `PENDING`.

Nếu mọi thứ hoạt động đúng như trên, module Setting của bạn đã **hoạt động hoàn hảo**, đồng bộ dữ liệu Real-time cực kỳ mượt mà từ Admin -> Chủ quán -> Khách hàng!

----

Để test module **Hộp thư thông báo (`/restaurant/notifications`)**, bạn tiếp tục sử dụng tài khoản Chủ nhà hàng **Yume Sushi Central**:
*   **Email:** `owner.yume@gmail.com`
*   **Mật khẩu:** `123456`

Dựa trên file SQL `07-notifications-and-logs.sql`, tài khoản Chủ nhà hàng này (User ID 4) hiện đang có đúng **1 thông báo duy nhất** trong cơ sở dữ liệu. Dưới đây là kịch bản test chi tiết:

---

### BƯỚC 1: KIỂM TRA DỮ LIỆU KHỞI TẠO (SQL INITIAL STATE)
Ngay khi truy cập vào `/restaurant/notifications`, hệ thống phải render chính xác dữ liệu từ Backend.

**1. Khu vực Header & Bộ lọc (Tabs):**
*   Tab "Tất cả": Đang được chọn mặc định.
*   Tab "Chưa đọc": Phải hiển thị con số chính xác là **Chưa đọc (1)**.
*   Nút **"Đánh dấu đã đọc tất cả"** (Có icon CheckCheck màu cam) phải xuất hiện ở góc phải.

**2. Danh sách thông báo:**
Hiển thị 1 thẻ thông báo duy nhất với các thông số sau:
*   **Tiêu đề:** `🔔 Bạn có 1 đơn đặt bàn mới` *(Chữ in đậm màu đen)*.
*   **Nội dung:** *"Khách hàng Nguyễn Hoàng Yến vừa đặt 1 bàn cho 2 người lúc 19:00 hôm nay. Vui lòng xác nhận."*
*   **Màu sắc & Icon (Đúng chuẩn mapping Enum Backend):** 
    *   Icon: **Dấu Check trong hình tròn (CheckCircle)**.
    *   Màu icon: **Xanh Lục (Emerald)** - Vì trong SQL `type = 'ORDER'`.
*   **Trạng thái chưa đọc:** Thẻ có nền màu vàng nhạt (Amber), có một **chấm đỏ (Red dot)** ở góc trên bên phải.

---

### BƯỚC 2: TEST PHÂN LOẠI MÀU SẮC BẰNG TÀI KHOẢN KHÁCH HÀNG (CROSS-CHECK)
Vì tài khoản Chủ quán hiện chỉ có 1 thông báo loại `ORDER`, để test tính năng render icon/màu sắc động cho các loại khác, bạn hãy **Đăng xuất** và **Đăng nhập vào tài khoản Khách hàng (User ID 2)**:
*   **Email:** `yen.nguyen@gmail.com`
*   **Mật khẩu:** `123456`
*   Truy cập vào menu **Hộp thư đến** (`/user/notifications`).

**Kỳ vọng UI của Khách hàng (Khớp 100% với SQL):**
1.  **Thông báo Hệ thống (Chưa đọc):** *"Cập nhật phiên bản Dine-Ease v2.0"* -> Icon chữ **i (Info)** màu **Xanh Dương (Blue)**. Có chấm đỏ.
2.  **Thông báo Giao dịch (Chưa đọc):** *"Đặt bàn thành công tại Yume Sushi"* -> Icon **CheckCircle** màu **Xanh Lục (Emerald)**. Có chấm đỏ.
3.  **Thông báo Khuyến mãi (Đã đọc):** *"Tặng bạn mã giảm giá 50K"* -> Icon **Hộp quà (Gift)** màu **Vàng (Amber)**. Nền trong suốt, chữ xám, KHÔNG có chấm đỏ.
4.  **Thông báo Cảnh báo (Chưa đọc):** *"Đơn đặt bàn đã bị hủy"* -> Icon **Biển báo (AlertTriangle)** màu **Đỏ (Rose)**. Có chấm đỏ.

---

### BƯỚC 3: TEST NGHIỆP VỤ TƯƠNG TÁC (MARK AS READ)
Quay lại tài khoản Chủ quán (`owner.yume@gmail.com`) hoặc cứ dùng tài khoản Khách hàng để test đều được.

**1. Đọc từng thông báo:**
*   Click chuột vào thẻ thông báo *"Bạn có 1 đơn đặt bàn mới"*.
*   *Kỳ vọng UI & Logic:* 
    *   Gọi API `PATCH /my-notifications/{id}/read` ngầm.
    *   Chấm đỏ góc phải biến mất.
    *   Màu nền thẻ chuyển từ vàng nhạt sang trong suốt (Màu trắng).
    *   Chữ tiêu đề từ in đậm (Black) chuyển sang bình thường (Bold) và màu nhạt hơn.
    *   Số lượng trên Tab "Chưa đọc" giảm từ `(1)` xuống `(0)`.
    *   Nút "Đánh dấu đã đọc tất cả" biến mất (Vì không còn gì để đọc).

**2. Test Bộ lọc (Tabs):**
*   Bấm sang Tab **"Chưa đọc (0)"**.
*   *Kỳ vọng:* Danh sách trống rỗng. Màn hình hiện icon Quả chuông to kèm dòng chữ *"Không có thông báo nào!"*.

**3. Test Nút "Đánh dấu đã đọc tất cả":**
*   *(Để test nút này, nếu bạn đã trót bấm đọc hết ở trên, hãy vào lại tài khoản Admin `admin@dineease.com` -> Bắn 1 chiến dịch thông báo mới cho TOÀN BỘ NHÀ HÀNG).*
*   Quay lại trang Hộp thư Chủ quán.
*   Bấm nút **"Đánh dấu đã đọc tất cả"**.
*   *Kỳ vọng:* Mọi chấm đỏ trên màn hình đồng loạt biến mất, số lượng trên Tab "Chưa đọc" lập tức về `0` mà không cần F5 (nhờ cơ chế Invalidate Queries của React Query). Nút "Đánh dấu..." biến mất.

Nếu giao diện đổi màu đúng theo 4 phân loại (System, Order, Promo, Alert) và đếm số lượng Real-time chính xác, module Notifications của bạn đã hoàn thành xuất sắc!