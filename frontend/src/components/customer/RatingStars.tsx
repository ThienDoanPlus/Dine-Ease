import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number; // 0.0 - 5.0
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingStars({ rating, size = "sm", className }: RatingStarsProps) {
  const starSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-stone-200 text-stone-200"
          )}
        />
      ))}
    </div>
  );
}
