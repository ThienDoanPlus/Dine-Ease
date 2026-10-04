import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Thêm các màu indigo, emerald, rose vào type
export type ColorTheme = "amber" | "blue" | "purple" | "red" | "indigo" | "emerald" | "rose";

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string; // Đặt optional (?) vì có thẻ gọi không cần unit
  trend?: string; // Đặt optional
  trendType?: "up" | "down" | "neutral" | string; // Cho phép truyền trendType (tăng, giảm...)
  compareText?: string; // Đặt optional
  description?: string; // Cho phép truyền description thay vì compareText
  icon: LucideIcon;
  colorTheme: ColorTheme;
}

// 2. Thêm style cho các màu mới
const themeStyles: Record<ColorTheme, { bg: string; text: string; hoverBg: string }> = {
  amber: { bg: "bg-amber-50", text: "text-primary-hover", hoverBg: "group-hover:bg-primary" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", hoverBg: "group-hover:bg-blue-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", hoverBg: "group-hover:bg-purple-500" },
  red: { bg: "bg-red-50", text: "text-red-600", hoverBg: "group-hover:bg-red-500" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", hoverBg: "group-hover:bg-indigo-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", hoverBg: "group-hover:bg-emerald-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", hoverBg: "group-hover:bg-rose-500" },
};

// 3. Style màu cho trend (Tăng: Xanh lá, Giảm: Đỏ)
const getTrendStyle = (type?: string) => {
  if (type === "down") return "text-rose-600 bg-rose-50 border-rose-100";
  if (type === "neutral") return "text-stone-600 bg-stone-50 border-stone-100";
  return "text-emerald-600 bg-emerald-50 border-emerald-100"; // Mặc định là up
};

export function StatCard({
  title,
  value,
  unit,
  trend,
  trendType,
  compareText,
  description,
  icon: Icon,
  colorTheme,
}: StatCardProps) {
  const theme = themeStyles[colorTheme] || themeStyles.amber;

  return (
    <div className="group rounded-4xl border border-stone-100 bg-white/80 p-6 shadow-xl shadow-stone-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            "rounded-xl p-3 transition-all duration-300 group-hover:text-white",
            theme.bg,
            theme.text,
            theme.hoverBg
          )}
        >
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>

        {trend && (
          <span
            className={cn(
              "rounded-lg border px-2 py-1 text-xs font-bold",
              getTrendStyle(trendType)
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-xs font-bold tracking-wider text-stone-500 uppercase">{title}</h3>

      <div className="flex items-baseline gap-1.5">
        <span className="text-brand-dark text-2xl font-black">{value}</span>
        {unit && <span className="text-sm font-semibold text-stone-400">{unit}</span>}
      </div>

      {/* Hỗ trợ in ra compareText hoặc description tùy theo trang cha truyền cái gì */}
      {(compareText || description) && (
        <p className="mt-3 text-[10px] font-medium text-stone-400">{compareText || description}</p>
      )}
    </div>
  );
}
