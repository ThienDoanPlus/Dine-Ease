Để test chính xác module **Xác thực & Tài khoản (Auth & Profile)**, tôi sẽ hướng dẫn bạn sử dụng các dữ liệu đã được nạp sẵn từ file SQL `02-master-data-and-users.sql`.

Dưới đây là kịch bản test chi tiết từng bước và kết quả UI/Logic kỳ vọng:

---

### BƯỚC 1: TEST ĐĂNG KÝ TÀI KHOẢN (`/register`)
Truy cập vào trang Đăng ký (Đảm bảo bạn đang chưa đăng nhập).

**1. Test Validation & Upload Ảnh:**
*   **Thao tác 1 (Bắt lỗi UI):** Điền đủ Tên, SĐT, Email, Pass (trên 8 ký tự), Tick đồng ý điều khoản. **Cố tình không chọn ảnh đại diện.**
    *   *Kỳ vọng UI:* Nút "Tạo tài khoản ngay" vẫn bị mờ (Disabled). Bên dưới khung tròn có dòng cảnh báo "Ảnh đại diện là bắt buộc".
*   **Thao tác 2 (Bắt lỗi Database):** Điền đủ thông tin, tải 1 tấm ảnh lên, nhưng nhập Email là `yen.nguyen@gmail.com` (Email đã tồn tại trong SQL). Bấm Đăng ký.
    *   *Kỳ vọng UI/Logic:* Đợi 1 giây, hệ thống văng Toast đỏ: *"Đăng ký thất bại. Tài khoản Email này đã được sử dụng"* (Từ Exception của Spring Boot ném ra).
*   **Thao tác 3 (Luồng thành công):** Đổi sang Email mới (VD: `khachhang123@gmail.com`), điền pass `12345678`.
    *   *Kỳ vọng UI:* 
        * Toast hiện *"Đang tải ảnh lên..."* (Đợi Cloudinary trả URL về).
        * Toast nhảy sang *"Đang tạo tài khoản..."*.
        * Cuối cùng báo *"Đăng ký thành công! Mời bạn đăng nhập"* và tự động điều hướng sang trang `/login`.

---

### BƯỚC 2: TEST ĐĂNG NHẬP (`/login`)
Trong DB SQL, tất cả User đều có mật khẩu gốc là `123456` (đã được hash bcrypt). Ta sẽ test bằng tài khoản VVIP:
*   **Email:** `yen.nguyen@gmail.com`
*   **Mật khẩu:** `123456`

**1. Test Đăng nhập sai:**
*   Nhập pass `sai_pass_roi`.
*   *Kỳ vọng UI:* Nút bấm xoay loading, sau đó Toast đỏ báo *"Email hoặc mật khẩu không chính xác."* (Bắt lỗi 401 Unauthorized từ Backend).

**2. Test Đăng nhập thành công:**
*   Nhập đúng thông tin `yen.nguyen@gmail.com` / `123456`.
*   *Kỳ vọng UI:* Toast xanh *"Chào mừng trở lại, Nguyễn Hoàng Yến!"*. Hệ thống tự động đẩy về Trang chủ Khách hàng (`/`).
*   *Kỳ vọng Header:* Ở góc trên bên phải trang chủ, nút "Đăng nhập/Đăng ký" biến mất. Thay vào đó là Avatar của chị Yến, tên **"Nguyễn Hoàng Yến"** và thẻ chữ màu cam **"THÀNH VIÊN"**.

---

### BƯỚC 3: TEST QUẢN LÝ HỒ SƠ & BẢO MẬT (`/user/profile`)
Truy cập vào Menu tài khoản bằng cách bấm vào Avatar trên Header -> Chọn "Tài khoản của tôi" (hoặc truy cập thẳng `/user/profile`).

**1. Test Trải nghiệm UI (Skeleton Loading):**
*   **Thao tác:** Bấm F5 tải lại trang.
*   *Kỳ vọng UI:* Màn hình sẽ xuất hiện các khối xám nhấp nháy (Skeleton) chạy dọc từ Avatar, Sidebar đến các ô Input. Đặc biệt: **Giao diện không được bị giật cục (Layout Shift)** do bạn đã xử lý Skeleton bọc kích thước cố định bằng Tailwind. Sau khoảng 0.5s, data thật hiện ra.

