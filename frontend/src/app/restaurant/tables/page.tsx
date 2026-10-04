"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { RotateCcw, Combine, Settings2, Save, PlusSquare, Circle, MoveDiagonal, Trash2, PaintBucket, Type, Hash, ChevronLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Rnd } from "react-rnd";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Components
import { FloorPlanData, FloorElement, TableStatus, TableElement, ArchitecturalElement } from "@/components/restaurant/tables/types";
import { FloorSelector } from "@/components/restaurant/tables/FloorSelector";
import { ContextMenu } from "@/components/restaurant/tables/ContextMenu";
import { TableNode } from "@/components/restaurant/tables/TableNode";
import { ArchitecturalNode } from "@/components/restaurant/tables/ArchitecturalNode";
import { OrderMenuModal } from "@/components/restaurant/tables/OrderMenuModal";
import { PageHeader } from "@/components/shared/ui/PageHeader";

// Hooks RAG/Backend
import { useGetFloorPlan, useSyncFloorPlan, FloorPlanResponse } from "@/hooks/useRestaurant";
import { useCreateOrder } from "@/hooks/useOrder";

// --- CUSTOM ZOOM HANDLER TO FIX CHROME PAGE ZOOM ---
const CustomZoomHandler = ({
  children,
  zoomIn,
  zoomOut
}: {
  children: React.ReactNode,
  zoomIn: (step: number) => void,
  zoomOut: (step: number) => void
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = wrapperRef.current;
    if (!target) return;

    const handleWheel = (e: WheelEvent) => {
      // Chỉ xử lý khi có phím Ctrl (hoặc Cmd trên Mac) để tránh tranh chấp với scroll thường
      // Hoặc xử lý tất cả nếu muốn zoom bằng scroll wheel
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Chốt chặn quan trọng nhất để không zoom trình duyệt
        const zoomStep = 0.5;
        if (e.deltaY < 0) {
          zoomIn(zoomStep);
        } else {
          zoomOut(zoomStep);
        }
      }
    };

    // Quan trọng: { passive: false } mới cho phép preventDefault()
    target.addEventListener("wheel", handleWheel, { passive: false });
    return () => target.removeEventListener("wheel", handleWheel);
  }, [zoomIn, zoomOut]);

  return (
    <div ref={wrapperRef} className="h-full w-full relative">
      {children}
    </div>
  );
};

const ROOM_OPTIONS = [
  { id: "main", name: "Sảnh chính" },
  { id: "vip1", name: "Phòng VIP 1" },
  { id: "vip2", name: "Phòng VIP 2" },
  { id: "garden", name: "Sân vườn ngoài trời" },
];

