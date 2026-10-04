"use client";

import React, { useState } from "react";
import { Search, PlusCircle, TicketPercent, Banknote, QrCode, Wallet, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { ReceiptBill } from "@/components/restaurant/pos/ReceiptBill";
import { PosCheckoutArea } from "@/components/restaurant/pos/PosCheckoutArea";
import { cn } from "@/lib/utils";
import { useGetTableOrder, useCheckoutOrder, useUpdateKitchenItemStatus } from "@/hooks/useOrder";

export default function POSCheckoutPage() {
  const [tableInput, setTableInput] = useState("");
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [method, setMethod] = useState<"CASH" | "QR" | "MOMO" | "CARD">("CASH");

  const { data: rawOrderData, isLoading } = useGetTableOrder(activeTableId);
  const orderData = rawOrderData as any;
  const checkoutMutation = useCheckoutOrder();
  const updateItemStatusMutation = useUpdateKitchenItemStatus();

  const totalAmount = orderData?.totalAmount || 0; 
  const depositAmount = orderData?.depositAmount || 0; 
  const amountToCollect = Math.max(0, totalAmount - depositAmount);

  const MethodButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setMethod(id)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black transition-all border-2",
        method === id 
          ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200" 
          : "bg-white border-stone-50 text-stone-400 hover:border-stone-200"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="bg-app-bg flex h-[calc(100vh-80px)] flex-col p-4 gap-3 overflow-hidden">
      
      {/* HEADER MỎNG GỌN */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-white p-2 pl-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
            <input 
              value={tableInput} onChange={e => setTableInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setActiveTableId(tableInput)}
              placeholder="Mã bàn..."
              className="w-full rounded-lg border border-stone-50 bg-stone-50 py-2 pl-9 pr-3 text-sm font-bold outline-none focus:bg-white transition-all"
            />
          </div>
          <button onClick={() => setActiveTableId(tableInput)} className="rounded-lg bg-[#2D2318] px-4 py-2 text-xs font-black text-white hover:bg-black">TÌM BILL</button>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-xl">
           <MethodButton id="CASH" label="TIỀN MẶT" icon={Banknote} />
           <MethodButton id="QR" label="QUÉT QR" icon={QrCode} />
           <MethodButton id="MOMO" label="MOMO" icon={Wallet} />
           <MethodButton id="CARD" label="THẺ" icon={CreditCard} />
        </div>
      </div>

      {!orderData ? (
        <div className="flex flex-1 items-center justify-center text-stone-300 font-bold italic">Vui lòng tìm hóa đơn...</div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-4">
          <div className="flex h-full w-[320px] shrink-0 flex-col gap-2">
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white py-2 text-[10px] font-black text-amber-600 hover:bg-amber-50 transition-all"><PlusCircle className="h-3 w-3" /> PHỤ PHÍ</button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white py-2 text-[10px] font-black text-emerald-600 hover:bg-emerald-50"><TicketPercent className="h-3 w-3" /> GIẢM GIÁ</button>
              </div>
              <ReceiptBill
                items={orderData.items} subTotal={orderData.subTotal} 
                surchargeAmount={orderData.surchargeAmount} surchargeNote={orderData.surchargeNote} 
                discountAmount={orderData.discountAmount}
                taxAmount={orderData.taxAmount} totalAmount={totalAmount} depositAmount={depositAmount} 
                isVoucherApplied={!!orderData.voucherCode} voucherCode={orderData.voucherCode}
                tableNumber={tableInput} orderId={orderData.orderCode}
                tableGroupNames={orderData?.tableGroupNames}
                onServeItem={(itemId) => updateItemStatusMutation.mutate({ itemId, status: "SERVED" })}
              />
          </div>

          <div className="flex flex-1 min-w-0">
            <PosCheckoutArea 
              method={method} 
              totalAmount={amountToCollect} 
              onCheckoutSuccess={(m) => {
                checkoutMutation.mutate({ orderId: orderData.id, payload: { paymentMethod: m } }, {
                  onSuccess: () => { toast.success("Thành công!"); setActiveTableId(null); setTableInput(""); }
                });
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
