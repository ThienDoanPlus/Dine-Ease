"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

import { BookingStatus } from "@/components/restaurant/reservations/types";
import { KanbanBoard } from "@/components/restaurant/reservations/KanbanBoard";
import { PageHeader } from "@/components/shared/ui/PageHeader";

// Dùng debounce để không gọi API liên tục khi gõ phím
import { useDebounce } from "use-debounce"; 

export default function ReservationManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500); // Đợi 0.5s sau khi ngừng gõ mới search
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // =========================================================
  // 1. FETCH KANBAN DATA (GỌI API MỚI)
  // =========================================================
  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ["manage-reservations-kanban", debouncedSearch, targetDate],
    queryFn: async () => {
      const res: any = await api.get(`/manage/reservations/kanban?keyword=${debouncedSearch}&date=${targetDate}`);
      
      const formatTime = (b: any) => ({ ...b, reservationTime: b.reservationTime?.substring(0, 5) });
      
      return {
        pending: (res.pending || []).map(formatTime),
        confirmed: (res.confirmed || []).map(formatTime),
        finalCol: (res.finalCol || []).map(formatTime),
      };
    },
  });

  const pendingCol = kanbanData?.pending || [];
  const confirmedCol = kanbanData?.confirmed || [];
  const finalCol = kanbanData?.finalCol || [];

  // Lấy dữ liệu Bàn trống
  const { data: tablesData } = useQuery({
    queryKey: ["manage-tables-assign"],
    queryFn: async () => await api.get("/manage/tables"),
  });
  const availableTables = (Array.isArray(tablesData) ? tablesData : []).filter((t: any) => t.status === "AVAILABLE");

  // Mutation Cập nhật trạng thái
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => await api.patch(`/manage/reservations/${id}/status`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manage-reservations-kanban"] }),
  });

  const updateStatus = (id: number, newStatus: BookingStatus) => {
    updateStatusMutation.mutate({ id, payload: { status: newStatus } }, {
      onSuccess: () => {
        toast.success("Đã cập nhật trạng thái");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái.");
      }
    });
  };

  const assignTable = (tableId: number, tableName: string) => {
    if (selectedBookingId) {
      updateStatusMutation.mutate({ id: selectedBookingId, payload: { status: "CHECKED_IN", tableId } }, {
        onSuccess: () => { toast.success(`Đã xếp khách vào ${tableName}`); setIsAssignModalOpen(false); },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Lỗi khi xếp bàn cho khách.");
          setIsAssignModalOpen(false); 
        }
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col p-6 lg:p-8">
      <PageHeader 
        title="Quản lý Đặt bàn" 
        description="Theo dõi và điều phối khách hàng đặt trước." 
        action={
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="group relative w-full md:w-80">
              <Search 
                className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors" 
                strokeWidth={2.5} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên khách hàng..."
                className="w-full rounded-2xl border border-stone-200 bg-white py-2.5 pr-4 pl-11 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase whitespace-nowrap">
                Ngày:
              </span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-stone-700 outline-none cursor-pointer"
              />
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-20 text-center font-medium text-stone-500">Đang tải dữ liệu Kanban...</div>
      ) : (
        <KanbanBoard 
          pendingBookings={pendingCol} 
          confirmedBookings={confirmedCol} 
          finalBookings={finalCol} 
          onUpdateStatus={updateStatus} 
          onAssignTable={(id) => { setSelectedBookingId(id); setIsAssignModalOpen(true); }} 
        />
      )}

      {/* Modal Chọn bàn */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl">
          <DialogTitle className="mb-4 text-xl font-black text-brand-dark">Chọn bàn trống</DialogTitle>
          <div className="grid grid-cols-3 gap-2">
            {availableTables.map(t => (
              <button key={t.id} onClick={() => assignTable(t.id, t.tableName)} className="border p-3 rounded-xl hover:border-amber-400 font-bold">
                {t.tableName}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
