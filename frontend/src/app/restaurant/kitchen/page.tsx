"use client";

import React, { useState, useMemo } from "react";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { SegmentedControl } from "@/components/shared/ui/SegmentedControl";
import { KitchenOrder, OrderStatus } from "@/components/restaurant/kitchen/types";
import { KitchenTicket } from "@/components/restaurant/kitchen/KitchenTicket";
import { PrintReceiptModal } from "@/components/restaurant/kitchen/PrintReceiptModal";

// KẾT NỐI API
import { useGetKitchenTickets, useUpdateKitchenItemStatus } from "@/hooks/useOrder";

export default function KitchenPage() {
  const { data: ticketsData, isLoading, isFetching } = useGetKitchenTickets();
  const updateItemStatusMutation = useUpdateKitchenItemStatus(); // Đã đổi tên hook

  const orders: any[] = (ticketsData as any[]) || [];   
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("pending");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);

  // Đã sửa: Cập nhật trạng thái TỪNG MÓN LẺ
  const updateItemStatus = (itemId: number, newStatus: OrderStatus) => {
    updateItemStatusMutation.mutate({ itemId, status: newStatus }, {
      onSuccess: () => {
        if (newStatus === "cooking") toast.success(`Đã nhận nấu món!`);
        if (newStatus === "ready") toast.success(`Món đã hoàn tất!`);
      },
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o: KitchenOrder) => activeTab === "all" || o.status === activeTab);
  }, [orders, activeTab]);

  return (
    <div className="bg-app-bg flex h-full flex-col p-6 lg:p-8 no-print">
      <PageHeader 
        title="Quản lý Bếp (KOT)" 
        description="Nhận món, in phiếu bếp và cập nhật trạng thái chế biến." 
        action={
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* ĐƯA THANH ĐIỀU HƯỚNG VÀO ĐÂY */}
            <SegmentedControl
              variant="pill" 
              value={activeTab} 
              onChange={(val) => setActiveTab(val as any)}
              options={[
                { value: "pending", label: `Chờ nấu (${orders.filter((o:any) => o.status === "pending").length})` },
                { value: "cooking", label: `Đang nấu (${orders.filter((o:any) => o.status === "cooking").length})` },
                { value: "ready", label: `Hoàn tất (${orders.filter((o:any) => o.status === "ready").length})` },
                { value: "all", label: "Tất cả" },
              ]}
            />

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm whitespace-nowrap">
               <span className="relative flex h-3 w-3">
                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
               </span>
               <span className="uppercase tracking-widest">
                 {isFetching ? "Đang cập nhật..." : "LIVE SYNC ON"}
               </span>
            </div>
          </div>
        }
      />

      <div className="custom-scrollbar flex-1 overflow-y-auto pb-10 pr-2">
        {isLoading ? (
          <div className="text-center py-20">Đang tải phiếu bếp...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order: KitchenOrder) => (
                <KitchenTicket 
                  key={order.id} 
                  order={order} 
                  onUpdateItemStatus={updateItemStatus} // Đã đổi Prop
                  onPrint={(o) => { setSelectedOrder(o); setIsPrintModalOpen(true); }} 
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center py-20 sm:py-32 text-stone-400">
                <Flame className="h-10 w-10 text-stone-300 mb-4" />
                <p className="text-lg sm:text-xl font-bold">Khu vực bếp đang rảnh rỗi.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <PrintReceiptModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} order={selectedOrder} onConfirmPrint={() => { window.print(); setIsPrintModalOpen(false); }} />
    </div>
  );
}
