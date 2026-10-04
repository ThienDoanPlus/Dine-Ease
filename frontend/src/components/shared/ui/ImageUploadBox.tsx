"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadBoxProps {
  imageSrc?: string | null;
  onImageSelect?: (file: File) => void; // Trả về File thật thay vì gọi hàm rỗng
  aspectRatio?: "square" | "video" | "cover";
  helperText?: string;
}

export function ImageUploadBox({
  imageSrc,
  onImageSelect,
  aspectRatio = "square",
  helperText = "(Kéo thả file hoặc bấm chọn, < 2MB)",
}: ImageUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    cover: "aspect-[21/6]",
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
    // Reset value để có thể chọn lại cùng 1 file nếu cần
    if (e.target) e.target.value = "";
  };

  return (
    <div className="w-full">
      {/* Input file bị ẩn */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={handleBoxClick}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 shadow-inner transition-all hover:border-amber-400 hover:bg-amber-50/50",
          aspectClass[aspectRatio]
        )}
      >
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              fill
              className="object-cover transition-opacity duration-300 group-hover:opacity-30"
              alt="Upload"
            />
            <div className="absolute inset-0 flex scale-95 transform flex-col items-center justify-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <UploadCloud className="text-primary mb-2 h-8 w-8" strokeWidth={2.5} />
              <span className="text-brand-dark rounded-full bg-white/80 px-3 py-1 text-xs font-black tracking-wider uppercase shadow-sm backdrop-blur-sm">
                Thay đổi
              </span>
            </div>
          </>
        ) : (
          <div className="space-y-2 p-6 text-center transition-transform duration-300 group-hover:scale-110">
            <UploadCloud
              className="group-hover:text-primary mx-auto mb-2 h-8 w-8 text-stone-300 transition-colors"
              strokeWidth={2.5}
            />
            <p className="group-hover:text-primary text-sm font-extrabold text-stone-400 transition-colors">
              Chọn ảnh +
            </p>
          </div>
        )}
      </div>
      {helperText && (
        <p className="mt-3 text-center text-[11px] font-medium text-stone-400 italic">
          {helperText}
        </p>
      )}
    </div>
  );
}
