import React from "react";
import { cn } from "@/lib/utils";

// Kế thừa tất cả props của thẻ <select> chuẩn
interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; // Tiêu đề nhỏ phía trên select (optional)
  options: (string | { value: string; label: string })[];
}

export function FilterSelect({ label, options, className, ...props }: FilterSelectProps) {
  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      {label && (
        <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          {label}
        </span>
      )}
      <div className="relative w-full sm:w-auto">
        <select
          className={cn(
            "w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white px-4 py-2.5 pr-10 text-xs font-bold text-stone-700 outline-none focus:ring-2 focus:ring-amber-400 sm:w-auto transition-all hover:border-stone-300",
            className
          )}
          {...props}
        >
          {options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
        {/* Custom Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-stone-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
