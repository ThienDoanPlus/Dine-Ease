import React from "react";
import { formatCurrency, cn } from "@/lib/utils";

interface ReceiptBillProps {
  items: Array<{ id: number; name: string; qty: number; price: number; status: string }>;
  subTotal: number;
  surchargeAmount: number; 
  surchargeNote: string;   
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount: number; 
  isVoucherApplied: boolean;
  voucherCode: string;
  isDiscountCapped?: boolean;
  tableNumber: string;
  orderId: string;
  tableGroupNames?: string[]; // Thêm prop này
  onServeItem?: (itemId: number) => void;
}

export function ReceiptBill({
  items, subTotal, surchargeAmount, surchargeNote, discountAmount,
  taxAmount, totalAmount, depositAmount, isVoucherApplied,
  voucherCode, isDiscountCapped, tableNumber, orderId, tableGroupNames, onServeItem,
}: ReceiptBillProps) {
  
  const finalPayable = Math.max(0, totalAmount - depositAmount);

  // Logic hiển thị tiêu đề bàn (Đã tối ưu cho không gian hẹp)
  const renderTableTitle = () => {
    if (tableGroupNames && tableGroupNames.length > 1) {
      const masterName = tableGroupNames[0];
      const otherNames = tableGroupNames.slice(1).join(", ");
      return (
        <div className="flex flex-col items-center">
          <span className="text-amber-600 text-[10px] font-black">CỤM: {masterName}</span>
          <span className="text-[8px] text-stone-400 font-bold italic">({otherNames})</span>
        </div>
      );
    }
    return (
      <span className="text-stone-400">
        Bàn <span className="text-amber-600 ml-1 text-xs">{tableNumber}</span>
      </span>
    );
  };

  return (
    <div className="receipt-paper-bottom relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl border border-stone-200 bg-[#FAFAFA] shadow-md pt-2">
      
      {/* HEADER HÓA ĐƠN - ĐÃ THU GỌN TỐI ĐA */}
      <div className="mx-3 border-b-[2px] border-dashed border-stone-200/70 p-2 text-center shrink-0">
        <h3 className="text-brand-dark text-base font-black tracking-tight leading-none">DINE EASE</h3>
        <p className="mb-2 text-[8px] font-bold tracking-widest text-stone-400 uppercase mt-1">Phiếu thanh toán</p>
        
        <div className="flex items-center justify-between rounded-lg border border-stone-100 bg-white p-1.5 text-[9px] font-bold uppercase shadow-sm">
          {renderTableTitle()}
          <span className="text-stone-400">ID <span className="text-brand-dark ml-1 font-mono">{orderId}</span></span>
        </div>
      </div>

      {/* DANH SÁCH MÓN - CHIẾM TRỌN KHÔNG GIAN CÒN LẠI */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#FAFAFA] z-10">
            <tr className="border-b-[2px] border-solid border-stone-200/50 text-[9px] font-black tracking-widest text-stone-400 uppercase">
              <th className="py-2 text-left bg-[#FAFAFA]">Món ăn</th>
              <th className="w-8 py-2 text-center bg-[#FAFAFA]">SL</th>
              <th className="w-20 py-2 text-right bg-[#FAFAFA]">T.Tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/50">
            {items.map((item) => (
              <tr key={item.id} className="group text-stone-600">
                <td className="py-2 pr-2 leading-tight">
                  <span className="font-bold text-stone-800 block text-sm">{item.name}</span>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {item.status === "PENDING" && <span className="text-[8px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">Chờ nấu</span>}
                    {item.status === "COOKING" && <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded animate-pulse">Đang nấu</span>}
                    {item.status === "SERVED" && <span className="text-[8px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded line-through">Đã lên món</span>}
                    {item.status === "REJECTED" && <span className="text-[8px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded line-through">Đã hủy</span>}
                    
                    {item.status === "READY" && (
                      <button 
                        onClick={() => onServeItem && onServeItem(item.id)}
                        className="text-[8px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded shadow-sm hover:bg-emerald-600 active:scale-95"
                      >
                        Bưng món
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-2 text-center font-black text-stone-400 align-top text-sm">{item.qty}</td>
                <td className="text-brand-dark py-2 text-right font-mono font-bold tracking-tight align-top">
                  {formatCurrency(item.price * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TỔNG KẾT FOOTER - ĐÃ THU GỌN PADDING */}
      <div className="mx-3 space-y-1.5 border-t-[2px] border-dashed border-stone-200/70 px-2 pt-2 pb-4 shrink-0">
        <div className="flex justify-between text-[10px] font-medium text-stone-500">
          <span>Tạm tính ({items.length}):</span>
          <span className="font-mono font-bold text-stone-700">{formatCurrency(subTotal)}</span>
        </div>
        
        {surchargeAmount > 0 && (
          <div className="flex justify-between text-[10px] font-medium text-amber-600">
            <span className="truncate max-w-[130px]">{surchargeNote || "Phụ phí"}:</span>
            <span className="font-mono font-bold">+ {formatCurrency(surchargeAmount)}</span>
          </div>
        )}
        
        {isVoucherApplied && (
          <div className="flex justify-between text-[10px] font-medium text-rose-500">
            <div className="flex flex-col">
              <span>Mã giảm ({voucherCode}):</span>
              {isDiscountCapped && <span className="text-[8px] italic opacity-70">Không hoàn tiền thừa</span>}
            </div>
            <span className="font-mono font-bold">- {formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-[10px] font-medium text-stone-500">
          <span>Thuế VAT (8%):</span>
          <span className="font-mono font-bold text-stone-700">{formatCurrency(taxAmount)}</span>
        </div>

        <div className="flex justify-between text-[10px] font-bold text-emerald-600 mt-0.5 border-t-[2px] border-dashed border-stone-200/70 pt-1">
          <span>Tiền cọc App:</span>
          <span className="font-mono">- {formatCurrency(depositAmount)}</span>
        </div>

        <div className="border-brand-dark mt-1 flex items-end justify-between border-t-2 pt-2">
          <span className="text-brand-dark mb-1 text-[9px] font-black tracking-widest uppercase">
            Thanh toán
          </span>
          <span className="text-brand-dark font-mono text-xl font-black tracking-tighter">
            {formatCurrency(finalPayable)}
          </span>
        </div>
      </div>
    </div>
  );
}
