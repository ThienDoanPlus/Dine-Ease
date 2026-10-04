"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  showBackButton?: boolean; // Cho phép hiển thị nút Back
  backUrl?: string; // Nếu không truyền, mặc định sẽ dùng router.back()
}

export function PageHeader({
  title,
  description,
  action,
  className,
  showBackButton = false,
  backUrl,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("mb-6 flex flex-col shrink-0", className)}>
      {/* Nút Back nằm trên title */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="text-stone-stone-500 hover:text-primary-hover group mb-4 flex w-fit items-center gap-2 font-bold transition-colors"
        >
          <div className="rounded-lg bg-stone-100 p-1.5 transition-colors group-hover:bg-amber-100">
            <ChevronLeft className="h-5 w-5" />
          </div>
          Quay lại
        </button>
      )}

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-brand-dark text-2xl font-black tracking-tight uppercase lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm font-medium text-stone-500">{description}</p>
          )}
        </div>
        {action && <div className="flex w-full items-center gap-4 md:w-auto">{action}</div>}
      </div>
    </div>
  );
}
