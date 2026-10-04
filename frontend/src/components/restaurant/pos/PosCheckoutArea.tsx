"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Info } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { PosNumpad } from "./PosNumpad";
import { QuickCashButton } from "./QuickCashButton";

interface PosCheckoutAreaProps {
  method: "CASH" | "QR" | "MOMO" | "CARD";
  totalAmount: number;
  onCheckoutSuccess: (method: string) => void;
}

export function PosCheckoutArea({ method, totalAmount, onCheckoutSuccess }: PosCheckoutAreaProps) {
  const [cashInput, setCashInput] = useState<string>("0");
  const numericCash = parseInt(cashInput) || 0;
  const changeAmount = numericCash - totalAmount;
  const isEnoughCash = numericCash >= totalAmount;
  const canCheckout = totalAmount <= 0 || method !== "CASH" || isEnoughCash;

  const BANK_ID = "agribank";
  const ACCOUNT_NO = "6002205614077";
  const ACCOUNT_NAME = "NGUYEN ANH KHOA";
  const vietQrValue = `https://qr.vietqr.io/static/${BANK_ID}/${ACCOUNT_NO}?amount=${totalAmount}&addInfo=Thanh%20toan%20DineEase&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  useEffect(() => { setCashInput("0"); }, [totalAmount]);

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-stone-100 bg-white p-5 shadow-sm overflow-hidden">
      
      {/* KHU VỰC HIỂN THỊ CHÍNH - CHIẾM TRỌN CHIỀU CAO (flex-1) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {method === "CASH" ? (
          /* --- GIAO DIỆN TIỀN MẶT --- */
          <div className="flex h-full flex-col animate-in fade-in duration-300">
             
             {/* Box Tiền (Khách đưa / Tiền thừa) - Cố định kích thước (shrink-0) */}
             <div className="bg-stone-50 border border-stone-100 mb-3 shrink-0 rounded-xl p-4 shadow-inner">
                <div className="flex items-end justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Khách đưa</p>
                    <div className="font-mono text-4xl font-black tracking-tighter text-brand-dark">{numericCash.toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Tiền thừa</p>
                    <div className={cn("font-mono text-2xl font-black tracking-tighter", changeAmount >= 0 ? "text-emerald-500" : "text-stone-300")}>
                      {changeAmount >= 0 ? changeAmount.toLocaleString("vi-VN") : "0"}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Nút gợi ý tiền - Cố định kích thước (shrink-0) */}
              <div className="mb-3 shrink-0 grid grid-cols-4 gap-2">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <QuickCashButton key={amt} amount={amt} disabled={false} onClick={() => setCashInput((numericCash + amt).toString())} />
                ))}
              </div>
              
              {/* BÀN PHÍM - TỰ ĐỘNG KÉO GIÃN ĐỂ LẤP ĐẦY KHOẢNG TRỐNG (flex-1) */}
              <div className="flex flex-1 flex-col">
                <PosNumpad 
                  disabled={false} 
                  onKeyPress={(key) => setCashInput(prev => prev === "0" ? key : prev + key)} 
                  onClear={() => setCashInput("0")} 
                  onDelete={() => setCashInput(prev => prev.length <= 1 ? "0" : prev.slice(0, -1))} 
                />
              </div>
          </div>
        ) : (
          /* --- GIAO DIỆN QUÉT QR --- */
          <div className="flex h-full flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="mb-6 text-center">
              <h3 className="text-base font-black text-brand-dark uppercase tracking-tight">QUÉT MÃ CHUYỂN KHOẢN</h3>
              <p className="text-[11px] font-medium text-stone-400">Ứng dụng Ngân hàng hoặc Ví điện tử</p>
            </div>

            <div className="flex flex-row items-center gap-8">
               <div className="relative p-2.5 bg-white border-[4px] border-amber-400 rounded-3xl shadow-xl">
                  <QRCodeSVG value={vietQrValue} size={160} level="M" />
               </div>

               <div className="flex flex-col gap-4 w-56">
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-center shadow-inner">
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Cần thanh toán</p>
                     <p className="text-3xl font-black text-amber-500 tracking-tighter mb-3">{formatCurrency(totalAmount)}</p>
                     <div className="h-px bg-stone-200 w-full mb-3"></div>
                     <p className="text-[11px] font-bold text-stone-700 leading-tight text-center">NGUYEN ANH KHOA<br/>6002205614077</p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 py-2 px-2 rounded-full text-[9px] font-black uppercase">
                    <Info className="h-3 w-3 shrink-0" /> <span className="text-center leading-tight">NHẬN TIỀN MỚI BẤM HOÀN TẤT</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* NÚT HOÀN TẤT - CỐ ĐỊNH Ở ĐÁY, KHÔNG BỊ TRÔI */}
      <button
        onClick={() => onCheckoutSuccess(method)}
        disabled={!canCheckout}
        className={cn(
          "mt-4 shrink-0 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-black transition-all active:scale-95 shadow-md",
          canCheckout ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30" : "bg-stone-100 text-stone-300 cursor-not-allowed shadow-none"
        )}
      >
        <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
        HOÀN TẤT THANH TOÁN
      </button>
    </div>
  );
}
