// src/components/restaurant/tables/SpecialAreaNode.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface SpecialAreaNodeProps {
  title: string;
  name: string;
  type: "hall" | "vip";
  onClick?: () => void;
}

export function SpecialAreaNode({ title, name, type, onClick }: SpecialAreaNodeProps) {
  const isVip = type === "vip";

  return (
    <div className="flex flex-col items-center gap-6 rounded-4xl border border-stone-100 bg-white p-8 shadow-sm">
      <h4 className="text-sm font-black tracking-widest text-stone-400 uppercase">{title}</h4>

      <div className="relative my-4 flex items-center justify-center">
        {/* Render các ghế (chấm tròn xung quanh) tùy theo loại khu vực */}
        {isVip ? (
          <>
            <div className="absolute -top-6 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-200"></div>
            <div className="absolute -bottom-6 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-200"></div>
            <div className="absolute top-1/2 -left-6 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-200"></div>
            <div className="absolute top-1/2 -right-6 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-200"></div>
          </>
        ) : (
          <>
            <div className="absolute -top-6 left-1/4 h-4 w-4 -translate-x-1/2 rounded-full bg-stone-200"></div>
            <div className="absolute -top-6 left-3/4 h-4 w-4 -translate-x-1/2 rounded-full bg-stone-200"></div>
            <div className="absolute -bottom-6 left-1/4 h-4 w-4 -translate-x-1/2 rounded-full bg-stone-200"></div>
            <div className="absolute -bottom-6 left-3/4 h-4 w-4 -translate-x-1/2 rounded-full bg-stone-200"></div>
            <div className="absolute top-1/2 -left-6 h-4 w-4 -translate-y-1/2 rounded-full bg-stone-200"></div>
            <div className="absolute top-1/2 -right-6 h-4 w-4 -translate-y-1/2 rounded-full bg-stone-200"></div>
          </>
        )}

        {/* Khối chính (Bàn) */}
        <div
          onClick={onClick}
          className={cn(
            "flex cursor-pointer items-center justify-center shadow-sm transition-all",
            isVip
              ? "h-36 w-36 rounded-full border-2 border-blue-300 bg-blue-50/50 hover:scale-105 hover:bg-blue-100"
              : "h-28 w-56 rounded-4xl border-2 border-stone-200 bg-stone-50 hover:border-amber-400 hover:bg-amber-50"
          )}
        >
          <span
            className={cn(
              "text-xl font-black tracking-wider",
              isVip ? "tracking-widest text-blue-800 uppercase" : "text-stone-700"
            )}
          >
            {name}
          </span>
        </div>
      </div>
    </div>
  );
}
