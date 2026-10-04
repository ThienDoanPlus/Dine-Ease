// Định nghĩa chính xác theo Enum ReservationStatus.java ở Backend Spring Boot
export type BookingStatus = 
  | "PENDING" 
  | "AWAITING_DEPOSIT" 
  | "CONFIRMED" 
  | "CHECKED_IN" 
  | "COMPLETE" 
  | "CANCELLED";

export const BookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  AWAITING_DEPOSIT: "Chờ đặt cọc",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã xếp bàn",
  COMPLETE: "Đã hoàn thành",
  CANCELLED: "Đã hủy bỏ",
};
