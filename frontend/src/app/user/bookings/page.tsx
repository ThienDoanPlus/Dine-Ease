"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/shared/ui/SegmentedControl";
import { CustomerBookingCard } from "@/components/customer/bookings/CustomerBookingCard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/customer/shared/StarRating";
import { Skeleton } from "@/components/ui/skeleton";

// Import API Hooks
import { useMyReservations, useCancelReservation, useSubmitReview } from "@/hooks/useCustomer";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "canceled">("upcoming");

  // --- API HOOKS ---
  const { data: responseData, isLoading } = useMyReservations(0, 50); // Lấy tối đa 50 đơn gần nhất
  const cancelMutation = useCancelReservation();
  const reviewMutation = useSubmitReview();

  // --- STATE CHO MODALS ---
  const [cancelModal, setCancelModal] = useState({ isOpen: false, id: 0, reason: "" });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, id: 0, rating: 5, comment: "" });

  const bookings = responseData?.content || [];

  // --- LỌC DỮ LIỆU THÔNG MINH ---
  const filteredBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      if (activeTab === "upcoming") return b.status === "PENDING" || b.status === "CONFIRMED";
      if (activeTab === "completed") return b.status === "COMPLETE";
      if (activeTab === "canceled") return b.status === "CANCELLED";
      return false;
    });
  }, [bookings, activeTab]);

  // --- HÀNH ĐỘNG: HỦY BÀN ---
  const handleConfirmCancel = () => {
    if (!cancelModal.reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy!");
      return;
    }
    cancelMutation.mutate(
      { id: cancelModal.id, cancelReason: cancelModal.reason },
      {
        onSuccess: () => {
          toast.success("Đã hủy đơn đặt bàn thành công.");
          setCancelModal({ isOpen: false, id: 0, reason: "" });
          setActiveTab("canceled"); // Tự động nhảy sang tab Đã hủy
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Không thể hủy đơn lúc này.");
        }
      }
    );
  };

  // --- HÀNH ĐỘNG: ĐÁNH GIÁ ---
  const handleConfirmReview = () => {
    if (!reviewModal.comment.trim()) {
      toast.error("Vui lòng nhập trải nghiệm của bạn!");
      return;
    }
    reviewMutation.mutate(
      { reservationId: reviewModal.id, rating: reviewModal.rating, comment: reviewModal.comment },
      {
        onSuccess: () => {
          toast.success("Cảm ơn bạn đã gửi đánh giá!");
          setReviewModal({ isOpen: false, id: 0, rating: 5, comment: "" });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi gửi đánh giá.");
        }
      }
    );
  };

  return (
    <div>
      <h1 className="mb-8 text-4xl font-black tracking-tight text-[#2D2318]">Đơn đặt bàn của tôi</h1>
      
      <div className="mb-8">
        <SegmentedControl
          variant="pill"
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          options={[
            { value: "upcoming", label: "Sắp tới" },
            { value: "completed", label: "Đã hoàn thành" },
            { value: "canceled", label: "Đã hủy" }
          ]}
        />
      </div>

      {/* RENDER DỮ LIỆU */}
      <div className="space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[200px] w-full rounded-[2rem]" />
            <Skeleton className="h-[200px] w-full rounded-[2rem]" />
          </>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <CustomerBookingCard 
              key={booking.id} 
              data={booking} 
              onCancelClick={(id) => setCancelModal({ isOpen: true, id, reason: "" })}
              onReviewClick={(id) => setReviewModal({ isOpen: true, id, rating: 5, comment: "" })}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-stone-500">
            <p className="text-lg font-bold">Chưa có đơn đặt bàn nào.</p>
            <p className="text-sm">Bạn không có đơn nào trong danh sách này.</p>
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* MODAL 1: XÁC NHẬN HỦY BÀN */}
      {/* ===================================================== */}
      <Dialog open={cancelModal.isOpen} onOpenChange={(open) => !open && setCancelModal({...cancelModal, isOpen: false})}>
        <DialogContent className="sm:max-w-md p-8 rounded-[2.5rem] border-stone-100">
          <DialogTitle className="text-2xl font-black text-[#2D2318] mb-2">Hủy đặt bàn</DialogTitle>
          <p className="text-sm text-stone-500 mb-6">Bạn có chắc chắn muốn hủy? Vui lòng cho chúng tôi biết lý do để cải thiện dịch vụ tốt hơn.</p>
          
          <textarea
            rows={4}
            value={cancelModal.reason}
            onChange={(e) => setCancelModal({...cancelModal, reason: e.target.value})}
            placeholder="Lý do hủy (Thay đổi lịch trình, bận việc đột xuất...)"
            className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20"
          />

          <div className="mt-8 flex gap-3">
            <Button variant="customer-outline" size="customer" className="flex-1 py-3 h-auto rounded-xl" onClick={() => setCancelModal({...cancelModal, isOpen: false})}>Đóng</Button>
            <Button variant="customer" size="customer" className="flex-1 py-3 h-auto rounded-xl !bg-red-500 hover:!bg-red-600 shadow-red-200" onClick={handleConfirmCancel} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? "Đang xử lý..." : "Xác nhận Hủy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================================================== */}
      {/* MODAL 2: ĐÁNH GIÁ DỊCH VỤ */}
      {/* ===================================================== */}
      <Dialog open={reviewModal.isOpen} onOpenChange={(open) => !open && setReviewModal({...reviewModal, isOpen: false})}>
        <DialogContent className="sm:max-w-lg p-8 rounded-[2.5rem] border-stone-100 text-center">
          <DialogTitle className="text-2xl font-black text-[#2D2318] mb-2">Đánh giá trải nghiệm</DialogTitle>
          <p className="text-sm text-stone-500 mb-6">Trải nghiệm bữa ăn của bạn thế nào? Hãy chia sẻ nhé!</p>
          
          <div className="flex justify-center mb-8">
            <StarRating 
              rating={reviewModal.rating} 
              maxStars={5} 
              size="lg" 
              readonly={false} // Cho phép người dùng bấm chọn
              onChange={(rating) => setReviewModal({...reviewModal, rating})}
            />
          </div>

          <textarea
            rows={4}
            value={reviewModal.comment}
            onChange={(e) => setReviewModal({...reviewModal, comment: e.target.value})}
            placeholder="Chia sẻ thêm về món ăn, không gian, thái độ phục vụ..."
            className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20"
          />

          <div className="mt-8">
            <Button variant="customer" size="customer" className="w-full" onClick={handleConfirmReview} disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
