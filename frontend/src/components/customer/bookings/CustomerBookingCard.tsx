import { cn, formatCurrency } from "@/lib/utils";
import { Star, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationResponse } from "@/types/customer";
import { useCreatePaymentUrl } from "@/hooks/useCustomer";

interface Props {
  data: ReservationResponse;
  onCancelClick?: (id: number) => void;
  onReviewClick?: (id: number) => void;
}

export function CustomerBookingCard({ data, onCancelClick, onReviewClick }: Props) {
  const isCanceled = data.status === "CANCELLED";
  const isPending = data.status === "PENDING";
  const isCompleted = data.status === "COMPLETE";

  const createPaymentMutation = useCreatePaymentUrl();

  const handlePayNow = async (id: number) => {
    const res = await createPaymentMutation.mutateAsync(id);
    if (res.paymentUrl) window.location.href = res.paymentUrl;
  };

  // Cấu hình Badge
  const badgeConfig: Record<string, { style: string; label: string }> = {
    PENDING: { style: "border-orange-200 bg-orange-50 text-orange-600", label: "Chờ xác nhận" },
    AWAITING_DEPOSIT: { style: "border-amber-200 bg-amber-50 text-amber-600", label: "Chờ thanh toán cọc" },
    CONFIRMED: { style: "border-blue-200 bg-blue-50 text-blue-600", label: "Đã xác nhận" },
    COMPLETE: { style: "border-green-200 bg-green-50 text-green-600", label: "Đã hoàn thành" },
    CANCELLED: { style: "border-red-200 bg-red-50 text-red-600", label: "Đã hủy" },
  };

  const badge = badgeConfig[data.status] || badgeConfig.PENDING;

  // Format giờ (Cắt bỏ phần giây :00 từ Backend)
  const timeDisplay = data.reservationTime ? data.reservationTime.slice(0, 5) : "--:--";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-[2rem] border p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-bottom-4 transition-all",
        isCanceled ? "bg-white/50 opacity-70 grayscale border-stone-100 hover:grayscale-0 hover:opacity-100" : 
        isPending ? "bg-white border-orange-100" : "bg-white border-stone-100"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-50 pb-4">
        <span className="text-xs font-black tracking-widest text-stone-400 uppercase">
          Mã đơn: <span className="text-[#2D2318]">#{data.id}</span>
        </span>
        <span className={cn("rounded-full border px-4 py-1.5 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5", badge.style)}>
          {isPending && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>}
          {badge.label}
        </span>
      </div>

      {/* Info Grid */}
      <div className={cn("grid grid-cols-1 gap-6 text-sm font-bold sm:grid-cols-2 lg:grid-cols-4", isCanceled && "text-stone-400")}>
        <div className={cn(isCanceled && "line-through")}>
          <p className="mb-1 text-[10px] text-stone-400 uppercase">Nhà hàng</p>
          {data.restaurantName}
        </div>
        <div className={cn(isCanceled && "line-through")}>
          <p className="mb-1 text-[10px] text-stone-400 uppercase">Thời gian</p>
          {timeDisplay} • {data.reservationDate}
        </div>
        
        {!isCanceled ? (
          <>
            <div>
              <p className="mb-1 text-[10px] text-stone-400 uppercase">Số người</p>
              {data.guestCount} Khách
            </div>
            <div>
              <p className="mb-1 text-[10px] text-stone-400 uppercase">Tiền cọc</p>
              <span className="text-amber-600">{formatCurrency(data.depositAmount || 0)}</span>
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <p className="mb-1 text-[10px] text-stone-400 uppercase">Ghi chú trạng thái</p>
            <span className="text-red-500 font-medium">
              {data.cancelReason ? `Lý do hủy: ${data.cancelReason}` : "Đơn đặt bàn này đã bị hủy."}
            </span>
          </div>
        )}
      </div>

      {/* Pay Now Section for Awaiting Deposit */}
      {data.status === "AWAITING_DEPOSIT" && (
        <div className="bg-amber-50 p-4 rounded-2xl flex items-center justify-between border border-amber-200">
          <p className="text-xs font-bold text-amber-800">
            Yêu cầu đã được duyệt! Vui lòng thanh toán cọc để giữ chỗ.
          </p>
          <Button 
            variant="customer" 
            size="sm" 
            onClick={() => handlePayNow(data.id)}
            disabled={createPaymentMutation.isPending}
          >
            Thanh toán ngay
          </Button>
        </div>
      )}

      {/* Footers / Buttons Action */}
      {!isCanceled && (
        <div className="border-t border-stone-50 pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          
          {/* [VÁ LỖ HỔNG UX]: Đổi giao diện nếu khách đã đánh giá rồi */}
          {isCompleted && !data.isReviewed && (
            <Button variant="customer" className="w-full rounded-xl sm:w-auto" onClick={() => onReviewClick?.(data.id)}>
              <Star className="mr-2 h-4 w-4" fill="currentColor" /> Đánh giá dịch vụ
            </Button>
          )}

          {isCompleted && data.isReviewed && (
            <Button variant="customer-outline" className="w-full rounded-xl sm:w-auto opacity-70 cursor-not-allowed border-stone-200 bg-stone-50" disabled>
              <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Đã đánh giá
            </Button>
          )}

          {(isPending || data.status === "CONFIRMED") && (
            <Button variant="customer-outline" className="w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 sm:w-auto" onClick={() => onCancelClick?.(data.id)}>
              <XCircle className="mr-2 h-4 w-4" /> Hủy đặt bàn
            </Button>
          )}

        </div>
      )}
    </div>
  );
}
