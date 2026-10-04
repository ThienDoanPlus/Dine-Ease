// src/app/user/checkout/[bookingId]/step2/page.tsx
"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookingStepIndicator } from "@/components/customer/shared/BookingStepIndicator";
import { BookingSummaryCard } from "@/components/customer/shared/BookingSummaryCard";
import { PublicFooter } from "@/components/customer/layouts/PublicFooter";
import { CheckoutRestaurantBanner } from "@/components/customer/shared/CheckoutRestaurantBanner";
import { FormGroup } from "@/components/customer/shared/FormGroup";

// Import Zustand Store và Auth Context
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthContext } from "@/providers/AuthProvider";

export default function CheckoutStep2({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const { user } = useAuthContext(); // Lấy thông tin user đang đăng nhập
  
  // Đọc dữ liệu từ Zustand
  const { restaurantName, reservationDate, reservationTime, guestCount, notes, setBookingInfo } = useBookingStore();

  const [localNote, setLocalNote] = useState(notes);

  const handleNext = () => {
    // Lưu notes vào Zustand
    setBookingInfo({ notes: localNote });
    
    // SỬA LỖI: Truyền ID động từ URL thay vì hardcode chữ "new"
    router.push(`/user/checkout/${bookingId}/step3`);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <BookingStepIndicator currentStep={1} />

        <CheckoutRestaurantBanner
          restaurantName={restaurantName || "Đang tải..."}
          imageUrl="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=2000"
          showBackButton={true}
          onBackClick={() => router.back()}
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left: Summary */}
          <div className="space-y-6 lg:col-span-4">
            <h2 className="text-2xl font-bold text-stone-800">Thông tin khách hàng</h2>
            <BookingSummaryCard 
              time={reservationTime?.slice(0, 5) || ""} // Bỏ :00 giây cho đẹp
              date={reservationDate} 
              guests={guestCount} 
              onEditClick={() => router.back()} 
            />
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-stone-100 bg-white p-8 shadow-sm">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormGroup label="Tên khách hàng" required>
                    <Input disabled variant="customer" size="customer" value={user?.fullName || ""} />
                  </FormGroup>

                  <FormGroup label="Số điện thoại" required>
                    <Input disabled type="tel" variant="customer" size="customer" value={user?.phone || ""} />
                  </FormGroup>
                </div>

                <FormGroup label="Địa chỉ Email">
                  <Input disabled type="email" variant="customer" size="customer" value={user?.email || ""} />
                </FormGroup>

                <FormGroup label="Ghi chú cho nhà hàng">
                  <textarea
                    rows={4}
                    value={localNote}
                    onChange={(e) => setLocalNote(e.target.value)}
                    placeholder="Ví dụ: Cần chuẩn bị ghế trẻ em, bàn gần cửa sổ..."
                    className="w-full resize-none rounded-2xl border border-stone-100 bg-stone-50 p-4 font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20"
                  />
                </FormGroup>

                <div className="pt-6">
                  <Button variant="customer" size="customer" className="w-full" onClick={handleNext}>
                    Xác nhận & Tiếp tục <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter variant="mini" />
    </>
  );
}
