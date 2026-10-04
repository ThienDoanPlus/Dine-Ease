import React from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

interface CheckoutRestaurantBannerProps {
  restaurantName: string;
  imageUrl: string;
  location?: string; // Có thể có hoặc không
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function CheckoutRestaurantBanner({
  restaurantName,
  imageUrl,
  location,
  showBackButton = false,
  onBackClick,
}: CheckoutRestaurantBannerProps) {
  return (
    <div className="mb-10">
      <div className="group relative mb-6 h-48 overflow-hidden rounded-[2rem] shadow-lg">
        <Image
          src={imageUrl}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          alt={restaurantName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2318]/90 via-[#2D2318]/20 to-transparent"></div>
        <div className="absolute bottom-6 left-8">
          <h1 className="text-3xl font-black tracking-tight text-white">{restaurantName}</h1>
          {/* Chỉ render địa chỉ nếu được truyền vào */}
          {location && (
            <p className="mt-1 text-sm font-medium text-amber-200">{location}</p>
          )}
        </div>
      </div>

      {/* Chỉ render nút back nếu showBackButton = true */}
      {showBackButton && onBackClick && (
        <button
          onClick={onBackClick}
          className="flex items-center gap-2 font-medium text-stone-500 transition-colors hover:text-amber-600"
        >
          <ChevronLeft className="h-5 w-5" /> Quay lại
        </button>
      )}
    </div>
  );
}
