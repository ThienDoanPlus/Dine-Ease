import React from "react";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";

export interface RestaurantCardProps {
  id: string | number;
  name: string;
  cuisine: string;
  location?: string;
  rating: number;
  priceLevel: string; // VD: "~350k", "45€"
  imageUrl: string;
  badgeText?: string; // VD: "Đánh giá cao", "Bestseller"
}

export function RestaurantCard({
  id,
  name,
  cuisine,
  location,
  rating,
  priceLevel,
  imageUrl,
  badgeText,
}: RestaurantCardProps) {
  return (
    <div className="group animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col overflow-hidden rounded-xl border border-stone-200/60 bg-white shadow-sm transition-all hover:shadow-xl hover:border-primary/20">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {badgeText && (
          <div className="absolute right-4 top-4 rounded-md bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
            {badgeText}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h4 className="text-brand-dark line-clamp-1 font-heading text-xl font-bold transition-colors group-hover:text-primary">
            {name}
          </h4>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-primary-light/50 px-2 py-1">
            <span className="text-sm font-bold text-primary">{rating}</span>
            <StarRating rating={1} maxStars={1} size="sm" />
          </div>
        </div>

        <p className="mb-4 text-sm font-medium text-stone-500">
          {cuisine} {location && `• ${location}`}
        </p>

        {/* Footer Card */}
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <span className="text-sm font-bold text-stone-400">{priceLevel}</span>
          <Link href={`/restaurants/${id}`}>
            <span className="text-sm font-bold text-primary transition-transform hover:translate-x-1 inline-block">
              Đặt bàn ngay →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
