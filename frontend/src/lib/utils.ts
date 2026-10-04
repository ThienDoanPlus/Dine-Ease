import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Định dạng đầy đủ (Dùng cho Hóa đơn, Checkout, POS) -> Output: "150.000đ"
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "0đ";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericAmount).replace("₫", "đ"); 
}

// 2. Định dạng rút gọn (Dùng cho Card nhà hàng ở trang chủ) -> Output: "~150k"
export function formatCompactPrice(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "0k";
  
  if (numericAmount >= 1000) {
    return `~${(numericAmount / 1000).toLocaleString("vi-VN")}k`;
  }
  return `~${numericAmount.toLocaleString("vi-VN")}đ`;
}

// 3. Định dạng hiển thị Giờ và Ngày chuẩn -> Output: "14:30 • 10/10/2026"
export function formatDateTime(dateInput: string | Date): string {
  if (!dateInput) return "---";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput); 

  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  
  return `${time} • ${date}`;
}

// Hàm sinh danh sách giờ dựa trên mốc bắt đầu và kết thúc
// Ví dụ: from "08:00", to "21:00" -> ["08:00", "08:30", ..., "21:00"]
export function generateDynamicTimeSlots(from: string, to: string, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = from.split(":").map(Number);
  const [endHour, endMin] = to.split(":").map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);

  while (current <= endTime) {
    const hh = String(current.getHours()).padStart(2, "0");
    const mm = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  return slots;
}

// Hàm lấy tên thứ trong tuần bằng tiếng Việt để khớp với JSON trong DB
export function getVietnameseDayName(date: Date): string {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return days[date.getDay()];
}
