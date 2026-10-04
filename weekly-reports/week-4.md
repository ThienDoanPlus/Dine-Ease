# Báo cáo Tuần 4

**Tuần:** 4 (25/03/2026 - 31/03/2026)<br>
**Nhóm:** 11<br>
**Đề tài:** #4 - Hệ Thống Đặt Bàn Nhà Hàng (Dine-Ease)<br>
**Nhóm trưởng:** Nguyễn Anh Khoa - 2251052052

---

## 1. Công việc đã hoàn thành

| Thành viên | MSSV | Công việc | Link Commit/PR |
|------------|------|-----------|----------------|
| **Nguyễn Anh Khoa** | 2251052052 | **(PM/Admin):** Khởi tạo Project (Java 25, Boot 4). Thiết lập Security JWT, Global Exception. Hoàn thành trọn bộ CRUD Cuisine cho Admin (Entity, Repo, Service, Controller). | [fec23d4](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/fec23d4) |
| **Nguyễn Thiện Đoan** | 2251052019 | **(Restaurant):** Xây dựng Entities và Repositories cho phân hệ Nhà hàng (Restaurant, Menu, Table). Setup file `docker-compose.yml` để chạy container MySQL. | [43b51ff](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/43b51ff) |
| **Nguyễn Hoàng Yến** | 2251050084 | **(Customer):** Xây dựng Entities và Repositories cho phân hệ Khách hàng (CustomerProfile, Reservation, Payment, Review). Hiệu chỉnh cấu hình Maven và Database YAML. | [eb8420d](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/eb8420d) |

---

## 2. Tiến độ tổng thể

| Hạng mục | Trạng thái | % |
|----------|------------|---|
| Khởi động (Setup, chọn đề tài) | Hoàn thành | 100% |
| Phân tích yêu cầu | Hoàn thành | 100% |
| Thiết kế kiến trúc | Hoàn thành | 100% |
| Backend API | Đang thực hiện | 25% |
| Frontend UI | Chưa bắt đầu | 0% |
| Docker | Đang thực hiện | 30% |
| Testing | Chưa bắt đầu | 0% |

**Tổng tiến độ:** 50%

---

## 3. Kế hoạch tuần tới (Tuần 5)

| Thành viên | Công việc dự kiến |
|------------|-------------------|
| **Nguyễn Anh Khoa** | Viết Basic CRUD APIs cho Admin quản lý danh sách Nhà hàng và xem danh sách người dùng. |
| **Nguyễn Thiện Đoan** | Viết APIs quản lý thực đơn (CRUD món ăn) và quản lý danh sách bàn cho phân hệ Nhà hàng. |
| **Nguyễn Hoàng Yến** | Viết APIs Discovery (xem quán) và API tạo đơn đặt bàn cơ bản cho Khách hàng. |

---

## 4. Khó khăn / Cần hỗ trợ

- [x] **Kỹ thuật:** Đã xử lý lỗi kết nối Database (`Access denied`) và lỗi xung đột thư viện Swagger bằng cách cập nhật version lên 3.0.2.
- [ ] **Kế hoạch:** Nhóm cần bắt đầu nghiên cứu cách viết Unit Test cho các Service cốt lõi (Auth, Cuisine) để đảm bảo chất lượng code khi hệ thống phình to.