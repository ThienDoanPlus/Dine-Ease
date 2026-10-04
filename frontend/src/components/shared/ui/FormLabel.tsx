import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  icon?: LucideIcon;
  required?: boolean;
}

export function FormLabel({ label, icon: Icon, required, className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-1.5 text-xs font-black tracking-widest text-stone-500 uppercase",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}