**2. Test Dữ liệu SQL (Điểm Loyalty & Cấp bậc):**
*   *Kiểm tra thanh Sidebar bên trái:* 
    *   Trong file SQL, Customer Profile của `yen.nguyen@gmail.com` được set `loyalty_points = 5000`. 
    *   Với thuật toán `UserMapper.java` ở Backend (>=2000 là VVIP), UI ở thanh Sidebar phải render chính xác chữ: **VVIP MEMBER** (Badge màu Tím) và **5,000 điểm tích lũy**.
*   *Kiểm tra thông tin Form:*
    *   Họ tên: `Nguyễn Hoàng Yến`
    *   Số điện thoại: `0901111111`
    *   Email: `yen.nguyen@gmail.com` (Đang bị mờ - Disabled).

**3. Test Chỉnh sửa:**
*   Sửa Họ và tên thành `Nguyễn Hoàng Yến (VVIP)`. Sửa SĐT thành `0911222333`. Bấm **Lưu thay đổi**.
*   *Kỳ vọng UI:* Toast báo *"Cập nhật thông tin thành công!"*. Tên trên Sidebar và Header lập tức thay đổi thành tên mới mà **không cần F5** (Nhờ AuthContext & React Query Invalidate).

**4. Test Bảo mật - Chống Hacker sửa Email (Mass Assignment):**
*   **Thao tác:** 
    1. Chuột phải vào ô nhập Email -> Chọn **Inspect** (Kiểm tra phần tử / F12).
    2. Trong bảng mã HTML, tìm chữ `disabled` ở thẻ `<input type="email" disabled ...>` và **Xóa chữ `disabled` đi**.
    3. Lúc này ô Email trên màn hình đã có thể gõ chữ được. Bạn xóa chữ cũ và gõ thành `hacker@gmail.com`.
    4. Bấm nút **Lưu thay đổi**.
*   *Kỳ vọng UI & Logic:* 
    *   Màn hình vẫn báo *"Cập nhật thông tin thành công!"* (Không sập ứng dụng).
    *   **NHƯNG**, hãy bấm F5 tải lại trang. Ô Email vẫn phải hiển thị là `yen.nguyen@gmail.com`!
    *   *Giải thích:* Ở file `ProfilePage.tsx`, dòng code `const { email, ...safePayload } = formData;` đã tự động bóc tách và vứt bỏ trường Email trước khi gửi xuống Backend. Kẻ gian dù có can thiệp giao diện HTML thì vẫn **không thể đổi được Email cốt lõi của tài khoản**.

---
Để test chi tiết module **Khám phá & Tìm kiếm (Public - Trang chủ và `/search`)**, bạn **KHÔNG CẦN ĐĂNG NHẬP**. Đây là khu vực Public dành cho khách vãng lai.

Dữ liệu sẽ được render từ bảng `restaurants`, `cuisines`, `amenities`, và `menu_items` trong các file SQL (`02`, `03`, `04`). Dưới đây là kịch bản test:

---

### BƯỚC 1: KIỂM TRA TRANG CHỦ (`/`) & LỌC DANH MỤC
Vừa mở trang chủ, hãy lăn chuột xuống phần **"Gợi ý hàng đầu"**.

1.  **Dữ liệu Initial Render (Mặc định):**
    *   Hệ thống sẽ hiển thị lưới chứa **2 nhà hàng** (Vì trong file SQL chỉ có 2 nhà hàng trạng thái `ACTIVE` và `PENDING`. Nhà hàng số 3 đang `INACTIVE` nên bị ẩn đi hoàn toàn).
    *   Thẻ 1: **Yume Sushi Central** | Món Nhật | Quận 1 | Rating: **4.8** sao | Giá: **~500k** | Có tag **"Yêu thích nhất"** (Góc phải trên ảnh).
    *   Thẻ 2: **Mamma Mia Pasta** | Đồ Âu | Quận 2 | Rating: **0** sao | Giá: **~350k** | Không có tag.
