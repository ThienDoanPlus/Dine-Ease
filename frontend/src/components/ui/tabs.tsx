"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

// 1. CHỈNH SỬA LẠI STYLE MẶC ĐỊNH CỦA TABSLIST (Bọc ngoài)
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-start rounded-2xl p-1.5 gap-1 transition-all",
  {
    variants: {
      variant: {
        // Giao diện mặc định (Dùng cho Admin Detail, Restaurant Settings)
        default: "bg-white/80 backdrop-blur-sm border border-stone-100 shadow-sm",
        // Giao diện gạch dưới (Dùng nếu cần, VD: trong Notifications)
        line: "bg-transparent border-b border-stone-200 rounded-none p-0 gap-4",
        // THÊM MỚI: Dành cho Menu (dạng viên thuốc)
        pill: "bg-transparent p-0 gap-3", 
        // THÊM MỚI: Dành cho Modal (dạng khối vuông full width)
        block: "w-full rounded-none p-0 gap-0 bg-stone-50", 
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      // THÊM: no-scrollbar và overflow-x-auto để cuộn ngang trên mobile/màn hình hẹp
      className={cn(tabsListVariants({ variant }), "no-scrollbar overflow-x-auto flex-nowrap", className)}
      {...props}
    />
  );
}

// 2. CHỈNH SỬA LẠI STYLE MẶC ĐỊNH CỦA TABSTRIGGER (Nút bấm)
function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // Cấu hình Base chung
        "relative inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-bold transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50",

        // --- STYLE CHO VARIANT DEFAULT (Nút bo tròn) ---
        "group-data-[variant=default]/tabs-list:rounded-xl group-data-[variant=default]/tabs-list:px-6 group-data-[variant=default]/tabs-list:py-2.5",
        // Trạng thái bình thường
        "group-data-[variant=default]/tabs-list:hover:text-brand-dark group-data-[variant=default]/tabs-list:text-stone-500 group-data-[variant=default]/tabs-list:hover:bg-stone-50",
        // Trạng thái Active (Sử dụng bg-brand-dark tương đương #2D2318)
        "group-data-[variant=default]/tabs-list:data-active:bg-brand-dark group-data-[variant=default]/tabs-list:data-active:text-white group-data-[variant=default]/tabs-list:data-active:shadow-md",

        // --- STYLE CHO VARIANT LINE (Gạch dưới) ---
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:py-3 group-data-[variant=line]/tabs-list:text-stone-500",
        "group-data-[variant=line]/tabs-list:data-active:text-primary-hover group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "after:bg-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:opacity-0 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",

        // --- VARIANT PILL (THÊM MỚI) ---
        "group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-6 group-data-[variant=pill]/tabs-list:py-2 group-data-[variant=pill]/tabs-list:border group-data-[variant=pill]/tabs-list:border-stone-200 group-data-[variant=pill]/tabs-list:bg-white group-data-[variant=pill]/tabs-list:text-stone-600 group-data-[variant=pill]/tabs-list:hover:bg-amber-50",
        "group-data-[variant=pill]/tabs-list:data-active:bg-primary group-data-[variant=pill]/tabs-list:data-active:text-white group-data-[variant=pill]/tabs-list:data-active:border-primary group-data-[variant=pill]/tabs-list:data-active:shadow-md",

        // --- VARIANT BLOCK (THÊM MỚI) ---
        "group-data-[variant=block]/tabs-list:flex-1 group-data-[variant=block]/tabs-list:rounded-none group-data-[variant=block]/tabs-list:py-4 group-data-[variant=block]/tabs-list:border-l group-data-[variant=block]/tabs-list:border-stone-200 group-data-[variant=block]/tabs-list:uppercase group-data-[variant=block]/tabs-list:text-stone-400",
        "group-data-[variant=block]/tabs-list:data-active:bg-[#1e293b] group-data-[variant=block]/tabs-list:data-active:text-white group-data-[variant=block]/tabs-list:data-active:border-[#1e293b]",

        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
