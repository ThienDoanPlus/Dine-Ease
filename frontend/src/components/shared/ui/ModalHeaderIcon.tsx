import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeColor = "amber" | "red" | "green" | "blue";

interface ModalHeaderIconProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  colorTheme?: ThemeColor;
  isRounded?: boolean; // Bo tròn (như trang Xuất file) hoặc bo góc vuông (như trang Settings)
}

const themeStyles: Record<ThemeColor, string> = {
  amber: "bg-amber-50 text-primary-hover border-amber-100",
  red: "bg-red-50 text-red-500 border-red-100",
  green: "bg-green-50 text-green-600 border-green-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
};

export function ModalHeaderIcon({
  title,
  description,
  icon: Icon,
  colorTheme = "amber",
  isRounded = false,
}: ModalHeaderIconProps) {
  return (
    <DialogHeader
      className={cn(
        "flex flex-row items-start gap-4 space-y-0 border-b border-stone-100 p-6 text-left md:p-8",
        !description && "items-center"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border",
          isRounded
            ? "mx-auto mb-4 h-16 w-16 rounded-full"
            : "h-12 w-12 rounded-2xl md:h-14 md:w-14",
          themeStyles[colorTheme]
        )}
      >
        <Icon className={cn(isRounded ? "h-8 w-8" : "h-6 w-6 md:h-8 md:w-8")} strokeWidth={2.5} />
      </div>
      <div className={cn(isRounded && "w-full text-center")}>
        <DialogTitle className="text-brand-dark text-xl font-black tracking-tight uppercase md:text-2xl">
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="mt-2 text-sm leading-relaxed font-medium text-stone-500">
            {description}
          </DialogDescription>
        )}
      </div>
    </DialogHeader>
  );
}