2.  **Test Thanh Slider Danh mục (Cuisines):**
    *   Lăn lên khu vực "Chọn sở thích của bạn". Sẽ thấy các nút: *Món Việt, Món Nhật, Đồ Âu, Hải Sản...*
    *   Bấm vào Icon **"Đồ Âu (🍕)"**.
    *   *Kỳ vọng UI:* Vòng tròn Đồ Âu to lên (màu cam). Khu vực "Gợi ý hàng đầu" bên dưới xoay loading và **CHỈ HIỂN THỊ 1 quán duy nhất là Mamma Mia Pasta**.
    *   Bấm vào Icon **"Tất cả (✨)"** ở đầu tiên.
    *   *Kỳ vọng UI:* Hiển thị lại đủ 2 quán.
3.  **Test Nút "Xem tất cả":**
    *   Bấm nút "Xem tất cả" màu cam.
    *   *Kỳ vọng UI:* Nút đổi thành "Thu gọn". (Phân trang sẽ không hiện vì bạn chỉ có 2 quán, chưa vượt quá limit pageSize = 6).
4.  **Test Search Banner:**
    *   Kéo lên trên cùng, gõ chữ `"Lê Lợi"` vào thanh tìm kiếm to đùng.
    *   Bấm nút **"Tìm kiếm"** (hoặc Enter).
    *   *Kỳ vọng:* Trình duyệt tự động chuyển hướng sang trang `/search?q=Lê%20Lợi`.

---

### BƯỚC 2: TEST TRANG TÌM KIẾM CHI TIẾT (`/search`)
Lúc này bạn đang ở trang `/search` với từ khóa "Lê Lợi".

1.  **Kiểm tra Search:**
    *   *Kỳ vọng UI:* Tiêu đề hiển thị *"Kết quả tìm kiếm"*, bên dưới có dòng nhỏ *"Từ khóa: Lê Lợi"*. Số lượng tìm thấy: **1 nhà hàng**. Bảng bên phải hiển thị đúng quán **Yume Sushi Central**.
    *   Bấm nút **"Xóa bộ lọc"** ở Sidebar bên trái. Cả 2 quán hiện ra lại bình thường.
2.  **Test Lọc theo Đánh giá (Rating):**
    *   Ở khung Đánh giá tối thiểu, bấm phím `+` cho đến khi màn hình hiện **4.5**.
    *   Bấm nút **"Lọc"** màu cam dưới cùng.
    *   *Kỳ vọng UI:* Chỉ còn quán Yume Sushi (4.8 sao). Quán Mamma Mia (0 sao) đã bị ẩn. Bấm "Xóa bộ lọc".
3.  **Test Lọc theo Giá (Price) & Case Khống chế:**
    *   Thanh trượt giá mặc định đang ở mức Kịch kim (Cuối cùng bên phải).
    *   *Kỳ vọng UI:* Chữ màu cam phía trên thanh trượt hiển thị **"5 Triệu+"**. (Code đã chặn `undefined` để không khóa mức trần).
    *   **Kéo lùi lại** cho đến khi thanh trượt hiện chữ **400k**. Bấm "Lọc".
    *   *Kỳ vọng UI:* Chỉ hiển thị quán **Mamma Mia Pasta** (Giá trung bình 350k). Quán Yume Sushi (500k) đã biến mất vì lớn hơn mức 400k cho phép. Bấm "Xóa bộ lọc".
4.  **Test Lọc Tổ hợp Đa điều kiện (Tiện ích + Ẩm thực):**
    *   Tick vào "Món Nhật" (Cuisine).
    *   Tick vào "Chỗ đậu ôtô" và "Có phòng VIP" (Amenities).
    *   Bấm **"Lọc"**.
    *   *Kỳ vọng UI:* Quán Yume Sushi hiện ra bình thường (Vì trong SQL quán này đáp ứng đủ cả 3 điều kiện trên).
