
# Báo cáo Tuần 6

**Tuần:** 6 (08/04/2026 - 14/04/2026)<br>
**Nhóm:** 11<br>
**Đề tài:** #4 - Hệ Thống Đặt Bàn Nhà Hàng (Dine-Ease)<br>
**Nhóm trưởng:** Nguyễn Anh Khoa - 2251052052

---

## 1. Công việc đã hoàn thành

| Thành viên | MSSV | Công việc | Link Commit/PR |
|------------|------|-----------|----------------|
| **Nguyễn Anh Khoa** | 2251052052 | **(Admin):** Tích hợp thành công thư viện `spring-boot-starter-mail`. Viết `EmailService` với `@Async`. Cập nhật logic duyệt nhà hàng: Tự động cấp quyền `Role.RESTAURANT`, sinh mật khẩu ngẫu nhiên và gửi Email HTML chúc mừng cho chủ quán. | [1bd060f](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/1bd060f) |
| **Nguyễn Thiện Đoan** | 2251052019 | **(Restaurant):** Viết logic quản lý đơn cho nhà hàng. Xây dựng API Duyệt đơn và Check-in. Xử lý `@Transactional` để khi Check-in, đơn chuyển thành `CHECKED_IN` đồng thời bàn chuyển thành `OCCUPIED`. Hỗ trợ team fix lỗi trùng lặp trong `GlobalExceptionHandler`. | [ffe6687](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/ffe6687) |
| **Nguyễn Hoàng Yến** | 2251050084 | **(Customer):** Xây dựng "Booking Engine". Dùng `@Query` tính toán sức chứa còn lại của nhà hàng tại thời điểm đặt để ngăn chặn việc "Kẹt bàn" (Overbooking). Bổ sung logic Khách hàng tự hủy đơn với các chốt chặn bảo mật chặt chẽ. Phối hợp xử lý Git conflict ở `ReservationRepository`. | [1320e41](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/1320e41) |

---

## 2. Tiến độ tổng thể

*(Nhờ hoàn thành xong phần lõi nghiệp vụ khó nhất, tiến độ Backend đã nhảy vọt)*

| Hạng mục | Trạng thái | % |
|----------|------------|---|
| Khởi động (Setup, chọn đề tài) | Hoàn thành | 100% |
| Phân tích yêu cầu | Hoàn thành | 100% |
| Thiết kế kiến trúc | Hoàn thành | 100% |
| Backend API | Đang thực hiện | 85% |
| Frontend UI | Chưa bắt đầu | 0% |
| Docker | Đang thực hiện | 40% |
| Testing | Chưa bắt đầu | 0% |

**Tổng tiến độ:** **75%**

---

## 3. Kế hoạch tuần tới (Tuần 7)

| Thành viên | Công việc dự kiến |
|------------|-------------------|
| **Nguyễn Anh Khoa** | Review toàn bộ source code Backend, rà soát lại Swagger API Docs để chuẩn bị tài liệu cho việc ghép nối Frontend. |
| **Nguyễn Thiện Đoan** | Tích hợp **Cloudinary API** để viết Service cho phép nhà hàng Upload ảnh đại diện, ảnh không gian quán và ảnh món ăn. |
| **Nguyễn Hoàng Yến** | Tích hợp **VNPay / Momo (Sandbox)** để viết API cho phép khách hàng thanh toán tiền cọc. Xử lý Webhook (IPN) để tự động cập nhật trạng thái đơn thành `CONFIRMED` khi thanh toán thành công. |

---

## 4. Khó khăn / Cần hỗ trợ

- [x] **Khó khăn đã giải quyết:** 
  - Đã xảy ra **Git Merge Conflict** nặng ở file `ReservationRepository` do Yến và Đoan cùng viết thêm logic vào. Nhóm đã họp và xử lý merge bằng tay thành công, giữ lại được các hàm `@Query` của cả hai.
  - Sửa thành công lỗi Spring Boot không khởi động do duplicate Exception Handlers (`IllegalStateException`).
- [ ] **Thách thức tuần 7:** Việc xử lý Webhook (IPN) của Momo/VNPay đòi hỏi cấu hình ngrok để mở port localhost ra internet cho đối tác gọi về. Nhóm cần nghiên cứu kỹ tài liệu của cổng thanh toán để mã hóa chữ ký (Signature) cho đúng chuẩn.

---
*Ngày nộp: 14/04/2026* <br>
*Xác nhận của Nhóm trưởng: Nguyễn Anh Khoa*