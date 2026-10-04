# 🎨 DINE-EASE: UI/UX SPECIFICATIONS (HI-FI STANDARDS)

Tài liệu này định nghĩa các tiêu chuẩn thiết kế vi mô (Micro-Components) và vĩ mô (Layouts) dựa trên bản Hi-Fi Proposal. Yêu cầu AI Agent và Team 11 (Khoa, Yến, Đoan) tái sử dụng chính xác các class Tailwind dưới đây khi code giao diện.

---

## 1. TỔNG QUAN THIẾT KẾ (DESIGN PHILOSOPHY)
- **Glassmorphism (Kính mờ):** Tạo chiều sâu không gian, phân lớp rõ ràng giữa nền và nội dung.
- **Bố cục tinh gọn:** Loại bỏ đường viền cứng, dùng khoảng trắng (white-space) để phân cách.
- **Tương tác trực quan:** Mọi phần tử (Input, Button, Card) đều phải có phản hồi mượt mà khi Hover/Focus.
- **Dữ liệu sinh động:** Thay thế bảng biểu khô khan bằng màu sắc tương phản, biểu đồ hiện đại và Skeleton Loading.

---

## 2. HỆ THỐNG MÀU SẮC & FONT CHỮ (TOKENS)
- **Font chữ chính:** `Plus Jakarta Sans` hoặc `Inter`.
- **Màu nền tổng thể (Body):** `#FDFBF7` hoặc `bg-stone-50`.
- **Màu văn bản chính:** `text-stone-800` (Tiêu đề), `text-stone-500` (Mô tả phụ).
- **Màu thương hiệu (Brand/Primary):** Tông màu `Amber` / `Orange` (Màu đồ ăn/nhà hàng).
- **Màu Focus/Tương tác:** `Indigo` (Màu xanh dương tím - dùng cho viền Input khi click).

---

## 3. TIÊU CHUẨN MICRO-COMPONENTS (CLASS TAILWIND CHUẨN)

### A. Glassmorphism Cards (Thẻ thông tin, KPI, Widget)
Tuyệt đối không dùng `bg-white` phẳng lỳ. Hãy kết hợp độ trong suốt và blur:
```tsx
// Class chuẩn cho Card
className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-stone-200/50 rounded-[2rem]"
```

### B. Status Pills (Nhãn Trạng Thái)
Không hiển thị Text thô. Trạng thái phải là các Pill (viên thuốc) màu sắc nhạt, chữ đậm.
- **Thành công (Active / Approved / Completed):**
  ```tsx
  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200"
  ```
- **Chờ xử lý (Pending / Awaiting):**
  ```tsx
  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-600 border border-amber-200"
  ```
- **Thất bại (Rejected / Cancelled):**
  ```tsx
  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200"
  ```
*(Mẹo: Luôn kèm 1 chấm tròn nhỏ `w-1.5 h-1.5 rounded-full` cùng tông màu đậm ở trước text).*

### C. Inputs & Toggles (Nhập liệu & Công tắc)
- **Trạng thái Focus (Glow effect):** Khi người dùng click vào ô text, viền phải phát sáng màu Indigo mượt mà.
  ```tsx
  className="transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
  ```
- **Toggle Switches:** Dùng component Switch của Shadcn UI, custom màu `data-[state=checked]:bg-emerald-500` để có phong cách iOS.

### D. Buttons & Hành động (Call to Action)
- **Nút chính (Primary):** Có đổ bóng màu của chính nó để tạo cảm giác nổi (Elevated).
  ```tsx
  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5"
  ```
- **Ghost Buttons (Nút ẩn):** Dùng cho các icon thao tác (Sửa, Xóa) trong bảng để không làm rối mắt. Chỉ hiện rõ khi hover.
  ```tsx
  className="text-stone-400 hover:text-stone-800 hover:bg-stone-100 p-2 rounded-lg transition-colors"
  ```

### E. Modals / Dialogs (Hộp thoại)
Sử dụng góc bo tròn lớn và bóng đổ cực sâu để tách biệt hoàn toàn khỏi lớp nền.
```tsx
className="rounded-[2rem] shadow-2xl shadow-stone-900/20 border-0"
```

---

## 4. TIÊU CHUẨN HIỂN THỊ DỮ LIỆU (DATA VIZ & LOADING)

### A. Trạng thái chờ (Loading States)
**NGHIÊM CẤM SỬ DỤNG SPINNER (Vòng xoay Loading) CHO LAYOUT CHÍNH.**
- Phải sử dụng **Skeleton Screens** (hiệu ứng khối xám nhấp nháy `pulse`) để giữ nguyên cấu trúc trang trong lúc chờ API.
- Dùng `<Skeleton className="h-4 w-[250px] rounded-full" />` của Shadcn UI.

### B. Biểu đồ (Charts)
Sử dụng `Recharts` hoặc `Tremor`:
- **Pie Chart -> Donut Chart:** Không dùng biểu đồ tròn đặc. Dùng biểu đồ khuyết tâm (Donut) để tận dụng không gian giữa hiển thị "Tổng số". Kèm Tooltip nổi (Floating tooltip).
- **Bar/Line Chart -> Area Chart:** Thay thế đường gấp khúc thô cứng bằng đường xu hướng mềm mại (Monotone), bên dưới dải đường phải có **Gradient** mờ dần xuống trục X để tạo chiều sâu.

---

## 5. TIÊU CHUẨN LAYOUT BỐ CỤC CỤ THỂ

### A. Bố cục Hồ sơ / Chi tiết (Tỷ lệ 30/70)
Khi hiển thị chi tiết Nhà hàng hoặc Đơn hàng:
- **Cột Trái (30%):** Khối hiển thị Avatar/Logo lớn (bo tròn, đè lên ảnh bìa), Tên, Trạng thái Pills và Liên hệ nhanh.
- **Cột Phải (70%):** Dùng hệ thống **Tabs** để chia nội dung (Thông tin, Pháp lý, Thực đơn), tránh việc cuộn trang quá dài (Long-scroll).

### B. Lưới hình ảnh (Image Grids)
- Khi hiển thị Thực đơn, dùng cấu trúc Card. Ảnh món ăn phải lấp đầy phía trên, góc bo tròn.
- Khi Hover vào Card món ăn: Hình ảnh bên trong phóng to nhẹ `group-hover:scale-110 transition-transform duration-500`.

### C. Bảng biểu (Data Tables)
- Không dùng đường viền dọc `|`. Chỉ dùng đường viền ngang mỏng `border-b border-stone-100` để ngăn cách các hàng.
- Font chữ của các dãy số ID/Mã đơn hàng phải dùng font `Monospace` hoặc `tabular-nums` để dễ dò chiếu.