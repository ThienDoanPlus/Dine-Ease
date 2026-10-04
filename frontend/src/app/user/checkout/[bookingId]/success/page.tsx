"use client";

import React, { useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Info, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStepIndicator } from "@/components/customer/shared/BookingStepIndicator";
import { PublicFooter } from "@/components/customer/layouts/PublicFooter";

// Import Zustand
import { useBookingStore } from "@/store/useBookingStore";

export default function CheckoutSuccess({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restaurantName, reservationTime, reservationDate, guestCount, clearBooking } = useBookingStore();

  const isReviewMode = searchParams.get("mode") === "review";

  useEffect(() => {
    // Dọn dẹp giỏ hàng tạm khi vào trang success, nhưng dùng setTimeout 
    // để UI render tên quán kịp trước khi biến mất.
    const timer = setTimeout(() => {
      clearBooking();
    }, 5000);
    return () => clearTimeout(timer);
  }, [clearBooking]);

  return (
    <>
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center px-6 py-12">
        <BookingStepIndicator currentStep={3} />

        <div className="space-y-6 text-center">
          <div className="relative inline-block">
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="h-10 w-10" strokeWidth={3} />
            </div>
            <div className="success-pulse absolute inset-0 rounded-full bg-green-400/20"></div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">
              {isReviewMode ? "Yêu cầu đã gửi!" : "Đặt bàn thành công!"}
            </h2>
            <p className="font-bold text-stone-500">
              {isReviewMode 
                ? "Nhà hàng đang kiểm tra các yêu cầu đặc biệt của bạn. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả." 
                : `Mã đơn hàng: #${bookingId}`}
            </p>
          </div>
        </div>

        <div className="mt-10 w-full rounded-[32px] border border-stone-100 bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase">Tên nhà hàng</p>
              <p className="font-black text-stone-800">{restaurantName || "Dine Ease Partner"}</p>
            </div>
            <div className="border-t border-stone-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="text-[10px] font-black text-stone-400 uppercase">Thời gian</p>
              <p className="font-black text-stone-800">{reservationTime.slice(0, 5)} • {reservationDate}</p>
            </div>
            <div className="border-t border-stone-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="text-[10px] font-black text-stone-400 uppercase">Số người</p>
              <p className="font-black text-stone-800">{guestCount} Khách</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <Button variant="customer" size="customer" onClick={() => router.push("/user/bookings")} className="flex-1 shadow-xl">
            <Calendar className="h-5 w-5 mr-2" /> Xem lịch sử
          </Button>
          <Button variant="customer-outline" size="customer" onClick={() => router.push("/")} className="flex-1 font-black">
            <ArrowLeft className="h-5 w-5 mr-2" /> Trang chủ
          </Button>
        </div>
      </main>

      <PublicFooter variant="mini" />
    </>
  );
}
