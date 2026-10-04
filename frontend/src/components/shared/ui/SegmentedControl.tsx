import React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  value: string;
  label: React.ReactNode; // Cho phép truyền cả string hoặc Icon/Thẻ span (chấm màu)
}

interface SegmentedControlProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "pill" | "outline";
  fullWidth?: boolean;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  variant = "default",
  fullWidth = false,
}: SegmentedControlProps) {
  // Cấu hình nền bọc ngoài
  const containerStyles = {
    default: "rounded-2xl border border-stone-100 bg-white p-1 shadow-sm",
    pill: "rounded-[20px] bg-stone-100 p-1.5",
    outline: "rounded-xl border border-stone-200 bg-white p-1",
  };

  // Cấu hình Base của nút bấm
  const btnStyles = {
    default: "rounded-xl px-6 py-2.5 text-xs font-black tracking-widest uppercase",
    pill: "rounded-[14px] px-6 py-2.5 text-sm font-bold whitespace-nowrap",
    outline: "rounded-lg px-4 py-2 text-xs font-bold tracking-widest uppercase",
  };

  // Cấu hình màu khi Active / Inactive
  const activeStyles = {
    default: "bg-primary text-white shadow-lg shadow-primary/30",
    pill: "bg-[#2D2318] text-white shadow-md",
    outline: "bg-brand-dark text-white shadow-sm",
  };
  const inactiveStyles = {
    default: "text-stone-400 hover:text-brand-dark",
    pill: "text-stone-500 hover:text-stone-700",
    outline: "text-stone-500 hover:text-stone-700",
  };

  return (
    <div className={cn("no-scrollbar flex items-center overflow-x-auto", containerStyles[variant], fullWidth ? "w-full sm:w-fit" : "w-fit")}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 transition-all focus:outline-none",
              btnStyles[variant],
              isActive ? activeStyles[variant] : inactiveStyles[variant],
              fullWidth ? "flex-1 sm:flex-none" : "shrink-0"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
