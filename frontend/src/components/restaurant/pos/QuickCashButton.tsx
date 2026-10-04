import React from "react";

interface QuickCashButtonProps {
  amount: number;
  disabled: boolean;
  onClick: () => void;
}

export function QuickCashButton({ amount, disabled, onClick }: QuickCashButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="hover:bg-primary hover:border-primary flex items-center justify-center rounded-xl border border-stone-200 bg-white px-2 py-2.5 text-xs font-bold text-stone-600 shadow-sm transition-all hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {amount.toLocaleString("vi-VN")}
    </button>
  );
}
