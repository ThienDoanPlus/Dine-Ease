// src/components/restaurant/tables/ContextMenu.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import { Coffee, ArrowRightLeft, CreditCard, Wrench, Combine } from "lucide-react";

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  isMaintenance: boolean; // Dùng để biết nên hiện chữ "Báo hỏng" hay "Sửa xong"
  isMerged: boolean; // Dùng để biết có hiện nút "Tách cụm bàn" không
  onOrder: () => void;
  onMove: () => void;
  onPayment: () => void;
  onToggleMaintenance: () => void; // Hàm xử lý
  onUnmerge: () => void; // Hàm xử lý tách bàn
}

export function ContextMenu({
  visible,
  x,
  y,
  isMaintenance,
  isMerged,
  onOrder,
  onMove,
  onPayment,
  onToggleMaintenance,
  onUnmerge
}: ContextMenuProps) {
  // Tránh lỗi Hydration của Next.js (Vì server không có document.body)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!visible || !mounted) return null;

  // Nội dung Menu
  const menuContent = (
    <div
      className="animate-in fade-in zoom-in-95 fixed z-[9999] w-52 rounded-2xl border border-stone-100 bg-white/90 p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur-xl duration-200"
      // Tính toán lại vị trí cho Portal
      style={{ left: `${x}px`, top: `${y}px`, transform: "translateX(-50%)" }}
    >
      <button
        onClick={onOrder}
        className="bg-primary hover:bg-primary-hover mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold text-white shadow-[0_4px_15px_-4px_rgba(245,158,11,0.5)] transition-all active:scale-95"
      >
        <Coffee className="h-4 w-4" strokeWidth={3} />
        Gọi món
      </button>

      <button
        onClick={onMove}
        className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-stone-600 transition-all hover:bg-stone-100/80 active:scale-95"
      >
        <ArrowRightLeft className="h-4 w-4 text-stone-400" strokeWidth={2.5} />
        Chuyển bàn
      </button>

      <button
        onClick={onPayment}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-stone-600 transition-all hover:bg-stone-100/80 active:scale-95"
      >
        <CreditCard className="h-4 w-4 text-stone-400" strokeWidth={2.5} />
        Thanh toán
      </button>

      {/* THÊM NÚT TÁCH BÀN NẾU ĐANG GỘP */}
      {isMerged && (
        <button
          onClick={onUnmerge}
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold text-rose-500 transition-all hover:bg-rose-50 active:scale-95"
        >
          <Combine className="h-4 w-4" strokeWidth={3} />
          Tách bàn
        </button>
      )}

      {/* THÊM NÚT BÁO HỎNG Ở CUỐI MENU */}
      <div className="my-1 border-t border-stone-100"></div>
      <button
        onClick={onToggleMaintenance}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:scale-95 ${isMaintenance ? "text-emerald-600 hover:bg-emerald-50" : "text-rose-500 hover:bg-rose-50"
          }`}
      >
        <Wrench className="h-4 w-4" strokeWidth={2.5} />
        {isMaintenance ? "Đã sửa xong" : "Báo hỏng bàn"}
      </button>

      {/* Mũi tên nhỏ chỉ lên trên */}
      <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-t border-l border-stone-100 bg-white"></div>
    </div>
  );

  // Render Portal thẳng vào body
  return createPortal(menuContent, document.body);
}
