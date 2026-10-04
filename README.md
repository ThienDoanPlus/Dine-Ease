# Hệ Thống Đặt Bàn Nhà Hàng (Restaurant Reservation System)

## Mô tả
Nền tảng ứng dụng Web cho phép khách hàng tìm kiếm nhà hàng theo vị trí/cuisine, xem menu, đặt bàn online và thanh toán đặt cọc. Hệ thống cung cấp công cụ cho chủ nhà hàng quản lý sơ đồ bàn, menu, xác nhận đặt bàn và ghi nhận order. Admin quản lý toàn bộ hệ thống, duyệt nhà hàng mới và xem báo cáo thống kê.

## Thành viên nhóm
| MSSV       | Họ tên            | Vai trò                                   |
|------------|-------------------|-------------------------------------------|
| 2251052052 | Nguyễn Anh Khoa   | Nhóm trưởng (PM), Fullstack Dev           |
| 2251050084 | Nguyễn Hoàng Yến  | QA/Tester, Fullstack Dev                  |
| 2251052019 | Nguyễn Thiện Đoan | Fullstack Dev                             |

## Công nghệ sử dụng
- Backend: Spring Boot (Java 21+)
- Frontend: ReactJS
- Database: MySQL
- Tích hợp khác: Cloudinary API (Upload ảnh), VNPay/Momo (Mock payment), JavaMail (Gửi email)

## Cài đặt và chạy

### Yêu cầu
- Java 21+
- Node.js 18+
- MySQL Server

### Chạy Backend
```bash
cd backend 
./mvnw spring-boot:run 
```

### Chạy Frontend
```bash
cd frontend 
npm install 
npm start 
```

### Truy cập
- Frontend: http://localhost:3000 
- Backend API: http://localhost:8080 

## Demo
*[Tuần 10]*

## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md) 
- [Database Design](docs/database-design.md) 
- [API Documentation](docs/api-docs.md) 