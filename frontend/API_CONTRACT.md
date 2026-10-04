# 🔌 DINE-EASE: API INTEGRATION CONTRACT

Tài liệu này quy định giao thức giao tiếp giữa Frontend (Next.js) và Backend (Spring Boot). Yêu cầu AI Agent luôn tham chiếu tài liệu này trước khi viết Axios calls hoặc định nghĩa TypeScript Interfaces.

---

## 1. THÔNG TIN MẠNG (NETWORK CONFIGURATION)
- **Base URL:** `http://localhost:8080/api/v1`
- **CORS:** Đã được cấu hình mở cho `http://localhost:3000` (bao gồm credentials).
- **Service Layer:** Toàn bộ request phải đi qua Axios instance được cấu hình tại `src/services/api.ts`. **TUYỆT ĐỐI KHÔNG** dùng hàm `fetch()` native của trình duyệt cho các tác vụ cần xác thực.

---

## 2. XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION)
- **Cơ chế:** Sử dụng **JWT (JSON Web Token)**.
- **Cách truyền:** Phải được đính kèm vào Header của mọi request (trừ các API `/auth/login`, `/auth/register` và `/public/**`):
  `Authorization: Bearer <accessToken>`
- **Lưu ý cho Agent:** Đã có Axios Interceptor trong `api.ts` tự động lấy token từ `localStorage` và nhét vào header. Khi viết service function, **không cần** tự truyền header này thủ công.

---

## 3. XỬ LÝ LỖI (GLOBAL ERROR FORMAT)
Backend Spring Boot sử dụng `GlobalExceptionHandler`. Khi có lỗi (400, 401, 403, 404, 409, 500), Backend sẽ trả về format sau. 
**Agent cần dùng format này để bắt lỗi trong React Query và hiển thị Toast/Alert:**

```typescript
// Định nghĩa chuẩn cho lỗi từ Backend
export interface ApiError {
  error: string;             // Ví dụ: "Bad Request", "Conflict"
  message: string;           // Thông báo lỗi chính hiển thị cho user
  details?: FieldError[];    // Danh sách lỗi cho từng field (nếu có validation error)
  path: string;
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
}
```

---

## 4. QUY TẮC MAPPING DỮ LIỆU (JAVA DTO -> TYPESCRIPT)
Backend sử dụng Java Records (chạy Jackson Object Mapper default). TypeScript Interfaces phải tuân thủ nghiêm ngặt chuẩn `camelCase`. 

Dưới đây là danh sách các DTO cốt lõi:

### A. Nhóm Authentication (Khoa)
```typescript
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'RESTAURANT' | 'CUSTOMER';
  status: 'ACTIVE' | 'BANNED' | 'INACTIVE';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresInSeconds: number;
  user: UserResponse;
}
```

### B. Nhóm Admin (Khoa)
```typescript
export interface AdminDashboardResponse {
  totalRestaurants: number;
  totalReservations: number;
  successfulReservations: number;
  totalCommissionRevenue: number;
}

export interface RestaurantAdminResponse {
  id: number;
  name: string;
  phoneContact: string;
  address: string;
  commissionRate: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  ownerEmail: string;
  ownerName: string;
}
```

### C. Nhóm Quản lý Nhà Hàng (Đoan)
```typescript
export interface MenuItemRequest {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  // Lưu ý: Upload ảnh dùng FormData, không dùng JSON object này trực tiếp
}

export interface ManageReservationResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  reservationDate: string; // "YYYY-MM-DD"
  reservationTime: string; // "HH:mm:ss"
  guestCount: number;
  notes: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETE' | 'CANCELLED';
  assignedTableName: string | null;
}

export interface TableResponse {
  id: number;
  tableName: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}
```

### D. Nhóm Khách Hàng (Yến)
```typescript
export interface ReservationRequest {
  restaurantId: number;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  notes?: string;
}

export interface PaymentUrlResponse {
  paymentUrl: string; // Chuyển hướng user đến link VNPay này
}

export interface RestaurantPublicResponse {
  id: number;
  name: string;
  address: string;
  imageMain: string | null;
  avgRating: number;
}
```

---

## 5. DANH MỤC ENDPOINT CỐT LÕI (ROUTE DIRECTORY)

**Agent khi sinh API functions (`.ts`) phải dùng đúng các URL sau:**

1. **Auth:** 
   - `POST /auth/login`
   - `GET /auth/me` (Yêu cầu JWT)
2. **Admin:** 
   - `GET /admin/reports/dashboard`
   - `GET /admin/restaurants` (Có phân trang `?page=0&size=10`)
   - `PATCH /admin/restaurants/{id}/status`
3. **Restaurant (Manage):**
   - `GET /manage/reservations`
   - `POST /manage/reservations/{id}/check-in`
   - `GET /manage/menu-items`
   - `GET /manage/tables`
4. **Customer:**
   - `GET /public/restaurants` (Public - Không cần JWT)
   - `POST /reservations` (Tạo đơn)
   - `POST /payments/create-url/vnpay/{reservationId}` (Thanh toán cọc)