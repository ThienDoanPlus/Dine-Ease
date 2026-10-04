// src/components/restaurant/kitchen/PrintReceiptModal.tsx
import React from "react";
import { Printer, Barcode } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { KitchenOrder } from "./types";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: KitchenOrder | null;
  onConfirmPrint: () => void;
}

export function PrintReceiptModal({ isOpen, onClose, order, onConfirmPrint }: PrintReceiptModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-none bg-transparent p-0 shadow-none" showCloseButton={false}>
        <div className="relative mx-auto w-full max-w-[340px]">
          {/* Bóng mờ phía sau tờ giấy */}
          <div className="absolute inset-0 translate-y-4 scale-95 bg-black/20 blur-xl"></div>

          {/* Tờ giấy in nhiệt - Cần class "printable-receipt" cho CSS print */}
          <div className="printable-receipt receipt-paper-top receipt-paper-bottom relative bg-[#FDFBF7] px-6 py-10 shadow-xl ring-1 ring-black/5">

            {/* Header Phiếu */}
            <div className="mb-6 border-b-[2px] border-dashed border-stone-300 pb-6 text-center font-mono">
              <h2 className="text-2xl font-black text-black">*** DINE EASE ***</h2>
              <p className="mt-1 text-sm font-bold text-stone-600">KITCHEN ORDER TICKET</p>

              <div className="mt-6 rounded-lg border-[2px] border-black py-2">
                <p className="text-2xl font-black text-black uppercase">{order.table}</p>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm font-bold text-black">
                <span>ID: {order.id}</span>
                <span>T: {order.time}</span>
              </div>
            </div>

            {/* Danh sách món */}
            <div className="space-y-5 pb-6 font-mono">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 text-black">
                  <span className="text-xl font-black">{item.qty}</span>
                  <div className="flex-1 pt-0.5">
                    <p className="text-base font-bold leading-tight">{item.name}</p>
                    {item.note && (
                      <p className="mt-1.5 text-sm font-bold text-stone-600">
                        {">> "} {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Phiếu */}
            <div className="border-t-[2px] border-dashed border-stone-300 pt-6 text-center font-mono">
              <p className="text-xs font-bold text-stone-600">
                Printed: {new Date().toLocaleTimeString("vi-VN")}
              </p>
              <Barcode className="mx-auto mt-4 h-12 w-48 text-black opacity-80" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Action Buttons - Ẩn khi in (no-print) */}
        <div className="relative z-10 mt-8 flex justify-center gap-3 no-print">
          <button
            onClick={onClose}
            className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-stone-700 shadow-md hover:bg-stone-50 active:scale-95"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirmPrint}
            className="flex items-center gap-2 rounded-xl bg-brand-dark px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95"
          >
            <Printer className="h-5 w-5" /> In Phiếu Này
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
