"use client";

import React, { useState } from "react";
import { Loader2, Star, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePublicCuisines, usePublicAmenities } from "@/hooks/useCustomer";

export interface FilterState {
  minRating: number;
  priceMax: number;
  cuisines: string[]; // Lưu mảng ID dưới dạng string để xử lý UI checkbox
  amenities: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply: () => void;
  onReset: () => void;
}

export function FilterSidebar({ filters, setFilters, onApply, onReset }: FilterSidebarProps) {
  const { data: cuisines, isLoading: loadingCuisine } = usePublicCuisines();
  const { data: amenities, isLoading: loadingAmenity } = usePublicAmenities();

  const toggleArrayItem = (key: "cuisines" | "amenities", id: string) => {
    setFilters((prev) => {
      const currentList = prev[key];
      const exists = currentList.includes(id);
      return {
        ...prev,
        [key]: exists ? currentList.filter((item) => item !== id) : [...currentList, id],
      };
    });
  };

  return (
    <div className="sticky top-24 rounded-[2rem] border border-stone-100 bg-white p-8 shadow-sm">
      <h3 className="mb-8 text-xl font-extrabold text-[#2D2318]">Bộ lọc</h3>

      {/* Đánh giá tối thiểu - BẢN FIX CHUẨN 100% */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-widest text-stone-400 uppercase">
            Đánh giá tối thiểu
          </h4>
          <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-sm font-black text-amber-600">
            {filters.minRating > 0 ? filters.minRating.toFixed(1) : "0.0"}
          </span>
        </div>

        {/* Container chính: Khống chế độ rộng để khớp với các số bên dưới */}
        <div className="relative w-full max-w-[200px] mx-auto">

          {/* 1. Lớp sao nền (Màu xám) */}
          <div className="flex justify-between text-stone-200">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-7 w-7 fill-stone-100" strokeWidth={1.5} />
            ))}
          </div>

          {/* 2. Lớp sao phủ (Màu vàng) */}
          {/* Quan trọng: Chiều rộng của lớp con bên trong (Gold Stars) phải bằng chiều rộng lớp nền */}
          <div
            className="absolute top-0 left-0 overflow-hidden pointer-events-none transition-all duration-75"
            style={{ width: `${(filters.minRating / 5) * 100}%` }}
          >
            <div className="flex justify-between text-amber-400" style={{ width: '200px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-7 w-7 fill-amber-400 shrink-0" strokeWidth={1.5} />
              ))}
            </div>
          </div>

          {/* 3. Thanh kéo tàng hình đè khít lên trên */}
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={filters.minRating}
            onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
            style={{ margin: 0 }}
          />

          {/* 4. Các con số mốc (0-5) căn lề chuẩn theo ngôi sao */}
          <div className="flex justify-between mt-2 px-[2px]">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <span key={num} className="text-[10px] font-black text-stone-300 w-4 text-center">
                {num}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] font-medium text-stone-400 italic text-center">
          Kéo để chọn chính xác điểm đánh giá
        </p>
      </div>

      {/* LOẠI HÌNH ẨM THỰC - LÀM LẠI GIAO DIỆN CHỌN */}
      <div className="mb-10">
        <h4 className="mb-4 text-sm font-bold tracking-widest text-stone-400 uppercase">
          Loại hình ẩm thực
        </h4>
        <div className="flex flex-col gap-2">
          {loadingCuisine ? (
            <Loader2 className="animate-spin text-amber-500 mx-auto" />
          ) : (
            cuisines?.map((c) => {
              const isSelected = filters.cuisines.includes(String(c.id));
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleArrayItem("cuisines", String(c.id))}
                  className={cn(
                    "group flex items-center justify-between w-full p-3 rounded-2xl border transition-all duration-200",
                    isSelected
                      ? "bg-amber-50 border-amber-200 shadow-sm" // Khi chọn: Nền vàng nhạt, viền đậm hơn
                      : "bg-white border-transparent hover:bg-stone-50 hover:border-stone-100" // Khi chưa chọn: Ẩn viền, hover hiện nhẹ
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {c.iconUrl || "🍴"}
                    </span>
                    <span className={cn(
                      "text-sm font-semibold transition-colors",
                      isSelected ? "text-amber-900" : "text-stone-600 group-hover:text-stone-900"
                    )}>
                      {c.name}
                    </span>
                  </div>

                  {/* Vòng tròn thay thế checkbox */}
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected 
                      ? "bg-amber-500 border-amber-500" 
                      : "bg-white border-stone-200"
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Khoảng giá */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-widest text-stone-400 uppercase">Giá tối đa</h4>

          {/* [VÁ LỖ HỔNG UI]: Hiển thị chữ 5M+ nếu kéo MAX */}
          <span className="text-xs font-bold text-amber-600">
            {filters.priceMax >= 5000 ? "5 Triệu+" : `${filters.priceMax}k`}
          </span>
        </div>

        {/* Đổi Max thành 5000 */}
        <input
          type="range" min="100" max="5000" step="100"
          value={filters.priceMax}
          onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
          className="h-2 w-full appearance-none rounded-lg bg-stone-100 cursor-pointer accent-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="customer" onClick={onApply} className="w-full shadow-md py-3 h-auto rounded-xl">Lọc</Button>
        <Button variant="customer-outline" onClick={onReset} className="w-full py-3 h-auto rounded-xl font-bold border-stone-200">Xóa</Button>
      </div>
    </div>
  );
}
