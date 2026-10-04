"use client";

import React from "react";
import { usePublicAmenities } from "@/hooks/useCustomer";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles, X } from "lucide-react";

interface AmenitiesBarProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function AmenitiesBar({ selectedIds, onToggle, onClear }: AmenitiesBarProps) {
  const { data: amenities, isLoading } = usePublicAmenities();

  if (isLoading) return (
    <div className="flex items-center gap-2 py-4">
      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="relative mb-8 flex w-full items-center gap-2">
      {/* Danh sách cuộn ngang - Thêm min-w-0 để tránh đẩy layout */}
      <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto pb-1 pt-1">
        {amenities?.map((a) => {
          const isSelected = selectedIds.includes(String(a.id));
          return (
            <button
              key={a.id}
              onClick={() => onToggle(String(a.id))}
              type="button" // Đảm bảo không trigger submit form
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-bold transition-all duration-300 active:scale-95",
                isSelected
                  ? "bg-[#2D2318] border-[#2D2318] text-white shadow-md"
                  : "bg-white border-stone-200 text-stone-600 hover:border-amber-400 hover:bg-amber-50/30"
              )}
            >
              <span className="text-base">{a.icon || "✨"}</span>
              {a.name}
            </button>
          );
        })}
      </div>

      {/* Nút xóa nhanh (Chỉ hiện khi có chọn) */}
      {selectedIds.length > 0 && (
        <button
          onClick={onClear}
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-stone-200"
          title="Xóa tất cả tiện ích"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
