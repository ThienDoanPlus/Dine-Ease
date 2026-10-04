import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeColor = "amber" | "indigo" | "emerald" | "rose" | "stone";

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  colorTheme?: ThemeColor;
  className?: string;
}

const themeStyles: Record<ThemeColor, string> = {
  amber: "bg-amber-50 text-primary-hover",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  stone: "bg-stone-50 text-stone-500",
};

export function SectionHeader({
  title,
  icon: Icon,
  colorTheme = "amber",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-center gap-3", className)}>
      <div
        className={cn("rounded-xl p-2.5 transition-colors duration-300", themeStyles[colorTheme])}
      >
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <h2 className="text-brand-dark text-sm leading-none font-extrabold tracking-widest uppercase">
        {title}
      </h2>
    </div>
  );
}
