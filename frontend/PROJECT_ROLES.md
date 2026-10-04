# 👥 DINE-EASE: PROJECT ROLES & RESPONSIBILITIES

Tài liệu này định nghĩa rõ vai trò và phạm vi công việc của từng thành viên trong Team 11 (Khoa, Yến, Đoan) trong giai đoạn phát triển Frontend (Next.js). AI Agent **bắt buộc** phải đọc tài liệu này để đưa ra ngữ cảnh (context) code chính xác khi hỗ trợ từng thành viên.

---

## 1. NGUYỄN ANH KHOA (Project Manager / Admin Flow)
**Vai trò:** Nhóm trưởng, Thiết kế kiến trúc tổng thể, Chuyên trách luồng Quản trị viên (Super Admin).

### A. Phạm vi công việc:
- **Core Architecture:** Khởi tạo Next.js, cấu hình Tailwind, React Query Provider, cấu trúc thư mục (app router).
- **Authentication & Security:** 
  - Code trang Đăng nhập (`/login`), Đăng ký (`/register`).
  - Viết Middleware bảo vệ các routes (`/admin`, `/manage`).
  - Quản lý JWT Token (Lưu trữ và gắn vào Axios Interceptors).
- **Admin Dashboard (`/admin/*`):**
  - Layout Sidebar của Admin.
  - Trang Tổng quan (Dashboard Analytics) hiển thị các KPI Cards và Biểu đồ Doanh thu (Sử dụng Recharts).
  - Trang Duyệt Đối Tác (Quản lý Nhà hàng - CRUD).
  - Trang Quản lý Danh mục Ẩm thực (Cuisines).
  - Trang Gửi Thông báo Hệ thống (Notification Campaigns).

### B. Chỉ thị cho Agent khi hỗ trợ Khoa:
- Ưu tiên sử dụng các Component quản lý bảng dữ liệu (Data Tables có phân trang, tìm kiếm) từ Shadcn UI.
- Cung cấp code Middleware tối ưu nhất để tránh giật lag khi check Role.
- Các biểu đồ thống kê phải áp dụng đúng chuẩn thiết kế Glassmorphism và Area Chart có Gradient.

---

## 2. NGUYỄN HOÀNG YẾN (Customer / End-User Flow)
**Vai trò:** Chuyên trách luồng Khách hàng (Tìm kiếm nhà hàng, Đặt bàn, Thanh toán).

### A. Phạm vi công việc:
- **Public Discovery (`/` và `/restaurants/*`):**
  - Trang Chủ hiển thị danh sách nhà hàng nổi bật (Dạng Card lưới).
  - Khung tìm kiếm và bộ lọc (Filter Sidebar).
  - Trang Chi tiết Nhà hàng & Menu món ăn (Hiển thị Rating, Giờ mở cửa, Lưới món ăn).
- **Booking Engine (`/booking/*`):**
  - Flow đặt bàn 3 bước (Chọn Ngày -> Chọn Giờ -> Số Người).
  - Form điền thông tin liên hệ và Ghi chú.
- **Payment Integration (`/payment/*`):**
  - Tích hợp nút thanh toán chuyển hướng sang cổng VNPay (Mock).
  - Trang hiển thị kết quả giao dịch (Thành công/Thất bại) sau khi VNPay return.
- **Customer Profile (`/profile`):**
  - Trang xem Lịch sử Đặt bàn và trạng thái (Pending, Confirmed, Cancelled).
  - Form Đánh giá nhà hàng (Review).

### B. Chỉ thị cho Agent khi hỗ trợ Yến:
- Ưu tiên tính thẩm mỹ, mượt mà (Animations) vì đây là giao diện hướng tới End-User.
- Các Form đặt bàn phải validate chặt chẽ bằng `Zod` (Ngày không được ở quá khứ, Số người > 0).
- Hỗ trợ Yến xử lý việc điều hướng (redirect) sau khi gọi API lấy link thanh toán VNPay.

---

## 3. NGUYỄN THIỆN ĐOAN (Restaurant / Business User Flow)
**Vai trò:** Chuyên trách luồng Quản lý Nhà hàng (Xử lý đơn đặt bàn, Sơ đồ bàn, Thực đơn).

### A. Phạm vi công việc:
- **Restaurant Layout (`/manage/*`):**
  - Layout Sidebar riêng cho Chủ nhà hàng / Lễ tân.
- **Menu Management (`/manage/menu`):**
  - Trang Quản lý Thực đơn (Thêm/Sửa/Xóa món ăn).
  - **Tích hợp Cloudinary:** Xử lý form upload ảnh món ăn (`Multipart/form-data`).
- **Table & Booking Management (`/manage/tables` & `/manage/reservations`):**
  - Giao diện Sơ đồ bàn (Hiển thị các bàn Trống/Đang ăn/Đã đặt bằng màu sắc khác nhau).
  - Bảng danh sách các đơn đặt bàn chờ duyệt.
  - Chức năng Lễ tân bấm "Duyệt đơn" (Approve) và "Đón khách" (Check-in).
  - Cập nhật trạng thái bàn Real-time (Hoặc Refetch bằng React Query).

### B. Chỉ thị cho Agent khi hỗ trợ Đoan:
- Hỗ trợ Đoan viết code xử lý `FormData` chuẩn xác khi Upload file ảnh trong Next.js.
- Giao diện Sơ đồ bàn cần sử dụng CSS Grid linh hoạt để vẽ các khối vuông (Bàn) kèm Status Pills rõ ràng (Màu xanh = Trống, Đỏ = Đang phục vụ).
- Các thao tác Check-in / Approve cần có Modal xác nhận (Confirmation Dialog) để tránh Lễ tân click nhầm.