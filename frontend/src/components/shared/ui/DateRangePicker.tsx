import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onClear?: () => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  className,
  placeholder = "Chọn khoảng thời gian",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const displayText =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : placeholder;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:border-amber-400",
          className
        )}
      >
        <CalendarDays className="h-4 w-4 text-stone-400" strokeWidth={2} />
        <span className="text-sm font-medium text-stone-700">{displayText}</span>
        <ChevronDown className="h-4 w-4 text-stone-400" strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-stone-100 bg-white p-5 shadow-xl">
          <h3 className="text-brand-dark mb-4 text-sm font-bold tracking-widest uppercase">
            Chọn khoảng thời gian
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-700 outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-700 outline-none focus:border-amber-400"
              />
            </div>

            <div className="mt-2 flex gap-2">
              {onClear && (
                <button
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-50"
                >
                  Xóa
                </button>
              )}
              <button
                onClick={() => {
                  onApply();
                  setIsOpen(false);
                }}
                className="bg-brand-dark hover:bg-brand-dark-hover flex-[2] rounded-xl py-2.5 text-sm font-bold text-white transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
