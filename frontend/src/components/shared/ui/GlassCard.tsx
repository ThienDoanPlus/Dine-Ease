import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean; // Tùy chọn bỏ padding nếu muốn chứa Table hoặc Image full viền
}

export function GlassCard({ children, className, noPadding = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel overflow-hidden rounded-4xl",
        !noPadding && "p-6 md:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
