"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBookingStore } from "@/store/useBookingStore";
import { toast } from "sonner";
import { generateDynamicTimeSlots, getVietnameseDayName } from "@/lib/utils";


interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number; 
  restaurantName: string;
  depositAmount: number; 
}

export function BookingModal({ isOpen, onClose, restaurantId, restaurantName, depositAmount }: BookingModalProps) {
  const router = useRouter();
  const setBookingInfo = useBookingStore((state) => state.setBookingInfo);

  // --- STATES ---
  const [step, setStep] = useState(0); // 0: Date, 1: Pax, 2: Time
  const [date, setDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date()); // Dùng để render Lịch
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [time, setTime] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- LOGIC LỊCH (CALENDAR) ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };


  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      if (!time) {
        toast.error("Vui lòng chọn khung giờ!");
        return;
      }

      // Format Date thành YYYY-MM-DD chuẩn cho Spring Boot
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      // Format Time thành HH:mm:ss chuẩn cho Spring Boot (thêm :00)
      const formattedTime = `${time}:00`;

      // Lưu vào Zustand Store
      setBookingInfo({
        restaurantId,
        restaurantName,
        depositAmount,
        reservationDate: `${yyyy}-${mm}-${dd}`,
        reservationTime: formattedTime,
        guestCount: adults + children,
      });

      onClose();
      // Điều hướng sang Step 2. Mọi thông tin đã được giấu an toàn trong Zustand
      router.push(`/user/checkout/new/step2`);
    }
  };

  // --- MOCK DỮ LIỆU GIỜ ---
  const TIME_SLOTS = {
    morning: ["07:30", "08:00", "08:30", "09:00"],
    afternoon: ["12:30", "13:00", "13:30", "14:00"],
    evening: ["18:30", "19:00", "19:30", "20:00"],
  };

  // ==========================================================
  // [VÁ LỖ HỔNG UX]: HÀM KIỂM TRA GIỜ ĐÃ QUA TRONG NGÀY
  // ==========================================================
  const isSlotDisabled = (timeStr: string) => {
    // Nếu chọn ngày trong tương lai -> Giờ nào cũng rảnh
    if (date > today) return false;

    // Nếu chọn ngày hôm nay -> Phải so sánh giờ
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    
    // Đổi tất cả ra phút để dễ so sánh. Thêm 30 phút Buffer (thời gian chuẩn bị bàn)
    const slotTotalMinutes = hours * 60 + minutes;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + 30;

    return slotTotalMinutes <= currentTotalMinutes;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-6">
          <h2 className="font-heading text-2xl font-extrabold text-[#2D2318]">Đặt bàn</h2>
          <button onClick={onClose} className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <Tabs 
          value={step.toString()} 
          onValueChange={(val) => setStep(Number(val))} 
          className="w-full"
        >
          {/* Tabs / Steps */}
          <TabsList variant="block">
            <TabsTrigger value="0">Ngày</TabsTrigger>
            <TabsTrigger value="1">Số người</TabsTrigger>
            <TabsTrigger value="2">Thời gian</TabsTrigger>
          </TabsList>

          {/* Body Content */}
          <div className="min-h-[420px] p-8">
            <TabsContent value="0" className="m-0 mt-0">
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <CalendarDays className="h-6 w-6 text-amber-500" />
                  <span className="text-lg font-bold text-stone-800">
                    {date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="text-center">
                  <div className="mb-4 flex items-center justify-between px-4">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="rounded-lg p-2 text-stone-400 hover:bg-stone-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-black uppercase text-stone-800">
                      Tháng {month + 1}, {year}
                    </h3>
                    <button
                      onClick={() => changeMonth(1)}
                      className="rounded-lg p-2 text-stone-400 hover:bg-stone-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-2 grid grid-cols-7 text-[10px] font-bold uppercase text-stone-400">
                    <span>CN</span>
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="py-2"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const d = i + 1;
                      const currentObj = new Date(year, month, d);
                      const isPast = currentObj < today;
                      const isSelected =
                        date.getDate() === d &&
                        date.getMonth() === month &&
                        date.getFullYear() === year;

                      if (isPast) {
                        return (
                          <div
                            key={d}
                            className="py-2 text-sm font-medium text-stone-200 cursor-not-allowed"
                          >
                            {d}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={d}
                          onClick={() => setDate(currentObj)}
                          className={cn(
                            "rounded-xl py-2 font-bold transition-all",
                            isSelected
                              ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                              : "text-stone-600 hover:bg-amber-100"
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="1" className="m-0 mt-0">
              <div className="space-y-8 py-8 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-[#2D2318]">Người lớn</p>
                    <p className="mt-1 text-sm italic text-stone-400">Trên 12 tuổi</p>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-1.5 shadow-sm">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="h-10 w-10 rounded-xl bg-white font-bold text-stone-600 shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xl font-black text-[#2D2318]">
                      {adults}
                    </span>
                    <button
                      onClick={() => setAdults(Math.min(20, adults + 1))}
                      className="h-10 w-10 rounded-xl bg-white font-bold text-stone-600 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-[#2D2318]">Trẻ em</p>
                    <p className="mt-1 text-sm italic text-stone-400">Dưới 12 tuổi</p>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-1.5 shadow-sm">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="h-10 w-10 rounded-xl bg-white font-bold text-stone-600 shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xl font-black text-[#2D2318]">
                      {children}
                    </span>
                    <button
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="h-10 w-10 rounded-xl bg-white font-bold text-stone-600 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="2" className="m-0 mt-0">
              <div className="custom-scrollbar max-h-[350px] space-y-8 overflow-y-auto animate-in fade-in pr-2">
                {Object.entries(TIME_SLOTS).map(([period, slots], idx) => (
                  <div key={period}>
                    <h4 className="mb-4 text-left text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {idx === 0 ? "Sáng" : idx === 1 ? "Trưa" : "Tối"}
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {slots.map((t) => {
                        // Gọi hàm kiểm tra
                        const disabled = isSlotDisabled(t);
                        
                        return (
                          <button
                            key={t}
                            onClick={() => !disabled && setTime(t)}
                            disabled={disabled}
                            className={cn(
                              "rounded-xl border py-3 font-bold transition-all",
                              disabled 
                                ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed line-through" 
                                : time === t
                                  ? "border-cyan-400 bg-cyan-400 text-white shadow-lg shadow-cyan-400/30"
                                  : "border-stone-200 text-stone-600 hover:border-amber-500"
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end border-t border-stone-100 p-6">
          <button 
            onClick={handleNext} 
            className={cn(
              "rounded-xl px-10 py-4 font-black transition-all active:scale-95",
              step === 2 
                ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:from-amber-600 hover:to-orange-500 shadow-lg shadow-amber-500/30 border border-transparent" 
                : "bg-transparent border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
            )}
          >
            {step === 2 ? "Hoàn tất" : "Tiếp tục"}
          </button>
        </div>
      </div>
    </div>
  );
}
