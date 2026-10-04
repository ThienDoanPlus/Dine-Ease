# 📖 DINE-EASE: FRONTEND GUIDELINES

Tài liệu này quy định các tiêu chuẩn viết code, cấu trúc thư mục và quy chuẩn UI/UX cho dự án Frontend Dine-Ease. Tất cả thành viên (Khoa, Yến, Đoan) cần tuân thủ nghiêm ngặt để đảm bảo chất lượng và tiến độ trong 3 tuần cuối.

---

## 1. CẤU TRÚC THƯ MỤC (FOLDER STRUCTURE)
Dự án sử dụng **Next.js App Router**. Mọi code phải được đặt đúng vị trí:

```text
src/
├── app/                  # Chứa các Route/Page chính
│   ├── (auth)/           # Đăng nhập, Đăng ký (Khoa)
│   ├── (public)/         # Trang chủ, Chi tiết quán, Đặt bàn (Yến)
│   ├── admin/            # Dashboard Super Admin (Khoa)
│   └── manage/           # Dashboard Quản lý Nhà hàng (Đoan)
├── components/           # Components dùng chung
│   ├── ui/               # Component của Shadcn (NÚT, FORM, MODAL - Không tự sửa)
│   └── shared/           # Component tự build (Header, Sidebar, GlassCard...)
├── hooks/                # Custom React Hooks (vd: useAuth)
├── lib/                  # Các hàm tiện ích (utils.ts, format tiền tệ, ngày tháng)
├── providers/            # React Query Provider, Auth Provider
├── services/             # Logic gọi API (axios)
│   ├── api.ts            # Cấu hình Axios Interceptors (Đã có sẵn JWT)
│   └── ...               # adminService.ts, restaurantService.ts...
└── types/                # Định nghĩa TypeScript Interfaces (Copy từ DTO Java sang)
```

---

## 2. QUY CHUẨN GỌI API & QUẢN LÝ STATE
**❌ KHÔNG dùng `fetch` thuần hoặc `useEffect` để gọi API (rất dễ dính bug render 2 lần).**
**✅ LUÔN DÙNG `@tanstack/react-query` kết hợp với `axios` instance đã setup sẵn.**

### Ví dụ chuẩn:
**1. Viết service (trong `src/services/restaurantService.ts`):**
```typescript
import api from './api';
import { RestaurantResponse } from '@/types';

export const getRestaurants = async (): Promise<RestaurantResponse[]> => {
  return await api.get('/public/restaurants');
};
```

**2. Sử dụng trong Component bằng React Query:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { getRestaurants } from '@/services/restaurantService';
import { Skeleton } from '@/components/ui/skeleton';

export default function RestaurantList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  if (isLoading) return <Skeleton className="w-full h-32 rounded-xl" />; // Hiệu ứng Skeleton mượt mà
  if (isError) return <p>Có lỗi xảy ra!</p>;

  return <div>{/* Render data ở đây */}</div>;
}
```

---

## 3. QUY CHUẨN UI/UX & STYLING (THEO HI-FI PROPOSAL)
Chúng ta thiết kế theo phong cách **Glassmorphism** và **Bo góc lớn (Rounded)**. Tuyệt đối tuân thủ các class Tailwind sau:

### A. Glassmorphism Card (Thẻ kính mờ)
Dùng cho các Widget, Modal, hoặc Card thông tin:
```tsx
className="bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl"
```

### B. Status Pills (Nhãn trạng thái)
Không dùng text thô. Luôn bọc trong thẻ `<Badge>` hoặc thẻ `span` có style rõ ràng:
- **Chờ duyệt (Pending):** `bg-amber-50 text-amber-600 border border-amber-200`
- **Thành công (Active/Approved):** `bg-emerald-50 text-emerald-600 border border-emerald-200`
- **Thất bại (Cancelled/Rejected):** `bg-rose-50 text-rose-600 border border-rose-200`

### C. Tương tác mượt (Micro-interactions)
- **Nút bấm (Button):** Phải có hiệu ứng hover và transition. (Shadcn đã làm sẵn, chỉ cần dùng `<Button>`).
- **Focus Input:** Khi click vào ô nhập liệu, viền phải sáng màu Indigo: `focus-visible:ring-2 focus-visible:ring-indigo-500/30`.

---

## 4. QUY CHUẨN CODE (CODING STANDARDS)
1. **TypeScript First:** Bất kỳ DTO nào ở Spring Boot (ví dụ: `ReservationRequest`) đều phải được tạo ra 1 `interface` tương ứng trong thư mục `src/types/index.ts`. KHÔNG được dùng `any`.
2. **Naming Convention:**
   - Tên file/folder component: **PascalCase** (ví dụ: `RestaurantCard.tsx`).
   - Tên biến/hàm: **camelCase** (ví dụ: `fetchUserData`, `isOpen`).
   - Tên hằng số (constants): **UPPER_SNAKE_CASE** (ví dụ: `MAX_FILE_SIZE`).
3. **Xử lý Form:** Bắt buộc dùng `react-hook-form` + `zod` để validate dữ liệu trước khi gửi xuống Backend (Khớp với `@Valid` bên Java).

---

## 5. QUY TRÌNH GIT (WORKFLOW)
Chúng ta tiếp tục áp dụng tiêu chuẩn Conventional Commits và Branching như đã làm ở Backend:

- **Tên nhánh (Branch Name):** `loại/tuần-tên-công-việc`
  - Ví dụ: `feat/w8-admin-dashboard`, `fix/w9-payment-bug`
- **Tên Commit:** `loại: mô tả công việc (viết thường, tiếng Anh hoặc tiếng Việt)`
  - Ví dụ: `feat: add restaurant detail page with glassmorphism UI`
  - Ví dụ: `fix: handle CORS error when calling momo payment`

**LƯU Ý QUAN TRỌNG TRƯỚC KHI PUSH:**
Luôn chạy `npm run build` ở local để đảm bảo Next.js không bị lỗi Type hoặc lỗi Build trước khi gộp (merge) code vào nhánh `main`.