5.  **Test Empty State (Trạng thái rỗng do lọc quá gắt):**
    *   Giữ nguyên các tick ở trên, nhưng tick THÊM vào ô **"Khu vui chơi trẻ em"**.
    *   Bấm **"Lọc"**.
    *   *Kỳ vọng UI:* Biến mất toàn bộ thẻ. Khu vực giữa màn hình hiện một khối to màu xám với Icon Search bị gạch chéo `SearchX` kèm chữ *"Không tìm thấy nhà hàng nào"*.
    *   Bấm nút **"Xóa tất cả bộ lọc"** (Màu đen) bên trong khối báo lỗi.
    *   *Kỳ vọng UI:* Mọi ô tick bị gỡ, Rating về 0, Giá về "5 Triệu+". 2 nhà hàng hiện ra lại bình thường!
*   
---
Để test module **Xem Chi tiết Nhà hàng & Menu (`/restaurants/[id]`)**, bạn hãy đóng vai là Khách hàng (Không cần đăng nhập). 

Tại trang chủ (`/`) hoặc trang tìm kiếm (`/search`), hãy click trực tiếp vào thẻ của nhà hàng **Yume Sushi Central**. Giao diện sẽ chuyển sang `/restaurants/1`.

---

### BƯỚC 1: KIỂM TRA TAB TỔNG QUAN (OVERVIEW)
Ngay khi vừa vào trang, Tab "Tổng quan" sẽ được chọn mặc định.

**1. Header nhà hàng (Nửa trên cùng):**
*   **Tên:** `Yume Sushi Central` *(Chữ to, in đậm)*.
*   **Địa chỉ:** `123 Lê Lợi, Quận 1, TP. HCM` *(Icon MapPin màu cam)*.
*   **Số điện thoại:** `0281234567`.
*   **Điểm đánh giá:** `4.8` *(Icon Ngôi sao màu cam)*.

**2. Nội dung Tab Tổng quan (Nửa dưới):**
*   **Lưới hình ảnh (Gallery):**
    *   Ô to nhất bên trái sẽ render hình đĩa Sushi (Được cấu hình trong cột `image_main` của DB).
    *   3 ô nhỏ bên phải hiện đang dùng ảnh Mock (Vì Frontend dùng mockup cho thư viện Gallery mở rộng).
*   **Giới thiệu (Về Yume Sushi Central):**
    *   Sẽ hiển thị chính xác đoạn text: *"Hương vị Nhật Bản đích thực giữa lòng Sài Gòn. Chuyên Sushi và Sashimi tươi sống mỗi ngày."*

---

### BƯỚC 2: KIỂM TRA TAB THỰC ĐƠN (MENU)
Click sang Tab **"Thực đơn"** (Giữa màn hình).

**1. Thanh Danh mục (Sticky Category Nav):**
*   Bạn sẽ thấy một thanh cuộn ngang chứa 3 nút: **Sushi & Sashimi** (Màu cam, đang chọn), **Món Chính**, **Đồ Uống**.
*   *Test UX:* Hãy lăn chuột (cuộn trang) xuống dưới. Thanh menu này phải **dính (sticky) ở sát cạnh trên màn hình** (ngay dưới Header) để khách luôn bấm được mà không phải cuộn lên.

**2. Danh sách Món ăn (Render theo SQL `04-menus-and-options.sql`):**
Hệ thống phải nhóm các món ăn thành 3 khu vực rõ rệt:

*   **Khu vực "SUSHI & SASHIMI":**
    *   Thẻ món: `Sashimi Cá Hồi Na Uy`
    *   Mô tả: *"5 miếng cá hồi sống."*
    *   Giá: **185.000đ**
    *   *Kỳ vọng:* Góc trái trên ảnh CÓ một cục badge nhỏ màu cam ghi chữ **"Bestseller"** *(Vì is_bestseller = 1)*.
*   **Khu vực "MÓN CHÍNH":**
    *   Thẻ món: `Beefsteak Wagyu A5`
    *   Giá: **1.250.000đ**
    *   *Kỳ vọng:* CÓ badge **"Bestseller"**.
    *   *(Đặc biệt: Món `Cua Hoàng Đế` 3.500.000đ sẽ **KHÔNG HIỂN THỊ** ở màn hình Khách hàng này. Vì trong SQL món này đã bị đưa về trạng thái `SOLD_OUT`)*.
