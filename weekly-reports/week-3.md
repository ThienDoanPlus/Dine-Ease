
# Báo cáo Tuần 3

**Tuần:** 3 (24/03/2026 - 30/03/2026)<br>
**Nhóm:** 11<br>
**Đề tài:** #4 - Hệ Thống Đặt Bàn Nhà Hàng (Dine-Ease)<br>
**Nhóm trưởng:** Nguyễn Anh Khoa - 2251052052


---

## 1. Công việc đã hoàn thành

| Thành viên | MSSV | Công việc | Link Commit/PR |
|------------|------|-----------|----------------|
| **Nguyễn Anh Khoa** | 2251052052 | Thiết kế sơ đồ ERD tổng quát, định nghĩa các Enum hệ thống và bảng User/Admin. Hoàn thiện khung tài liệu API Design. Chèn Wireframes phân hệ Admin. | [4b85a26](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/4b85a2600dbf0c26c663f62d39e38f2dba53dbf8), [182eee7](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/182eee75059f611d9eb00db38ae7c0b917831b16), [251506a](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/251506ac48bc1fa102a3148f7cdf61fe0313c9f8) |
| **Nguyễn Hoàng Yến** | 2251050084 | Thiết kế chi tiết các bảng liên quan đến Khách hàng (Reservation, Payment, Review, Voucher). Định nghĩa các Endpoint API cho phân hệ Khách hàng. Chèn Wireframes phân hệ Khách hàng. | [1560c10](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/1560c10875ae8422d3b7f4d95e1ee5afb411efea), [84702dd](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/84702dd0112d65962eb4fd544f5df6506d2827fb), [7d96515](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/7d96515b73065ba9bb4419a7c50246c05942d152) |
| **Nguyễn Thiện Đoan** | 2251052019 | Thiết kế chi tiết các bảng liên quan đến Nhà hàng (Menu, Table, OperatingHours). Định nghĩa các Endpoint API quản lý cho đối tác. Chèn Wireframes phân hệ Nhà hàng. | [86c089a](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/86c089a7c761bd441d059b8f6ab7792d00e7cf2c), [ea09bb2](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/ea09bb23a1a31f92f4251903b487a4dd367bd0c2), [1acdb7d](https://github.com/anh-khoa-nguyen/Dine-Ease/commit/1acdb7d828d13c4614c79f594ace0fca131e5d79) |

---

## 2. Tiến độ tổng thể

| Hạng mục | Trạng thái | % |
|----------|------------|---|
| Khởi động (Setup, chọn đề tài) | Hoàn thành | 100% |
| Phân tích yêu cầu | Hoàn thành | 100% |
| Thiết kế kiến trúc | Hoàn thành | 100% |
| Backend API | Chưa bắt đầu | 0% |
| Frontend UI | Chưa bắt đầu | 0% |
| Docker | Chưa bắt đầu | 0% |
| Testing | Chưa bắt đầu | 0% |

**Tổng tiến độ:** 25%

---

## 3. Kế hoạch tuần tới (Tuần 4)

| Thành viên | Công việc dự kiến |
|------------|-------------------|
| **Nguyễn Anh Khoa** | Setup dự án Spring Boot (Java 25, Boot 4). Cấu hình Security (JWT), Global Exception và các Entity nền tảng (User, Cuisine, Skeletons). |
| **Nguyễn Hoàng Yến** | Xây dựng các Entity và Repository cho phân hệ Khách hàng: CustomerProfile, Reservation, Payment, Review. |
| **Nguyễn Thiện Đoan** | Xây dựng các Entity và Repository cho phân hệ Nhà hàng: Restaurant, MenuCategory, MenuItem, RestaurantTable. |

---

## 4. Khó khăn / Cần hỗ trợ

- [x] **Giải quyết:** Nhóm đã thống nhất được việc dùng `Long` cho ID và dùng `Instant` cho thời gian để đồng bộ hệ thống.
- [ ] **Khó khăn:** Việc thiết kế logic gộp bàn (`TableGroup`) và chiết khấu hoa hồng (`commission_rate`) khá phức tạp về mặt quan hệ dữ liệu, nhóm cần nghiên cứu kỹ hơn khi bắt tay vào code logic ở Tuần 6.  