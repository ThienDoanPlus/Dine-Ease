// src/components/restaurant/kitchen/types.ts

export type OrderStatus = "pending" | "cooking" | "ready" | "rejected";

export interface OrderItem {
  id: number; // Đây là ID của OrderItem
  name: string;
  qty: number;
  note: string;
  options: string[]; // Bổ sung options cho đồng bộ
  status: OrderStatus; // <-- THÊM MỚI: Món lẻ cũng có trạng thái
}

export interface KitchenOrder {
  id: string; // Order Code
  table: string;
  time: string;
  status: OrderStatus; // Trạng thái tổng
  items: OrderItem[];
}