*   **Khu vực "ĐỒ UỐNG":**
    *   Thẻ món: `Trà Sữa Matcha Zen`
    *   Giá: **55.000đ**
    *   *Kỳ vọng:* KHÔNG CÓ badge Bestseller.

---

### BƯỚC 3: KIỂM TRA TAB ĐÁNH GIÁ (REVIEWS)
Click sang Tab **"Đánh giá"** ở cuối cùng. Dữ liệu này được load từ file `05-reservations-and-reviews.sql`.

*   **Tiêu đề:** `Đánh giá từ khách hàng (1)`.
*   **Thẻ Review 1:**
    *   Khách hàng: **Nguyễn Hoàng Yến** *(Kèm thời gian post)*.
    *   Số sao: **5** *(Hiển thị con số 5 kèm 5 ngôi sao vàng lấp lánh)*.
    *   Nội dung: *"Sashimi ở đây cực kỳ tươi ngon, không gian sang trọng..."*.
*   **Khu vực "Phản hồi từ nhà hàng":**
    *   Ngay bên dưới comment của khách Yến, phải xuất hiện một khung màu Xanh Lục (Emerald) bo góc.
    *   Có chữ in hoa: **PHẢN HỒI TỪ NHÀ HÀNG**.
    *   Nội dung phản hồi: *"Dạ Yume Sushi cảm ơn đánh giá vô cùng tuyệt vời của chị Yến ạ..."* (Lấy từ cột `reply_from_restaurant`).

---
Đây là luồng xương sống quan trọng nhất của hệ thống (liên kết Khách hàng - Đơn hàng - Thanh toán VNPay). 

Để test kịch bản này, bạn bắt buộc phải **ĐĂNG NHẬP bằng tài khoản Khách hàng**:
*   **Email:** `yen.nguyen@gmail.com`
*   **Mật khẩu:** `123456`

Sau khi đăng nhập, hãy truy cập vào trang chi tiết của **Yume Sushi Central** (`/restaurants/1`) và cuộn xuống dưới cùng, bấm nút **"Đặt bàn ngay"**.

---

### BƯỚC 1: TEST MODAL CHỌN LỊCH TRÌNH (STEP 0 - 1 - 2)
Modal Đặt bàn (Popup) sẽ hiện lên từ dưới lên.

**1. Tab "Ngày":**
*   *Test Disable ngày quá khứ:* Các ngày trước ngày hôm nay sẽ bị làm mờ (màu xám nhạt `text-stone-200`) và chuột biến thành hình dấu gạch chéo (`cursor-not-allowed`). Không thể bấm vào được.
*   *Thao tác:* Bấm chọn **Ngày mai** (Hoặc 1 ngày bất kỳ trong tương lai).

**2. Tab "Số người":**
*   *Thao tác:* Bấm dấu `+` ở mục Người lớn lên **4**, Trẻ em lên **1**. (Tổng: 5 khách).

**3. Tab "Thời gian" & Thuật toán chặn giờ (Time Buffer):**
*   *Test thuật toán giờ hôm nay:* Quay lại Tab "Ngày" và chọn **Hôm nay**. Chuyển sang Tab "Thời gian". Các khung giờ đã trôi qua (Tính từ giờ hiện tại + thêm 30 phút chuẩn bị) sẽ bị **gạch ngang, bôi xám và không bấm được**. 
*   *Thao tác:* Quay lại Tab "Ngày", chọn lại **Ngày mai**. Trở lại Tab "Thời gian", lúc này mọi khung giờ đều bấm được. Chọn **19:00**.
*   *Xác nhận:* Bấm nút **"Hoàn tất"** (Màu cam). Modal sẽ đóng lại và trình duyệt chuyển hướng sang trang Checkout.

---

