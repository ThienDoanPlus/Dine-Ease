"use client";

import React from "react";
import Image from "next/image";
import { useRestaurantMenu } from "@/hooks/useCustomer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface MenuSectionProps {
  restaurantId: number;
}

export function MenuSection({ restaurantId }: MenuSectionProps) {
  const { data: menuCategories, isLoading, isError } = useRestaurantMenu(restaurantId);

  // HÀM BỔ SUNG: Xử lý cuộn trang khi bấm vào danh mục
  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`cat-${categoryId}`);
    if (element) {
      // Offset cần tính toán để trừ đi chiều cao của thanh Sticky (khoảng 80px của Header + 60px của Nav)
      const offset = 140; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) return <div className="space-y-8"><Skeleton className="h-12 w-full" /><Skeleton className="h-[300px] w-full" /></div>;
  if (isError || !menuCategories || menuCategories.length === 0) return <div className="py-20 text-center">Chưa có thực đơn.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      {/* CATEGORY NAV - THAY ĐỔI TẠI ĐÂY */}
      <div 
        className="no-scrollbar sticky top-20 z-50 mb-10 flex items-center gap-3 overflow-x-auto bg-white/95 backdrop-blur-md py-4 px-5 border border-stone-200 shadow-md rounded-2xl"
      >
        {menuCategories.map((cat) => (
          <button 
            key={cat.categoryId} 
            onClick={() => scrollToCategory(cat.categoryId)}
            className="whitespace-nowrap rounded-full border border-stone-200 bg-stone-50 px-6 py-2 text-sm font-bold text-stone-500 transition-all hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 active:scale-95"
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {menuCategories.map(cat => (
          <div key={cat.categoryId} id={`cat-${cat.categoryId}`} className="scroll-mt-40">
            <h3 className="mb-8 border-l-4 border-amber-500 pl-4 text-2xl font-black uppercase text-[#2D2318]">
              {cat.categoryName}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cat.items?.map(item => (
                <div key={item.id} className="group relative rounded-3xl border border-stone-100 bg-white p-4 shadow-sm hover:shadow-lg hover:border-amber-100 transition-all duration-300">
                  <div className="relative mb-4 h-44 overflow-hidden rounded-2xl bg-stone-100">
                    <Image src={item.imageUrls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h4 className="font-bold text-[#2D2318] line-clamp-1" title={item.name}>{item.name}</h4>
                  {item.description && <p className="mt-1 text-xs text-stone-500 line-clamp-2">{item.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-black text-amber-600">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