export default function TableMapPage() {
  const router = useRouter();
  const [floorData, setFloorData] = useState<FloorPlanData>({});
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [currentRoom, setCurrentRoom] = useState<string>("main");
  const [isEditMode, setIsEditMode] = useState(false);

  const currentCanvasKey = `${currentFloor}_${currentRoom}`;

  // --- REACT QUERY ---
  const { data: rawData, isLoading, refetch } = useGetFloorPlan();
  const data = rawData as any;
  const syncMutation = useSyncFloorPlan();
  const createOrderMutation = useCreateOrder();

  const isLoaded = !isLoading;

  // Xử lý dữ liệu API trả về (Map vào giao diện Rnd)
  useEffect(() => {
    if (data) {
      const newFloorData: FloorPlanData = {};

      if (data.tables) {
        data.tables.forEach((t: any) => {
          const key = t.floorName || "1_main";
          if (!newFloorData[key]) newFloorData[key] = [];
          newFloorData[key].push({
            id: `t_${t.id || t.tableName}`,
            type: "table",
            name: t.tableName,
            seats: t.capacity,
            status: t.status === "AVAILABLE" ? "empty" :
              t.status === "OCCUPIED" ? "serving" :
                t.status === "MAINTENANCE" ? "maintenance" : "booked",
            x: t.x || 100, y: t.y || 100, width: t.width || 80, height: t.height || 80,
            shape: t.shape || "rect",
            rotation: t.rotation || 0,
            mergedId: t.mergedId || null,
          });
        });
      }

      // ==========================================================
      // [ĐÃ FIX]: BẢO VỆ CHỐNG SẬP (CRASH) KHI NHÀ HÀNG CHƯA CÓ DỮ LIỆU TƯỜNG
      // ==========================================================
      if (data.architecturalData && data.architecturalData !== "null") {
        try {
          const archs = JSON.parse(data.architecturalData);

          // Phải kiểm tra nó đích thực là Array thì mới được dùng .forEach()
          if (Array.isArray(archs)) {
            archs.forEach((a: any) => {
              const key = a.floorName || "1_main";
              if (!newFloorData[key]) newFloorData[key] = [];
              newFloorData[key].push(a);
            });
          }
        } catch (e) {
          console.error("Cảnh báo: Lỗi parse JSON architecture, bỏ qua render kiến trúc.", e);
        }
      }
      setFloorData(newFloorData);
    }
  }, [data]);

  // ==========================================================
  // [VÁ LỖ HỔNG PHANTOM STATE]: Reset sạch sẽ khi chuyển Tầng/Phòng
  // ==========================================================
  useEffect(() => {
    setSelectedElementId(null);
    setIsMergeMode(false);
    setSelectedMergeTables([]);
  }, [currentCanvasKey]);

  const [filter, setFilter] = useState<"all" | TableStatus>("all");
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedMergeTables, setSelectedMergeTables] = useState<string[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderTableId, setOrderTableId] = useState<string | null>(null);

  const orderTableName = useMemo(() => {
    if (!orderTableId) return "";
    const table = floorData[currentCanvasKey]?.find(t => t.id === orderTableId);
    return table && table.type === "table" ? table.name : "";
  }, [orderTableId, floorData, currentCanvasKey]);

  // --- HELPER RESOLVE MASTER ID ---
  // Hàm này trả về ID gốc (t_id) của bàn cha nếu bàn hiện tại là bàn con
  const resolveMasterId = useCallback((id: string) => {
    const currentElements = floorData[currentCanvasKey] || [];
    const table = currentElements.find(el => el.id === id) as TableElement;
    
    // Nếu bàn có mergedId (là ID số trong DB), ta tìm bàn cha tương ứng trong sơ đồ
    if (table?.mergedId) {
      const masterTable = currentElements.find(el => el.id === `t_${table.mergedId}`);
      return masterTable ? masterTable.id : id;
    }
    return id;
  }, [floorData, currentCanvasKey]);

  // Các hàm tiện ích kéo thả (Rút gọn để tiết kiệm không gian chat, giữ nguyên logic của Đoan)
  const handleAddElement = (type: "table_rect" | "table_circle" | "wall" | "door") => {
    const newId = `el_${Date.now()}`;
    const newEl: FloorElement = type.startsWith("table")
      ? { id: newId, type: "table", name: "Mới", shape: type === "table_circle" ? "circle" : "rect", seats: 4, status: "empty", mergedId: null, x: 100, y: 100, width: 80, height: 80, rotation: 0 }
      : { id: newId, type: type as "wall" | "door", label: type === "wall" ? "Đồ vật" : "Cửa đi", x: 100, y: 100, width: 200, height: 40, rotation: 0, color: type === "wall" ? "#a8a29e" : undefined };

    setFloorData((prev) => ({ ...prev, [currentCanvasKey]: [...(prev[currentCanvasKey] || []), newEl] }));
    setSelectedElementId(newId);
  };

  const handleUpdateSelected = (updates: Partial<FloorElement>) => {
    if (!selectedElementId) return;
    setFloorData((prev) => {
      const currentData = [...(prev[currentCanvasKey] || [])];
      const index = currentData.findIndex((el) => el.id === selectedElementId);
      if (index === -1) return prev;
      currentData[index] = { ...currentData[index], ...updates } as any;
      return { ...prev, [currentCanvasKey]: currentData };
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    setFloorData((prev) => ({ ...prev, [currentCanvasKey]: prev[currentCanvasKey].filter((el) => el.id !== selectedElementId) }));
    setSelectedElementId(null);
  };

  const selectedElementDetails = useMemo(() => floorData[currentCanvasKey]?.find((el) => el.id === selectedElementId) || null, [selectedElementId, floorData, currentCanvasKey]);

  const handleSaveFloorPlan = (overrideData?: FloorPlanData) => {
    try {
      const tablesPayload: any[] = [];
      const archsPayload: any[] = [];

      // Sử dụng dữ liệu truyền vào (overrideData) hoặc dữ liệu từ State hiện tại
      const dataToProcess = overrideData || floorData;

      Object.entries(dataToProcess).forEach(([canvasKey, elements]) => {
        elements.forEach((el) => {
          if (el.type === "table") {
            const t = el as TableElement;
            tablesPayload.push({
              id: t.id,
              tableName: t.name, capacity: t.seats,
              x: t.x, y: t.y, width: t.width, height: t.height,
              shape: t.shape, rotation: t.rotation, floorName: canvasKey,
              mergedId: t.mergedId,
              status: t.status === "empty" ? "AVAILABLE" :
                t.status === "serving" ? "OCCUPIED" :
                  t.status === "maintenance" ? "MAINTENANCE" : "BOOKED"
            });
          } else {
            archsPayload.push({ ...el, floorName: canvasKey });
          }
        });
      });

      syncMutation.mutate({ tables: tablesPayload, architecturalData: JSON.stringify(archsPayload) }, {
        onSuccess: () => {
          toast.success("Đã lưu sơ đồ đồng bộ lên hệ thống!");
          setIsEditMode(false);
          setSelectedElementId(null);
        },
        onError: (err: any) => {
          const errorMsg = err.response?.data?.message || "Lỗi khi lưu sơ đồ.";
          toast.error(errorMsg);
          // ==========================================================
          // [VÁ LỖ HỔNG ẢO GIÁC UI]: KHÔI PHỤC LẠI GIAO DIỆN NHƯ CŨ TỪ SERVER
          // ==========================================================
          refetch();
        }
      });
    } catch (error) { toast.error("Lỗi dữ liệu khi lưu."); }
  };

  const handleUnmergeSpecificGroup = (tableId: string) => {
    const currentElements = floorData[currentCanvasKey] || [];
    const targetTable = currentElements.find(el => el.id === tableId) as TableElement;

    if (!targetTable) return;

    // Xác định ID của bàn cha (Master ID)
    // Nếu nó có mergedId thì masterId là mergedId đó
    // Nếu nó không có mergedId nhưng có bàn khác coi nó là cha (mergedId === id của nó) thì nó là master
    const masterId = targetTable.mergedId || parseInt(targetTable.id.replace('t_', ''));

    // Kiểm tra xem thực tế nó có đang gộp hay không
    const isActuallyMerged = targetTable.mergedId || currentElements.some(el => el.type === 'table' && (el as TableElement).mergedId === masterId);

    if (!isActuallyMerged) {
      toast.error("Bàn này không nằm trong cụm gộp nào.");
      return;
    }

    // Kiểm tra nhanh xem cụm này có bàn nào đang bận không
    const clusterTables = currentElements.filter(el => {
      if (el.type !== 'table') return false;
      const t = el as TableElement;
      return t.mergedId === masterId || parseInt(t.id.replace('t_', '')) === masterId;
    });

    const busyTables = clusterTables.filter(t => (t as TableElement).status === "serving" || (t as TableElement).status === "booked");
    if (busyTables.length > 0) {
      toast.error(`Không thể tách: Cụm bàn này đang có bàn đang phục vụ hoặc đã đặt chỗ!`);
      return;
    }

    if (confirm(`Tách cụm bàn liên quan đến bàn ${targetTable.name}?`)) {
      const newData = {
        ...floorData,
        [currentCanvasKey]: currentElements.map(el => {
          if (el.type === "table") {
            const t = el as TableElement;
            if (t.mergedId === masterId || parseInt(t.id.replace('t_', '')) === masterId) {
              return { ...t, mergedId: null };
            }
          }
          return el;
        })
      };

      setFloorData(newData as any);
      handleSaveFloorPlan(newData as any);
    }
  };

  // Tính size bản vẽ (Auto Crop)
  const canvasSize = useMemo(() => {
    const elements = floorData[currentCanvasKey] || [];
    let maxRight = 800, maxBottom = 600;
    elements.forEach((el) => {
      if (el.x + el.width > maxRight) maxRight = el.x + el.width;
      if (el.y + el.height > maxBottom) maxBottom = el.y + el.height;
    });
    return { width: maxRight + (isEditMode ? 400 : 80), height: maxBottom + (isEditMode ? 400 : 80) };
  }, [floorData, currentCanvasKey, isEditMode]);

  // --- MỤC 3: ĐỒNG BỘ MÀU SẮC (SYNC STATUS) ---
  const currentElements = useMemo(() => {
    const elements = floorData[currentCanvasKey] || [];
    if (isEditMode) return elements;

    // 1. Tạo bản đồ trạng thái của các bàn Master
    const masterStatuses = new Map<number, TableStatus>();
    elements.forEach(el => {
      if (el.type === "table") {
        const t = el as TableElement;
        const dbId = parseInt(t.id.replace('t_', ''));
        // Nếu là bàn Master (không có mergedId) và đang có khách/đặt chỗ
        if (!t.mergedId && (t.status === "serving" || t.status === "booked" || t.status === "cleaning")) {
          masterStatuses.set(dbId, t.status);
        }
      }
    });

    // 2. Ép trạng thái bàn con theo bàn Master
    const syncedElements = elements.map(el => {
      if (el.type === "table") {
        const t = el as TableElement;
        // Nếu bàn này là con và bàn Master của nó đang bận -> Đổi màu bàn con luôn
        if (t.mergedId && masterStatuses.has(t.mergedId)) {
          return { ...t, status: masterStatuses.get(t.mergedId) };
        }
      }
      return el;
    });

    // 3. Lọc theo Filter người dùng chọn (All/Empty/Serving)
    return syncedElements.filter((el) => filter === "all" || (el.type === "table" && (el as any).status === filter));
  }, [floorData, currentCanvasKey, filter, isEditMode]);

  // Context Menu
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, tableId: null as string | null });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  // --- MỤC 1: SỬA LOGIC CLICK ---
  const handleTableClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isEditMode) return;

    // Phân giải ID: Nếu click bàn con, lấy ID bàn cha
    const masterId = resolveMasterId(id);

    if (isMergeMode) {
      setSelectedMergeTables((prev) => 
        prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
      );
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setContextMenu({ 
        visible: true, 
        x: rect.left + rect.width / 2, 
        y: rect.bottom + 10, 
        tableId: masterId // GỬI MASTER ID VÀO CONTEXT MENU
      });
    }
  }, [isEditMode, isMergeMode, resolveMasterId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isEditMode) setSelectedElementId(null);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-app-bg" ref={mapRef}>
      {/* HEADER TÓM GỌN */}
      <div className="shrink-0 border-b border-stone-100 bg-white px-6 pt-6 lg:px-8">
        <PageHeader
          title="Sơ đồ bàn"
          description={isEditMode ? "Chế độ thiết kế sơ đồ." : "Quản lý trạng thái bàn."}
          action={
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-stone-100/50 p-1 shadow-inner border border-stone-200/50">
                <FloorSelector currentFloor={currentFloor} onSelectFloor={setCurrentFloor} disabled={isMergeMode || !isLoaded} />
                <div className="h-6 w-px bg-stone-300 hidden sm:block mx-1"></div>
                <div className="relative flex items-center">
                  <select value={currentRoom} onChange={(e) => setCurrentRoom(e.target.value)} disabled={isMergeMode || !isLoaded} className="cursor-pointer appearance-none rounded-lg border-none bg-transparent py-2 pl-3 pr-8 text-sm font-bold text-stone-600 outline-none">
                    {ROOM_OPTIONS.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-stone-400" />
                </div>
              </div>
              <button onClick={() => { isEditMode ? handleSaveFloorPlan() : setIsEditMode(true); }} className="bg-brand-dark text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm">
                {isEditMode ? "Lưu Sơ Đồ" : "Thiết Kế"}
              </button>
            </div>
          }
        />
      </div>

      {/* THANH CÔNG CỤ VẬN HÀNH */}
      {!isEditMode && (
        <div className="bg-app-bg flex shrink-0 items-center justify-between gap-4 px-6 py-4 lg:px-8 shadow-sm z-10">

          {/* Thanh Filter cũ */}
          <div className={cn("flex items-center gap-3 transition-opacity", isMergeMode ? "opacity-30 pointer-events-none" : "opacity-100")}>
            <button onClick={() => setFilter("all")} className={cn("px-4 py-2 rounded-xl text-xs font-bold", filter === "all" ? "bg-brand-dark text-white" : "bg-white border")}>Tất cả</button>
            <button onClick={() => setFilter("empty")} className={cn("px-4 py-2 rounded-xl text-xs font-bold", filter === "empty" ? "border-primary border-2" : "bg-white border")}>Trống</button>
            <button onClick={() => setFilter("serving")} className={cn("px-4 py-2 rounded-xl text-xs font-bold", filter === "serving" ? "border-primary border-2" : "bg-white border")}>Phục vụ</button>
          </div>

          {/* Thanh Công cụ Gộp bàn (MỚI) */}
          <div className="flex items-center gap-3">
            {isMergeMode ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                <span className="text-xs font-bold text-stone-500 mr-2">
                  Đã chọn: <span className="text-amber-600">{selectedMergeTables.length}</span> bàn
                </span>
                <button
                  onClick={() => { setIsMergeMode(false); setSelectedMergeTables([]); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border text-stone-500 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (selectedMergeTables.length < 2) {
                      toast.error("Vui lòng chọn ít nhất 2 bàn để gộp!"); return;
                    }

                    // ==========================================================
                    // [VÁ LỖ HỔNG SẬP DATABASE]: CHẶN GỘP BÀN ẢO (CHƯA LƯU)
                    // Vì bàn mới tạo trên UI có ID là el_17... Database chưa có ID thật
                    // ==========================================================
                    if (selectedMergeTables.some(id => id.startsWith('el_'))) {
                      toast.error("Vui lòng bấm 'Lưu Sơ Đồ' trước khi thực hiện gộp các bàn mới!");
                      return;
                    }

                    // Lấy ID thật của bàn Cha (Bàn chọn đầu tiên)
                    const masterIdStr = selectedMergeTables[0].replace('t_', '');
                    const masterId = parseInt(masterIdStr);

                    setFloorData(prev => {
                      const newData = [...(prev[currentCanvasKey] || [])];

                      // Cập nhật mergedId cho các bàn con
                      selectedMergeTables.slice(1).forEach(childId => {
                        const idx = newData.findIndex(el => el.id === childId);
                        if (idx !== -1) {
                          newData[idx] = { ...newData[idx], mergedId: masterId } as any;
                        }
                      });

                      return { ...prev, [currentCanvasKey]: newData };
                    });

                    // Lưu tự động lên BE luôn cho an toàn
                    handleSaveFloorPlan();
                    setIsMergeMode(false);
                    setSelectedMergeTables([]);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700"
                >
                  <Combine className="h-4 w-4" /> Xác nhận gộp
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsMergeMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 shadow-sm transition-all"
                >
                  <Combine className="h-4 w-4 text-stone-400" /> Gộp bàn
                </button>

                {/* NÚT TÁCH BÀN (UNMERGE) - Bổ sung thêm để hoàn thiện nghiệp vụ */}
                <button
                  onClick={() => {
                    // 1. Kiểm tra nhanh tại Frontend
                    const currentTables = floorData[currentCanvasKey] || [];
                    const busyTables = currentTables.filter(el =>
                      el.type === "table" &&
                      (el.status === "serving" || el.status === "booked")
                    );

                    if (busyTables.length > 0) {
                      toast.error(`Không thể tách bàn: Có ${busyTables.length} bàn đang phục vụ hoặc đã đặt chỗ. Vui lòng thanh toán hóa đơn trước!`);
                      return;
                    }

                    if (confirm("Tách toàn bộ bàn gộp trên sơ đồ này về lại trạng thái độc lập?")) {
                      // 2. Tạo dữ liệu mới để lưu
                      const newData = {
                        ...floorData,
                        [currentCanvasKey]: (floorData[currentCanvasKey] || []).map(el => {
                          if (el.type === "table") return { ...el, mergedId: null };
                          return el;
                        })
                      };

                      // 3. Cập nhật UI cục bộ cho mượt
                      setFloorData(newData as any);

                      // 4. Gọi hàm lưu với dữ liệu mới nhất (không dùng setTimeout)
                      handleSaveFloorPlan(newData as any);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 text-rose-500 hover:bg-rose-50 shadow-sm transition-all"
                >
                  Tách bàn
                </button>
              </>
            )}
          </div>

        </div>
      )}

      {/* CANVAS & SIDEBAR */}
      <div className="flex flex-1 overflow-hidden">
        {isEditMode && (
          <div className="w-72 shrink-0 border-r border-stone-100 bg-white p-4 shadow-xl z-20 overflow-y-auto">
            {!selectedElementDetails ? (
              <div className="space-y-4">
                <h2 className="font-bold">Thêm Bàn</h2>
                <button onClick={() => handleAddElement("table_rect")} className="w-full border p-2 rounded text-sm">Bàn Vuông</button>
                <button onClick={() => handleAddElement("table_circle")} className="w-full border p-2 rounded text-sm">Bàn Tròn</button>
                <h2 className="font-bold mt-4">Kiến trúc</h2>
                <button onClick={() => handleAddElement("wall")} className="w-full border p-2 rounded text-sm">Vật cản</button>
                <button onClick={() => handleAddElement("door")} className="w-full border p-2 rounded text-sm">Cửa đi</button>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setSelectedElementId(null)} className="flex items-center gap-2 text-sm text-stone-500"><ChevronLeft className="h-4 w-4" /> Quay lại</button>
                {selectedElementDetails.type === "table" ? (
                  <>
                    <label className="text-xs font-bold">Tên bàn</label>
                    <input value={(selectedElementDetails as TableElement).name} onChange={(e) => handleUpdateSelected({ name: e.target.value })} className="w-full border rounded p-2" />
                    <label className="text-xs font-bold">Số ghế</label>
                    <input type="number" value={(selectedElementDetails as TableElement).seats} onChange={(e) => handleUpdateSelected({ seats: parseInt(e.target.value) })} className="w-full border rounded p-2" />
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold">Tên (Label)</label>
                    <input value={(selectedElementDetails as ArchitecturalElement).label || ""} onChange={(e) => handleUpdateSelected({ label: e.target.value })} className="w-full border rounded p-2" />
                  </>
                )}
                <button onClick={handleDeleteSelected} className="w-full mt-4 bg-red-50 text-red-500 p-2 rounded font-bold">Xóa vật thể</button>
              </div>
            )}
          </div>
        )}

        <div className="relative flex-1 overflow-hidden bg-[#e5e5f7]">
          {isLoaded ? (
            <TransformWrapper
              initialScale={1}
              minScale={0.3}
              maxScale={2}
              limitToBounds={false}
              panning={{
                excluded: ["rnd-element", "rnd-resizer"]
              }}
              wheel={{
                disabled: true, // Tắt zoom mặc định (bug: step không hoạt động)
              }}
            >
              {({ zoomIn, zoomOut, resetTransform, state }) => (
                <>
                  <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-xl">
                    <button onClick={() => zoomIn()} className="p-2"><ZoomIn className="h-4 w-4" /></button>
                    <button onClick={() => zoomOut()} className="p-2"><ZoomOut className="h-4 w-4" /></button>
                  </div>
                  <CustomZoomHandler zoomIn={zoomIn} zoomOut={zoomOut}>
                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                      <div id="workspace-canvas" onClick={handleCanvasClick} className="relative bg-white shadow-2xl transition-colors" style={{ width: canvasSize.width, height: canvasSize.height }}>
                        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(#a8a29e 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }}></div>
                        <div className="relative z-10 h-full w-full pointer-events-none">
                          {currentElements.map((el) => (
                            <Rnd
                              key={el.id}
                              scale={state.scale}
                              position={{ x: el.x, y: el.y }}
                              size={{ width: el.width, height: el.height }}
                              disableDragging={!isEditMode}
                              enableResizing={isEditMode && selectedElementId === el.id}

                              onDragStart={() => isEditMode && setSelectedElementId(el.id)}
                              onResizeStart={() => isEditMode && setSelectedElementId(el.id)}

                              onDragStop={(e, d) => setFloorData(prev => {
                                const arr = [...(prev[currentCanvasKey] || [])];
                                const idx = arr.findIndex(a => a.id === el.id);
                                if (idx !== -1) {
                                  arr[idx] = {
                                    ...arr[idx],
                                    x: d.x,
                                    y: d.y
                                  } as any;
                                }
                                return { ...prev, [currentCanvasKey]: arr };
                              })}

                              onResizeStop={(e, dir, ref, delta, pos) => setFloorData(prev => {
                                const arr = [...(prev[currentCanvasKey] || [])];
                                const idx = arr.findIndex(a => a.id === el.id);
                                if (idx !== -1) {
                                  arr[idx] = {
                                    ...arr[idx],
                                    width: parseInt(ref.style.width),
                                    height: parseInt(ref.style.height),
                                    x: pos.x,
                                    y: pos.y
                                  } as any;
                                }
                                return { ...prev, [currentCanvasKey]: arr };
                              })}

                              className={cn("rnd-element pointer-events-auto", isEditMode && selectedElementId === el.id && "ring-2 ring-blue-500 z-50", !isEditMode && "z-10")}
                            >
                              <div
                                className="w-full h-full"
                                onClick={(e) => {
                                  if (isEditMode) {
                                    e.stopPropagation(); // Ngăn không cho Canvas nhận được sự kiện click này
                                    setSelectedElementId(el.id);
                                  }
                                }}
                              >
                                {el.type === "table" ? <TableNode table={el as TableElement} isEditMode={isEditMode} isMergeMode={isMergeMode} isSelected={selectedMergeTables.includes(el.id)} onClick={(e, id) => { if (!isEditMode) handleTableClick(e, id); }} /> : <ArchitecturalNode element={el as ArchitecturalElement} isEditMode={isEditMode} />}
                              </div>
                            </Rnd>
                          ))}
                        </div>
                      </div>
                    </TransformComponent>
                  </CustomZoomHandler>
                </>
              )}
            </TransformWrapper>
          ) : (
            <div className="flex h-full w-full items-center justify-center">Đang tải sơ đồ...</div>
          )}
        </div>
      </div>

      <ContextMenu
        visible={contextMenu.visible && !isEditMode}
        x={contextMenu.x}
        y={contextMenu.y}
        isMaintenance={
          (floorData[currentCanvasKey]?.find((t) => t.id === contextMenu.tableId) as any)?.status === "maintenance"
        }
        isMerged={(() => {
          if (!contextMenu.tableId) return false;
          const t = floorData[currentCanvasKey]?.find(el => el.id === contextMenu.tableId) as TableElement;
          if (!t) return false;
          const masterId = t.mergedId || parseInt(t.id.replace('t_', ''));
          return !!(t.mergedId || floorData[currentCanvasKey]?.some(el => el.type === 'table' && (el as TableElement).mergedId === masterId));
        })()}
        onUnmerge={() => {
          if (contextMenu.tableId) handleUnmergeSpecificGroup(contextMenu.tableId);
          setContextMenu({ ...contextMenu, visible: false });
        }}
        onOrder={() => { setOrderTableId(contextMenu.tableId); setIsOrderModalOpen(true); setContextMenu({ ...contextMenu, visible: false }); }}
        onMove={() => { toast.info("Đang chuyển bàn"); setContextMenu({ ...contextMenu, visible: false }); }}
        onPayment={() => { toast.info("Chuyển đến màn hình POS"); }}
        onToggleMaintenance={() => {
          // 1. Tìm và tính toán dữ liệu mới
          const currentElements = [...(floorData[currentCanvasKey] || [])];
          const idx = currentElements.findIndex((el) => el.id === contextMenu.tableId);

          if (idx !== -1) {
            const table = currentElements[idx] as TableElement;
            const nextStatus: TableStatus = table.status === "maintenance" ? "empty" : "maintenance";

            // Tạo mảng mới cho canvas hiện tại
            const updatedElements = [...currentElements];
            updatedElements[idx] = { ...table, status: nextStatus };

            // Tạo object dữ liệu tổng thể mới
            const nextFloorData = {
              ...floorData,
              [currentCanvasKey]: updatedElements
            };

            // 2. Cập nhật UI ngay lập tức
            setFloorData(nextFloorData as any);
            setContextMenu({ ...contextMenu, visible: false });
            toast.success(nextStatus === "empty" ? "Bàn đã sửa xong!" : "Đã báo hỏng bàn!");

            // 3. GỌI LƯU NGAY LẬP TỨC với dữ liệu vừa tính toán xong
            handleSaveFloorPlan(nextFloorData as any);
          }
        }}
      />

      <OrderMenuModal
        isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} tableId={orderTableId} tableName={orderTableName}
        onConfirmOrder={(id, items) => {
          // 1. Xử lý tableId: Nếu là chuỗi trống hoặc Takeaway thì gửi null, nếu có id thì parse sang số
          const cleanTableId = (id && id !== "TAKEAWAY") ? parseInt(id.replace('t_', '')) : null;

          // 2. Gửi nguyên mảng items từ Modal (vì Modal đã map chuẩn menuItemId và selectedChoiceIds rồi)
          createOrderMutation.mutate({ 
            tableId: cleanTableId, 
            items: items 
          }, {
            onSuccess: () => {
              if (id && id !== "TAKEAWAY") {
                setFloorData((prev) => ({ 
                  ...prev, 
                  [currentCanvasKey]: (prev[currentCanvasKey] || []).map((el) => el.id === id ? { ...el, status: "serving" } : el) 
                }));
              }
              toast.success(`Đã bắn order xuống bếp thành công!`);
              setIsOrderModalOpen(false);
            },
            onError: (error: any) => {
              const errorMsg = error.response?.data?.message || "Dữ liệu đầu vào không hợp lệ";
              toast.error(errorMsg, {
                duration: 5000,
              });
            }
          });
        }}
      />
    </div>
  );
}
