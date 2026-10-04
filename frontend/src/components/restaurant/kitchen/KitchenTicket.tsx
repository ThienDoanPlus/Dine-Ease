import React from "react";
import { Clock, Flame, Check, X, CornerDownRight, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitchenOrder, OrderStatus } from "./types";

interface KitchenTicketProps {
  order: KitchenOrder;
  onUpdateItemStatus: (itemId: number, newStatus: OrderStatus) => void;
  onPrint: (order: KitchenOrder) => void;
}

export function KitchenTicket({ order, onUpdateItemStatus, onPrint }: KitchenTicketProps) {
  const isAllReady = order.status === "ready";

  return (
    <div className={cn(
      "relative flex flex-col transition-all duration-300 rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md",
      isAllReady ? "opacity-60 grayscale-[0.2]" : "scale-[1.01]"
    )}>
      {/* HIỆU ỨNG RĂNG CƯA GIẤY */}
      <div className="receipt-paper-top h-3 w-full bg-white"></div>

      <div className="bg-white px-6 py-5 flex-1">

        {/* HEADER: Thông tin bàn & Thời gian */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-5 mb-5">
          <div>
            <h2 className="text-3xl font-black text-stone-800 uppercase tracking-tighter leading-none">
              {order.table}
            </h2>
            <p className="text-[11px] font-bold text-stone-400 mt-2 tracking-wider">#{order.id}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-stone-500 font-bold text-sm">
              <Clock className="h-3.5 w-3.5" />
              {order.time.split(' - ')[0]}
            </div>
            <div className={cn(
              "inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              isAllReady ? "bg-stone-100 text-stone-400" : "bg-amber-100 text-amber-700 shadow-sm shadow-amber-200/50"
            )}>
              {isAllReady ? "Hoàn tất" : "Đang chờ"}
            </div>
          </div>
        </div>

        {/* BODY: Danh sách món ăn */}
        <div className="space-y-6 mb-6">
          {order.items.map((item) => {
            const isItemReady = item.status === "ready";
            const isRejected = item.status === "rejected";

            return (
              <div key={item.id} className="flex items-start gap-4 relative">
                {/* Số lượng */}
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-black transition-colors",
                  isItemReady ? "border-stone-100 text-stone-200" : "border-stone-800 text-stone-800"
                )}>
                  {item.qty}
                </div>

                {/* Tên món & Ghi chú */}
                <div className="flex-1 pt-0.5">
                  <p className={cn(
                    "text-[17px] font-extrabold leading-tight transition-all",
                    isItemReady ? "text-stone-200 line-through" :
                      isRejected ? "text-red-200 line-through" : "text-stone-800"
                  )}>
                    {item.name}
                  </p>

                  {/* Options (Size, Topping...) */}
                  {item.options && item.options.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.options.map((opt, i) => (
                        <span key={i} className="text-[10px] font-black uppercase text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.note && (
                    <div className="flex items-start gap-1 mt-2 text-stone-400">
                      <CornerDownRight className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-40" />
                      <p className="text-[13px] font-bold italic leading-tight">{item.note}</p>
                    </div>
                  )}
                </div>

                {/* NÚT HÀNH ĐỘNG */}
                <div className="flex gap-1 items-center">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => onUpdateItemStatus(item.id, "cooking")}
                        className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                        title="Bắt đầu nấu"
                      >
                        <Flame className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => confirm(`Hủy món "${item.name}"?`) && onUpdateItemStatus(item.id, "rejected")}
                        className="p-2.5 rounded-xl text-stone-300 hover:text-red-500 transition-all active:scale-90"
                        title="Hủy món"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {item.status === "cooking" && (
                    <button
                      onClick={() => onUpdateItemStatus(item.id, "ready")}
                      className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 active:scale-90"
                      title="Hoàn tất món"
                    >
                      <Check className="h-5 w-5" strokeWidth={3} />
                    </button>
                  )}
                  {isItemReady && (
                    <div className="p-2.5 text-emerald-500">
                      <Check className="h-5 w-5" strokeWidth={4} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER: Nút in phiếu */}
        <button
          onClick={() => onPrint(order)}
          className="w-full flex items-center justify-center gap-2 border border-stone-100 bg-stone-50/50 py-3.5 text-sm font-bold text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-600 active:scale-95"
        >
          <Printer className="h-4 w-4" /> In lại phiếu bếp
        </button>
      </div>

      <div className="receipt-paper-bottom h-3 w-full bg-white"></div>
    </div>
  );
}
