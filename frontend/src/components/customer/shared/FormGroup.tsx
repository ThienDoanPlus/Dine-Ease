import React from "react";
import { cn } from "@/lib/utils";

interface FormGroupProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ label, required, children, className }: FormGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="ml-1 block text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {/* Nơi chứa <Input> hoặc <textarea> */}
      {children}
    </div>
  );
}