### BƯỚC 2: TEST THÔNG TIN KHÁCH HÀNG (CHECKOUT STEP 2)
Trình duyệt đang ở URL: `/user/checkout/new/step2`. Dữ liệu bạn vừa chọn đã được lưu ẩn an toàn trong Zustand Store.

**1. Thẻ Tóm tắt (Cột bên trái):**
*   *Kỳ vọng:* Hiển thị chính xác **19:00**, **[Ngày mai]**, và **05 Khách**.

**2. Form Thông tin (Cột bên phải - Data Binding từ SQL):**
*   *Kỳ vọng Data:* Hệ thống tự động trích xuất thông tin của tài khoản `yen.nguyen` đổ vào form.
    *   Tên khách hàng: **Nguyễn Hoàng Yến**
    *   Số điện thoại: **0901111111**
    *   Email: **yen.nguyen@gmail.com**
*   *Kỳ vọng UX:* Cả 3 ô này đều bị làm mờ (`disabled`) để chống giả mạo thông tin người đặt.
*   *Thao tác:* Gõ vào ô Ghi chú: *"Mình cần góc tối, lãng mạn"*.
*   Bấm **"Xác nhận & Tiếp tục"**. Nhảy sang Step 3.

---

### BƯỚC 3: TEST THANH TOÁN VNPAY & LUỒNG BYPASS (CHECKOUT STEP 3)

#### KỊCH BẢN A: CỌC CÓ PHÍ (CHẠY VNPAY)
Trình duyệt đang ở `/user/checkout/new/step3`.
1.  **Kiểm tra giao diện:**
    *   Tiền đặt cọc giữ chỗ: **100.000đ** *(Con số này được load từ cột `deposit_amount` của nhà hàng Yume Sushi trong file SQL `03`)*.
    *   Thẻ Quốc tế bị mờ (Disabled). VNPay đang được tick mặc định.
2.  **Kích hoạt Thanh toán:**
    *   Bấm nút **"Thanh toán qua VNPay"** dưới đáy màn hình.
    *   *Kỳ vọng Logic Backend:* Hệ thống ngầm tạo 1 đơn PENDING trong DB -> Gọi API VNPay sinh link -> Trả link về Frontend.
    *   *Kỳ vọng UI:* Bạn sẽ bị đá văng khỏi Web và **chuyển hướng sang Cổng thanh toán Sandbox của VNPay**.
    *   *(Giả lập thanh toán)*: Tại cổng VNPay, chọn Ứng dụng thanh toán (NCB), nhập Số thẻ test (`9704198526191432198`), Tên (`NGUYEN VAN A`), Ngày phát hành (`07/15`), OTP (`123456`). Bấm Thanh toán.
    *   Sau khi thanh toán, VNPay sẽ tự đá bạn về URL Return của Frontend: `/user/checkout/[ID_THẬT]/success`. Đơn hàng trên DB chuyển thành `CONFIRMED`.

#### KỊCH BẢN B: CỌC 0Đ (BYPASS VNPAY THÔNG MINH)
Để test luồng này, bạn hãy đóng vai chủ quán (`owner.yume`), vào màn hình `Cấu hình quán` -> Đổi "Tiền cọc bắt buộc" thành **0đ** rồi Lưu lại. Sau đó quay lại tài khoản khách Hàng (Yến) lặp lại việc đặt bàn.

1.  Tại màn hình Step 3:
    *   Tiền đặt cọc hiển thị: **0đ**. Nút bấm báo "Cần thanh toán: **0đ**".
2.  **Kích hoạt Thanh toán (Bypass):**
    *   Bấm nút **"Thanh toán qua VNPay"**.
    *   *Kỳ vọng Logic Backend:* Backend phát hiện cọc 0đ, lưu đơn PENDING nhưng **KHÔNG sinh link VNPay** (Trả về `paymentUrl: null`).
    *   *Kỳ vọng UI:* Frontend bắt được `null`, lập tức bỏ qua cổng VNPay và **NHẢY THẲNG VÀO TRANG SUCCESS**. Khách hàng không hề biết mình vừa Bypass!

---

