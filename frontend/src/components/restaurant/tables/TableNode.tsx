// ======================================
// FILE: src/components/restaurant/tables/TableNode.tsx
// ======================================
import React, { memo } from "react";
import { TableElement, TableStatus } from "./types";
import { cn } from "@/lib/utils";

interface TableNodeProps {
  table: TableElement;
  isEditMode: boolean;
  isMergeMode: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
}

export const TableNode = memo(function TableNode({ 
  table, 
  isEditMode,
  isMergeMode, 
  isSelected, 
  onClick 
}: TableNodeProps) {
  
  const getStatusColors = (status: TableStatus) => {
    if (isEditMode) return "bg-stone-50 border-stone-300 text-stone-500";
    switch (status) {
      case "serving": return "bg-amber-100 border-amber-400 text-amber-700 shadow-amber-500/20";
      case "booked": return "bg-blue-100 border-blue-400 text-blue-700 shadow-blue-500/20";
      case "cleaning": return "bg-teal-100 border-teal-400 text-teal-700 shadow-teal-500/20";
      // THÊM GIAO DIỆN BÀN BẢO TRÌ (Màu xám sọc đỏ)
      case "maintenance": return "bg-stone-200 border-rose-400 text-stone-500 opacity-90 grayscale-[0.5] shadow-none";
      default: return "bg-white border-stone-200 text-brand-dark hover:border-stone-300";
    }
  };

  const isCircle = table.shape === "circle";
  const isOccupied = table.status !== "empty" && table.status !== "maintenance" && !isEditMode;


  // ==========================================
  // THUẬT TOÁN RENDER GHẾ (CHAIRS) TỰ ĐỘNG & LINH HOẠT
  // ==========================================
  const renderChairs = () => {
    const chairClass = cn(
      "bg-stone-300 rounded-full transition-opacity duration-300 shadow-sm",
      !isOccupied && "opacity-40"
    );

    // KHOẢNG CÁCH TỪ GHẾ ĐẾN BÀN (Pixel)
    const GAP = 16; 

    // ==========================================
    // 1. XỬ LÝ BÀN TRÒN / OVAL (Hình Elip chuẩn xác)
    // ==========================================
    if (isCircle) {
      const rx = table.width / 2;
      const ry = table.height / 2;

      return (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: table.seats }).map((_, i) => {
            // 1. Góc tham số (Bắt đầu từ 12h: -90 độ)
            const t = (i * 2 * Math.PI) / table.seats - Math.PI / 2;

            // 2. Tìm tọa độ chính xác nằm ngay trên MÉP BÀN
            const edgeX = rx * Math.cos(t);
            const edgeY = ry * Math.sin(t);

            // 3. Tính Vector pháp tuyến (Đường vuông góc chĩa ra ngoài mép bàn)
            // Lượng giác: Đạo hàm Elip cho ra pháp tuyến (ry*cos, rx*sin)
            const nx = ry * Math.cos(t);
            const ny = rx * Math.sin(t);

            // 4. Chuẩn hóa vector (Đưa độ dài về 1)
            const mag = Math.sqrt(nx * nx + ny * ny);
            const unx = nx / mag;
            const uny = ny / mag;

            // 5. Tọa độ ghế = Điểm mép bàn + (Đẩy ra ngoài theo GAP)
            const x = edgeX + unx * GAP;
            const y = edgeY + uny * GAP;

            // 6. Tính góc xoay để ghế luôn vuông góc với mép bàn
            const rotDeg = (Math.atan2(ny, nx) * 180) / Math.PI + 90;

            return (
              <div
                key={i}
                // -mt-1 -ml-3 để dời tâm xoay về đúng giữa cái ghế
                className={cn("absolute top-1/2 left-1/2 -mt-1 -ml-3 h-2 w-6", chairClass)}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${rotDeg}deg)`,
                }}
              />
            );
          })}
        </div>
      );
    }

    // ==========================================
    // 2. XỬ LÝ BÀN VUÔNG / CHỮ NHẬT
    // ==========================================
    let top = 0, bottom = 0, left = 0, right = 0;
    
    const totalLength = table.width + table.height;
    const ratioW = table.width / totalLength;
    
    const chairsW = Math.round(table.seats * ratioW);
    const chairsH = table.seats - chairsW;

    top = Math.ceil(chairsW / 2);
    bottom = Math.floor(chairsW / 2);
    left = Math.ceil(chairsH / 2);
    right = Math.floor(chairsH / 2);

    return (
      <>
        {top > 0 && (
          <div className="absolute left-0 right-0 flex justify-evenly pointer-events-none px-2" style={{ top: `-${GAP}px` }}>
            {Array.from({ length: top }).map((_, i) => <div key={`t-${i}`} className={cn("h-2 w-6", chairClass)} />)}
          </div>
        )}
        {bottom > 0 && (
          <div className="absolute left-0 right-0 flex justify-evenly pointer-events-none px-2" style={{ bottom: `-${GAP}px` }}>
            {Array.from({ length: bottom }).map((_, i) => <div key={`b-${i}`} className={cn("h-2 w-6", chairClass)} />)}
          </div>
        )}
        {left > 0 && (
          <div className="absolute top-0 bottom-0 flex flex-col items-center justify-evenly pointer-events-none py-2" style={{ left: `-${GAP}px` }}>
            {Array.from({ length: left }).map((_, i) => <div key={`l-${i}`} className={cn("h-6 w-2", chairClass)} />)}
          </div>
        )}
        {right > 0 && (
          <div className="absolute top-0 bottom-0 flex flex-col items-center justify-evenly pointer-events-none py-2" style={{ right: `-${GAP}px` }}>
            {Array.from({ length: right }).map((_, i) => <div key={`r-${i}`} className={cn("h-6 w-2", chairClass)} />)}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* RENDER CÁC GHẾ (Nằm dưới / Lồi ra ngoài khối bàn) */}
      {renderChairs()}

      {/* RENDER KHỐI BÀN CHÍNH */}
      <div
        onClick={(e) => onClick(e, table.id)}
        className={cn(
          "relative flex w-full h-full flex-col items-center justify-center border-2 shadow-sm transition-colors duration-300 z-10",
          isCircle ? "rounded-full" : "rounded-2xl",
          getStatusColors(table.status),
          !isEditMode && "cursor-pointer hover:shadow-lg",
          isMergeMode && !isSelected && "border-dashed opacity-60",
          isSelected && "border-primary ring-primary/20 bg-amber-50 shadow-xl ring-4"
        )}
      >
        {/* Hiển thị ID Gộp (nếu có) */}
        {table.mergedId && !isMergeMode && !isEditMode && (
          <div className="bg-brand-dark absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border-2 border-white px-2.5 py-0.5 text-[9px] font-black whitespace-nowrap text-white shadow-sm">
            GỘP #{table.mergedId}
          </div>
        )}

        <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">Bàn</span>
        <span className="text-base font-black tracking-wider sm:text-xl">{table.name}</span>
        <span className="text-[9px] font-semibold text-stone-400 mt-1">{table.seats} ghế</span>

        {/* CẢNH BÁO BẢO TRÌ */}
        {table.status === "maintenance" && !isMergeMode && !isEditMode && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-rose-500/10 backdrop-blur-[1px]">
            <div className="rotate-[-15deg] rounded border-2 border-rose-500 bg-white/90 px-2 py-0.5 text-[9px] font-black text-rose-600 uppercase shadow-sm">
              ĐANG HỎNG
            </div>
          </div>
        )}


        {/* Alert Icon nếu đang serving */}
        {table.status === "serving" && !isMergeMode && !isEditMode && (
          <div className="bg-primary absolute -right-2 -bottom-2 z-20 flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-white shadow-sm">
            !
          </div>
        )}
      </div>
    </div>
  );
});
