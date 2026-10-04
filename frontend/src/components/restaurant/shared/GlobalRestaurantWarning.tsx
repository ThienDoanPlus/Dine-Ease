"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

export function GlobalRestaurantWarning() {
  const { user, isMounted } = useAuthContext();

  if (!isMounted || !user) return null;

  // Nếu User không phải là chủ quán, bỏ qua
  if (!user.roles.includes("RESTAURANT")) return null;

  const status = user.restaurantStatus;

  // Nếu nhà hàng đang hoạt động bình thường, không hiện cảnh báo
  if (!status || status === "ACTIVE" || status === "APPROVED") return null;

  let message = "Nhà hàng của bạn đang bị TẠM KHÓA.";
  if (status === "PENDING") message = "Hồ sơ nhà hàng đang CHỜ DUYỆT.";
  if (status === "REJECTED") message = "Hồ sơ nhà hàng đã BỊ TỪ CHỐI.";

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 border-b border-red-200 bg-red-50 px-6 py-3 shadow-sm">
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 animate-pulse" strokeWidth={2.5} />
      <p className="text-sm font-medium text-red-800">
        <strong className="font-bold uppercase mr-1">{message}</strong> 
        Khách hàng sẽ không thể tìm thấy hoặc đặt bàn tại quán của bạn. Các thay đổi dữ liệu (Menu, Sơ đồ bàn...) hiện tại chỉ mang tính nháp.
      </p>
    </div>
  );
}