### BƯỚC 4: TEST MÀN HÌNH SUCCESS VÀ BẢO MẬT STATE
Bạn đang ở trang Success (VD: `/user/checkout/6/success`).

1.  **Kiểm tra UI:**
    *   Icon Dấu Check xanh lá có Animation `success-pulse` (tỏa sóng âm).
    *   Mã đơn hàng: **#6** (Hoặc ID tự sinh).
    *   Khối thông tin: **Yume Sushi Central** | **19:00 • [Ngày mai]** | **5 Khách**.
2.  **Test Dọn rác Zustand (Rất quan trọng):**
    *   Ngay khi trang Success hiện ra, hàm `useEffect` đếm ngược 5 giây bắt đầu chạy ngầm để xóa giỏ hàng trong Zustand.
    *   **Thao tác:** Đợi đúng 5 giây. Sau đó bấm **nút Back (Quay lại)** trên Trình duyệt để cố tình quay lại Step 3.
    *   *Kỳ vọng UI:* Khi quay lại Step 3, các thông số Tiền cọc, Tên quán, Giờ giấc sẽ **trắng bóc hoặc báo 0đ** (Vì data đã bị clear sạch để tránh khách F5 thanh toán đúp).

Kịch bản trên đã bao phủ 100% các case khó nhất: *Chặn giờ quá khứ, Bảo mật thông tin Form, Đẩy cổng VNPay, Bypass 0đ, và Dọn dẹp State.* Mọi thứ đã sẵn sàng để bạn nghiệm thu!
---
Để test chính xác module **Quản lý Đơn đặt bàn (`/user/bookings`)**, bạn cần đảm bảo đang đăng nhập bằng tài khoản Khách hàng (VVIP):
*   **Email:** `yen.nguyen@gmail.com`
*   **Mật khẩu:** `123456`

Kịch bản test này được xây dựng dựa trên dữ liệu chuẩn từ file `05-reservations-and-reviews.sql`. Khách hàng này đang có đúng **5 đơn hàng** đại diện cho mọi trạng thái.

---

### BƯỚC 1: KIỂM TRA RENDER DANH SÁCH & PHÂN TRANG (TABS)
Truy cập vào menu **"Lịch sử đặt bàn"** (hoặc URL `/user/bookings`). Màn hình sẽ chia làm 3 Tab.

**1. Kiểm tra Tab "Sắp tới" (Mặc định):**
Hệ thống phải hiển thị **2 thẻ**:
*   Thẻ 1: Đặt lúc **19:00**, 2 Khách. Có Badge màu cam **"Chờ xác nhận"** (Chấm cam nhấp nháy). Có nút **"Hủy đặt bàn"** viền đỏ. (Trạng thái `PENDING`).
*   Thẻ 2: Đặt lúc **20:30**, 4 Khách. Có Badge màu xanh dương **"Đã xác nhận"**. Có nút **"Hủy đặt bàn"**. (Trạng thái `CONFIRMED`).

**2. Kiểm tra Tab "Đã hoàn thành":**
Bấm sang tab này, hệ thống phải hiển thị **2 thẻ**:
*   Thẻ 1: Đặt lúc **19:30**, 3 Khách. Có nút màu cam **"Đánh giá dịch vụ"** (Vì đơn này trong SQL chưa có dữ liệu ở bảng `reviews`).
*   Thẻ 2: Đặt lúc **18:30**, 2 Khách. Nút bấm biến thành **"Đã đánh giá"** (Nền xám nhạt, chữ xanh lá, không thể bấm được nữa). Vì đơn này đã được review 5 sao trong SQL.

**3. Kiểm tra Tab "Đã hủy":**
Bấm sang tab này, hệ thống phải hiển thị **1 thẻ**:
*   Thẻ 1: Đặt lúc **18:00**, 2 Khách. 
*   *Kỳ vọng UI:* Thẻ bị làm mờ (grayscale), chữ bị gạch ngang. Dưới cùng hiển thị dòng chữ màu đỏ: *"Lý do hủy: Trời mưa quá lớn, nhà mình bận việc..."*. Không có nút thao tác nào.

---

