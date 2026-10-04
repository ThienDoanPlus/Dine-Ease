// src/app/user/checkout/[bookingId]/step3/page.tsx
"use client";

import React, { useState, use } from "react";
import { ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookingStepIndicator } from "@/components/customer/shared/BookingStepIndicator";
import { CheckoutRestaurantBanner } from "@/components/customer/shared/CheckoutRestaurantBanner";
import { formatCurrency } from "@/lib/utils";

// THÊM IMPORT useRouter
import { useRouter } from "next/navigation"; 

import { useBookingStore } from "@/store/useBookingStore";
import { useCreateReservation, useCreatePaymentUrl } from "@/hooks/useCustomer";

export default function CheckoutStep3({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter(); // KHỞI TẠO ROUTER

  const { 
    restaurantId, restaurantName, depositAmount, 
    reservationDate, reservationTime, guestCount, notes 
  } = useBookingStore();

  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  const createBookingMutation = useCreateReservation();
  const createPaymentMutation = useCreatePaymentUrl();

  const handlePay = async () => {
    if (paymentMethod !== "vnpay") {
      toast.error("Vui lòng chọn VNPay. Các phương thức khác đang bảo trì!");
      return;
    }

    try {
      // 1. TẠO ĐƠN ĐẶT BÀN TRƯỚC (Lấy được ID thật)
      const reservation = await createBookingMutation.mutateAsync({
        restaurantId,
        reservationDate,
        reservationTime,
        guestCount,
        notes
      });

      toast.success("Tạo đơn đặt bàn thành công! Đang xử lý thanh toán...");

      // 2. KIỂM TRA PHÂN LUỒNG TỪ BACKEND
      if (reservation.status === "PENDING") {
        // Đơn phức tạp -> Không gọi VNPay, đẩy thẳng về trang thành công chờ duyệt
        toast.success("Yêu cầu đã được gửi. Nhà hàng sẽ sớm phản hồi ghi chú của bạn!");
        router.push(`/user/checkout/${reservation.id}/success?mode=review`); 
        return;
      }

      // 3. Đơn đơn giản (AWAITING_DEPOSIT) -> Tiến hành lấy link VNPay như cũ
      const vnpayRes = await createPaymentMutation.mutateAsync(reservation.id);
      if (vnpayRes.paymentUrl) {
        window.location.href = vnpayRes.paymentUrl;
      } else {
        router.push(`/user/checkout/${reservation.id}/success`);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Hết bàn hoặc lỗi hệ thống!");
    }
  };

  const isProcessing = createBookingMutation.isPending || createPaymentMutation.isPending;

  return (
    <div className="relative pb-32">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <BookingStepIndicator currentStep={2} />
        <CheckoutRestaurantBanner restaurantName={restaurantName || "Đang tải..."} imageUrl="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=2000" />

        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-xl font-black">Thanh toán chi tiết</h2>
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <p className="text-sm font-bold text-stone-500 uppercase">Tiền đặt cọc giữ chỗ</p>
              <span className="text-4xl font-black text-amber-600">{formatCurrency(depositAmount)}</span>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-black">Phương thức thanh toán</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* VNPay Option */}
              <label className={`cursor-pointer rounded-3xl border-2 p-6 transition-all ${paymentMethod === "vnpay" ? "border-amber-400 bg-amber-50" : "bg-white"}`}>
                <input type="radio" name="pay" checked={paymentMethod === "vnpay"} onChange={() => setPaymentMethod("vnpay")} className="absolute right-4 top-4 h-5 w-5 text-amber-500" />
                <span className="text-lg font-black text-amber-600">VNPay</span>
              </label>
              
              {/* Card (Vô hiệu hóa) */}
              <label className="cursor-pointer rounded-3xl border-2 p-6 bg-white opacity-50 grayscale">
                <input type="radio" name="pay" disabled className="absolute right-4 top-4 h-5 w-5" />
                <span className="text-lg font-black text-stone-600">Thẻ Quốc Tế (Bảo trì)</span>
              </label>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-100 bg-white/90 px-6 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-xs font-black text-stone-400 uppercase">Cần thanh toán</p>
            <p className="text-3xl font-black text-[#2D2318]">{formatCurrency(depositAmount)}</p>
          </div>
          <Button variant="customer-dark" size="customer" onClick={handlePay} disabled={isProcessing} className="w-full sm:w-auto">
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Đang xử lý...
              </>
            ) : (
              <>
                Thanh toán qua VNPay <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
