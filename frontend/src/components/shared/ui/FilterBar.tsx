import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string; // Bá»• sung className
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "TÃ¬m kiáº¿m...",
  children,
  className, // Nháº­n className
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "glass-panel relative z-10 flex flex-col justify-between gap-4 rounded-3xl p-4 md:rounded-4xl md:p-5 lg:flex-row lg:items-center",
        className
      )}
    >
      {/* Search Input */}
      <div className="group relative w-full shrink-0 lg:w-96">
        <Search
          className="group-focus-within:text-primary absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone-400 transition-colors"
          strokeWidth={2.5}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pr-4 pl-12 text-sm font-medium transition-all outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Right side Filters (Selects, Buttons) */}
      {children && (
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
