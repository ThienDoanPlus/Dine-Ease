"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Download, Share2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderCode: string;
}

export function QrPaymentModal({ isOpen, onClose, amount, orderCode }: QrPaymentModalProps) {
  // Thông tin tài khoản của bạn
  const BANK_ID = "970405"; // Mã Agribank
  const ACCOUNT_NO = "6002205614077";
  const ACCOUNT_NAME = "NGUYEN ANH KHOA";
  const DESCRIPTION = `Thanh toan don hang ${orderCode}`;

  // Chuỗi VietQR chuẩn EMVCo
  const vietQrString = `00020101021138570010A000000727012700069704050113${ACCOUNT_NO}0208QRIBFTTA52045411${amount}53037045802VN5915${ACCOUNT_NAME}6005BRVTh6304`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl">
        {/* Header giả lập giao diện VietQR */}
        <div className="bg-[#f8f9fa] p-6 text-center border-b border-stone-100 relative">
           <p className="text-xs font-medium text-stone-500 mb-1">Quét mã QR để chuyển tiền qua</p>
           <div className="flex justify-center items-center gap-2">
              <span className="font-black text-red-600 text-lg">Viet</span>
              <span className="font-black text-blue-700 text-lg">QR</span>
              <div className="h-4 w-px bg-stone-300 mx-1"></div>
              <span className="text-[10px] font-bold text-blue-900 leading-tight text-left">NAPAS<br/>24/7</span>
           </div>
           <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-200 text-stone-400">
              <X className="h-5 w-5" />
           </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* Vùng chứa QR Code */}
          <div className="relative p-4 bg-white border-2 border-amber-400 rounded-3xl shadow-inner mb-6">
            <QRCodeSVG 
              value={vietQrString}
              size={220}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Agribank_logo.svg/1200px-Agribank_logo.svg.png", // Logo Agribank nhỏ ở giữa
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* Thông tin chuyển khoản */}
          <div className="w-full space-y-4 text-center">
            <div className="flex justify-center items-center gap-2">
               <img src="https://itview.vn/wp-content/uploads/2023/10/logo-Agribank.png" alt="Agribank" className="h-6 object-contain" />
            </div>

            <div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Chủ tài khoản</p>
              <p className="text-xl font-black text-blue-900">{ACCOUNT_NAME}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Số tài khoản</p>
              <p className="text-2xl font-black text-red-600 tracking-tighter">{ACCOUNT_NO}</p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
               <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Số tiền thanh toán</p>
               <p className="text-2xl font-black text-brand-dark">{formatCurrency(amount)}</p>
            </div>

            <p className="text-[10px] text-stone-400 italic">
               Agribank - Chi nhanh Huyen Xuyen Moc - BRVT
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 border-t border-stone-100">
           <button className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-stone-500 hover:bg-stone-50 border-r border-stone-100">
              <Download className="h-4 w-4" /> Tải mã
           </button>
           <button className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-stone-500 hover:bg-stone-50">
              <Share2 className="h-4 w-4" /> Chia sẻ
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
