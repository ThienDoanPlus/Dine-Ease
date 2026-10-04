import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase border",
  {
    variants: {
      variant: {
        success: "bg-emerald-50 text-emerald-600 border-emerald-200",
        warning: "bg-amber-50 text-primary-hover border-amber-200",
        danger: "bg-rose-50 text-rose-600 border-rose-200",
        info: "bg-blue-50 text-blue-600 border-blue-200",
        default: "bg-stone-100 text-stone-500 border-stone-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const dotVariants = cva("w-1.5 h-1.5 rounded-full", {
  variants: {
    variant: {
      success: "bg-emerald-500",
      warning: "bg-primary",
      danger: "bg-rose-500",
      info: "bg-blue-500",
      default: "bg-stone-400",
    },
    pulse: {
      true: "animate-pulse",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  label: string;
  pulse?: boolean;
}

export function StatusBadge({ label, variant, pulse, className, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      <span className={cn(dotVariants({ variant, pulse }))}></span>
      {label}
    </span>
  );
}
