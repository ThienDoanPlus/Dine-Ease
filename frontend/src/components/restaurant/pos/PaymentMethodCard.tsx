import React from "react";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export function PaymentMethodCard({ id, label, icon, isActive, onClick }: PaymentMethodCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all duration-200 select-none active:scale-95 sm:p-4",
        isActive
          ? "border-primary ring-primary/10 bg-amber-50 text-amber-700 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)] ring-4"
          : "border-stone-100 bg-white text-stone-500 hover:border-amber-200 hover:bg-stone-50"
      )}
    >
      <div className={cn("mb-2 transition-transform", isActive ? "scale-110" : "")}>{icon}</div>
      <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
    </button>
  );
}
