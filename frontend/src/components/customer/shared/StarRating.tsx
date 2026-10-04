"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  readonly = true,
  size = "md",
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-10 h-10 md:w-12 md:h-12",
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <svg
            key={index}
            onClick={() => !readonly && onChange && onChange(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={cn(
              sizeClasses[size],
              "transition-all duration-200",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              isActive ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
            )}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}