### BƯỚC 2: TEST NGHIỆP VỤ HỦY BÀN
Quay lại Tab **"Sắp tới"**. Ta sẽ thao tác trên đơn **19:00 (Chờ xác nhận)**.

1.  **Test Bắt lỗi (Validation):**
    *   Bấm nút **"Hủy đặt bàn"**. Modal Hủy hiện lên.
    *   Để trống ô nhập lý do. Bấm nút đỏ **"Xác nhận Hủy"**.
    *   *Kỳ vọng:* Hệ thống chặn lại, ném Toast đỏ *"Vui lòng nhập lý do hủy!"*.
2.  **Test Hủy thành công:**
    *   Nhập lý do: *"Xe mình bị hỏng giữa đường, xin lỗi quán"*.
    *   Bấm **"Xác nhận Hủy"**.
    *   *Kỳ vọng UI & Logic:* 
        *   Nút bấm hiện *"Đang xử lý..."*. Sau đó Toast xanh báo thành công. Modal tự động đóng.
        *   **Điểm nhấn UX:** Màn hình tự động nhảy cái vèo từ Tab "Sắp tới" sang Tab **"Đã hủy"**.
        *   Tại Tab "Đã hủy", thẻ đơn hàng 19:00 vừa nãy xuất hiện. Thẻ chuyển sang màu xám mờ, chữ gạch ngang và in đúng dòng lý do hỏng xe bạn vừa nhập. 
        *   *(Dữ liệu dưới Database bảng `reservations` đã chuyển status thành `CANCELLED`)*.

---

### BƯỚC 3: TEST NGHIỆP VỤ ĐÁNH GIÁ (REVIEW)
Chuyển sang Tab **"Đã hoàn thành"**. Ta thao tác trên đơn **19:30** (Đơn duy nhất còn nút Đánh giá).

1.  **Test Bắt lỗi:**
    *   Bấm nút **"Đánh giá dịch vụ"**. Modal Đánh giá hiện lên.
    *   Chỉ chọn số sao (VD: 4 sao), nhưng **để trống ô text bình luận**.
    *   Bấm **"Gửi đánh giá"**.
    *   *Kỳ vọng:* Hệ thống ném Toast đỏ *"Vui lòng nhập trải nghiệm của bạn!"*.
2.  **Test Gửi đánh giá thành công:**
    *   Nhấp chuột chọn **4 sao**.
    *   Nhập bình luận: *"Đồ ăn rất ngon, nhưng chờ lên món hơi lâu một chút xíu"*.
    *   Bấm **"Gửi đánh giá"**.
    *   *Kỳ vọng UI & Logic:*
        *   Nút bấm xoay *"Đang gửi..."*. Toast xanh báo *"Cảm ơn bạn đã gửi đánh giá!"*. Modal tự động đóng.
        *   **Điểm nhấn UX:** Ngay lập tức (không cần F5), nút "Đánh giá dịch vụ" màu cam trên thẻ vừa nãy **biến hình** thành nút **"Đã đánh giá"** (Icon dấu Check màu xanh lá, mờ đi và bị block click).
3.  **Kiểm chứng chéo (Cross-check Database & Public View):**
    *   Dưới Backend, hàm `getAverageRatingByRestaurantId` đã được kích hoạt ngầm để cộng dồn 4 sao vừa rồi và chia trung bình lại cho nhà hàng Yume Sushi.
    *   Hãy ra Trang chủ (`/`), tìm thẻ của Yume Sushi. Điểm `4.8` sao ban đầu có thể đã bị hạ xuống `4.4` hoặc `4.5` (Do bị kéo xuống bởi đánh giá 4 sao của bạn).
    *   Bấm vào xem chi tiết quán -> Tab **"Đánh giá"**: Bình luận *"Đồ ăn rất ngon..."* của bạn đã chễm chệ nằm ở trên cùng danh sách!

Nếu cả 3 luồng (View Tabs, Cancel, Review) hoạt động trơn tru như kịch bản, module dành cho Khách hàng này của bạn đã **hoàn toàn sạch lỗi (bug-free)**!
---