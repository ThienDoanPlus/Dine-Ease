# Báo cáo Tuần 5

**Tuần:** 5 (01/04/2026 - 07/04/2026)<br>
**Nhóm:** 11<br>
**Đề tài:** #4 - Hệ Thống Đặt Bàn Nhà Hàng (Dine-Ease)<br>
**Nhóm trưởng:** Nguyễn Anh Khoa - 2251052052

---

## 1. Công việc đã hoàn thành

| Thành viên | MSSV | Công việc | Link Commit/PR |
|------------|------|-----------|----------------|
| **Nguyễn Anh Khoa** | 2251052052 | **(PM/Admin):** Hoàn thành Basic CRUD APIs cho phân hệ Admin (Quản lý Nhà hàng & Gửi Thông báo hệ thống). Xử lý hotfix dọn dẹp import và bổ sung các missing methods cho Repository. Cập nhật `init.sql` cho Docker. | [904ac1e](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/904ac1e) |
| **Nguyễn Thiện Đoan** | 2251052019 | **(Restaurant):** Hoàn thành Basic CRUD APIs cho phân hệ Nhà hàng. Đã xây dựng thành công API quản lý thực đơn (Thêm/Sửa/Xóa món ăn) và quản lý sơ đồ bàn. | [66f90bd](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/66f90bd) |
| **Nguyễn Hoàng Yến** | 2251050084 | **(Customer):** Hoàn thành Public Discovery APIs (Hiển thị danh sách quán, xem menu không cần đăng nhập). Xây dựng API tạo đơn đặt bàn cơ bản và xem lịch sử cho Khách hàng. | [eb11f31](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/eb11f31) |

---

## 2. Tiến độ tổng thể

| Hạng mục | Trạng thái | % |
|----------|------------|---|
| Khởi động (Setup, chọn đề tài) | Hoàn thành | 100% |
| Phân tích yêu cầu | Hoàn thành | 100% |
| Thiết kế kiến trúc | Hoàn thành | 100% |
| Backend API | Đang thực hiện | 50% |
| Frontend UI | Chưa bắt đầu | 0% |
| Docker | Đang thực hiện | 40% |
| Testing | Chưa bắt đầu | 0% |

**Tổng tiến độ:** 60%

---

## 3. Kế hoạch tuần tới (Tuần 6)

| Thành viên | Công việc dự kiến |
|------------|-------------------|
| **Nguyễn Anh Khoa** | Xử lý logic nghiệp vụ nâng cao của Admin: Viết APIs Báo cáo thống kê toàn hệ thống (Dashboard, tính tổng doanh thu hoa hồng) và thiết lập cấu hình Commission mặc định. |
| **Nguyễn Thiện Đoan** | Xử lý logic nghiệp vụ cho Nhà hàng: API xác nhận/từ chối đơn đặt bàn từ khách (`ManageReservation`), logic cập nhật trạng thái bàn thời gian thực (Check-in, Dọn dẹp). |
| **Nguyễn Hoàng Yến** | Xử lý logic nghiệp vụ cốt lõi của Khách hàng: Viết thuật toán kiểm tra "Kẹt bàn" (Check Table Availability) kết hợp với sức chứa (`capacity`) trước khi cho phép tạo đơn đặt bàn. |

---

## 4. Khó khăn / Cần hỗ trợ

- [x] **Kỹ thuật:** Trong tuần qua đã phát sinh lỗi Service không gọi được Repository do Spring Data JPA không tự map được quan hệ lồng nhau. Nhóm đã tạo nhánh `hotfix/w5-repo-cleanup` để bổ sung các custom query (`findByOwnerEmail`) và dọn dẹp code rác thành công.
- [ ] **Kế hoạch:** Sang tuần 6, nhóm bắt đầu xử lý logic nghiệp vụ (Business Logic). Khó khăn dự kiến là việc xử lý đồng bộ (Concurrency) khi có 2 khách hàng cùng đặt 1 bàn trống ở cùng 1 khung giờ. Nhóm sẽ nghiên cứu thêm về Database Locking để xử lý vấn đề này.