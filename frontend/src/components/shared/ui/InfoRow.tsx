import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  valueClassName?: string;
  className?: string;
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName = "text-brand-dark",
  className,
}: InfoRowProps) {
  return (
    <div className={cn("flex items-center gap-3 text-stone-600", className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
        <Icon className="h-4 w-4 text-stone-500" strokeWidth={2} />
      </div>
      <div className="overflow-hidden">
        <p className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">{label}</p>
        <p className={cn("truncate text-sm font-semibold", valueClassName)}>{value || "---"}</p>
      </div>
    </div>
  );
}
