// src/components/restaurant/tables/OrderMenuModal.tsx
import React, { useState, useMemo } from "react";
import { X, Plus, Minus, FileEdit, Trash2, CheckCircle2, Search, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";

import { usePosCartStore, CartItem, CartOption } from "@/store/usePosCartStore";
// 1. IMPORT HOOKS GỌI DỮ LIỆU THẬT
import { useGetCategories, useGetMenuItems } from "@/hooks/useMenu";
import { useGetFloorPlan } from "@/hooks/useRestaurant";
import { Loader2 } from "lucide-react";

interface OrderMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string | null;
  tableName: string;
  onConfirmOrder: (tableId: string, items: any[]) => void;
}

export function OrderMenuModal({ isOpen, onClose, tableId, tableName, onConfirmOrder }: OrderMenuModalProps) {
  const [activeCat, setActiveCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // STATE CHO POPUP TÙY CHỈNH MÓN
  const [customizingDish, setCustomizingDish] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});

  const { carts, addToCart, updateQty, updateNote, removeCartItem, clearCart } = usePosCartStore();

  // 1. GỌI API LẤY DANH SÁCH BÀN ĐỂ TÌM THÔNG TIN GỘP
  const { data: floorPlanRaw } = useGetFloorPlan();
  const floorPlan = floorPlanRaw as any;

  // 2. GỌI API LẤY THỰC ĐƠN THẬT TỪ DATABASE
  const { data: catData, isLoading: isLoadingCats } = useGetCategories();
  const { data: dishData, isLoading: isLoadingDishes } = useGetMenuItems();

  const categories = (catData as any[]) || [];
  const dishes = (dishData as any[]) || [];

  // ==========================================================
  // [VÁ LỖ HỔNG GỘP BÀN]: PHÂN GIẢI MASTER KEY CHO GIỎ HÀNG
  // ==========================================================
  const currentTableKey = useMemo(() => {
    if (!tableId || tableId === "TAKEAWAY") return "TAKEAWAY";

    // Tìm bàn hiện tại trong data tổng
    const currentTable = floorPlan?.tables?.find((t: any) => `t_${t.id}` === tableId);
    
    // Nếu bàn này là bàn con (có mergedId), dùng ID bàn cha làm Key giỏ hàng
    if (currentTable?.mergedId) {
      return `t_${currentTable.mergedId}`;
    }
    
    return tableId;
  }, [tableId, floorPlan]);  const cart = carts[currentTableKey] || [];

  // ==========================================
  // [VÁ LỖ HỔNG DỮ LIỆU]: Gắn Option vào Payload API
  // ==========================================
  const handleConfirm = () => {
    if (cart.length === 0) return toast.error("Vui lòng chọn ít nhất 1 món!");
    
    // MAP CHÍNH XÁC TÊN TRƯỜNG THEO BACKEND DTO (OrderItemRequest)
    const apiPayload = cart.map(item => ({
      menuItemId: item.id,                         // Bắt buộc (Long)
      quantity: item.qty,                          // Bắt buộc (Integer)
      note: item.note || "",                       // Tùy chọn (String)
      selectedChoiceIds: item.options.map(o => o.id) // Bắt buộc (Mảng Long, có thể rỗng [])
    }));
    
    // TRUYỀN MASTER KEY RA NGOÀI ĐỂ BACKEND LƯU ORDER VÀO BÀN CHA
    onConfirmOrder(currentTableKey, apiPayload);
    clearCart(currentTableKey); 
  };

  const totalAmount = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.qty, 0), [cart]);
  
  // 3. LOGIC LỌC DỮ LIỆU THẬT
  const displayDishes = useMemo(() => {
    return dishes.filter((d) => {
      // Vì DB dùng tên danh mục hoặc ID, ta khớp theo Tên giống trang Menu
      const activeCatName = categories.find((c) => c.id.toString() === activeCat)?.name;
      const matchCat = activeCat === "all" || d.categoryName === activeCatName;
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isAvailable = d.status === "AVAILABLE"; // Chỉ hiện món đang bán
      
      return matchCat && matchSearch && isAvailable;
    });
  }, [activeCat, searchQuery, dishes, categories]);

  // XỬ LÝ CLICK MÓN ĂN
  const handleDishClick = (dish: any) => {
    if (dish.optionGroups && dish.optionGroups.length > 0) {
      setCustomizingDish(dish);
      setSelectedOptions({});
    } else {
      // Dùng currentTableKey thay vì tableId!
      addToCart(currentTableKey, dish, [], dish.price);
    }
  };

  // TÍNH TIỀN POPUP OPTIONS
  const popupTotalPrice = useMemo(() => {
    if (!customizingDish) return 0;
    let total = customizingDish.price;
    Object.keys(selectedOptions).forEach(groupId => {
      selectedOptions[parseInt(groupId)].forEach(choiceId => {
        customizingDish.optionGroups.forEach((g: any) => {
          const choice = g.choices.find((c: any) => c.id === choiceId);
          if (choice) total += choice.price;
        });
      });
    });
    return total;
  }, [customizingDish, selectedOptions]);

  const handleAddCustomizedDish = () => {
    // Validate Required
    for (const group of customizingDish.optionGroups) {
      if (group.isRequired && (!selectedOptions[group.id] || selectedOptions[group.id].length === 0)) {
        return toast.error(`Vui lòng chọn: ${group.name}`);
      }
    }

    const flatOptions: CartOption[] = [];
    Object.keys(selectedOptions).forEach(groupId => {
      selectedOptions[parseInt(groupId)].forEach(choiceId => {
        customizingDish.optionGroups.forEach((g: any) => {
          const choice = g.choices.find((c: any) => c.id === choiceId);
          if (choice) flatOptions.push({ id: choice.id, name: choice.name, price: choice.price });
        });
      });
    });

    addToCart(currentTableKey, customizingDish, flatOptions, popupTotalPrice);
    setCustomizingDish(null);
  };

  const handleToggleOption = (groupId: number, choiceId: number, maxChoices: number) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (maxChoices === 1) {
        return { ...prev, [groupId]: [choiceId] }; // Radio
      }
      if (current.includes(choiceId)) {
        return { ...prev, [groupId]: current.filter(id => id !== choiceId) }; // Checkbox toggle off
      }
      if (current.length < maxChoices) {
        return { ...prev, [groupId]: [...current, choiceId] }; // Checkbox toggle on
      }
      return prev;
    });
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            clearCart(currentTableKey); 
            onClose();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-none sm:max-w-[90vw] lg:max-w-[1100px] xl:max-w-[1300px] overflow-hidden rounded-[2rem] border-stone-100 bg-stone-50 p-0 shadow-2xl" showCloseButton={false}>
          
          <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
            <div>
              <DialogTitle className="text-xl font-black text-brand-dark">Ghi nhận Order</DialogTitle>
              <p className="text-sm font-bold text-amber-600">
                {tableId ? `Bàn: ${tableName}` : "Bán mang đi (Takeaway)"}
              </p>
            </div>
            <button 
              onClick={() => {
                clearCart(currentTableKey); 
                onClose();
              }} 
              className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>


          <div className="grid h-[75vh] grid-cols-1 md:grid-cols-12 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden border-r border-stone-200 bg-white md:col-span-7 lg:col-span-8">
              <div className="flex shrink-0 flex-col gap-4 border-b border-stone-100 p-4">
                <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><Input placeholder="Tìm tên món ăn..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 rounded-xl" /></div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  <button onClick={() => setActiveCat("all")} className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold transition-all ${activeCat === "all" ? "bg-amber-500 text-white shadow-md shadow-amber-200" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>Tất cả</button>
                  {isLoadingCats ? (
                    <div className="flex items-center px-4"><Loader2 className="animate-spin h-5 w-5 text-stone-400" /></div>
                  ) : (
                    categories.map((cat) => (
                      <button key={cat.id} onClick={() => setActiveCat(cat.id.toString())} className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold transition-all ${activeCat === cat.id.toString() ? "bg-amber-500 text-white shadow-md shadow-amber-200" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{cat.name}</button>
                    ))
                  )}
                </div>
              </div>

              <div className="custom-scrollbar grid flex-1 auto-rows-max grid-cols-2 gap-4 overflow-y-auto p-4 lg:grid-cols-3 xl:grid-cols-4">
                {isLoadingDishes ? (
                  <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin h-10 w-10 text-stone-300" />
                    <p className="text-stone-400 font-bold">Đang tải thực đơn...</p>
                  </div>
                ) : displayDishes.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-stone-400 font-bold">Không tìm thấy món ăn nào</div>
                ) : (
                  displayDishes.map((dish) => (
                    <div key={dish.id} onClick={() => handleDishClick(dish)} className="group cursor-pointer rounded-2xl border border-stone-100 bg-white p-3 transition-all h-fit hover:border-amber-400 hover:shadow-md relative">
                      {dish.optionGroups && dish.optionGroups.length > 0 && <div className="absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded-lg shadow-sm z-10"><Settings2 className="w-3 h-3" /></div>}
                      <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-stone-100">
                        <img src={dish.imageUrls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"} alt={dish.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <h4 className="line-clamp-2 min-h-[40px] text-sm font-bold text-stone-800">{dish.name}</h4>
                      <p className="mt-2 text-sm font-black text-amber-600">{formatCurrency(dish.price)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CỘT PHẢI: GIỎ HÀNG */}
            <div className="flex h-full flex-col overflow-hidden bg-stone-50 md:col-span-5 lg:col-span-4">
              <div className="shrink-0 border-b border-stone-200 bg-white p-4"><h3 className="font-bold text-stone-800">Món đã chọn ({cart.reduce((a, b) => a + b.qty, 0)})</h3></div>
              
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-stone-400"><FileEdit className="mb-2 h-10 w-10 opacity-20" /><p className="text-sm font-medium">Chưa có món nào được chọn</p></div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartItemId} className="rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-stone-800">{item.name}</p>
                          <p className="text-xs font-semibold text-stone-500">{formatCurrency(item.price)}</p>
                          {/* [VÁ LỖ HỔNG UI]: HIỂN THỊ TOPPING */}
                          {item.options.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.options.map((opt, i) => (
                                <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md font-medium">
                                  {opt.name} {opt.price > 0 && `(+${opt.price / 1000}k)`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-1">
                          <button onClick={() => updateQty(currentTableKey, item.cartItemId, -1)} className="rounded-md bg-white p-1 text-stone-600 shadow-sm hover:bg-stone-200"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                          <button onClick={() => updateQty(currentTableKey, item.cartItemId, 1)} className="rounded-md bg-white p-1 text-stone-600 shadow-sm hover:bg-stone-200"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3">
                        <input type="text" placeholder="Ghi chú (VD: ít cay...)" value={item.note} onChange={(e) => updateNote(currentTableKey, item.cartItemId, e.target.value)} className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs outline-none focus:border-amber-400 focus:bg-white" />
                        <button onClick={() => removeCartItem(currentTableKey, item.cartItemId)} className="rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="shrink-0 border-t border-stone-200 bg-white p-6">
                <div className="mb-4 flex items-end justify-between"><span className="text-sm font-bold text-stone-500">Tổng tạm tính:</span><span className="text-2xl font-black text-amber-600">{formatCurrency(totalAmount)}</span></div>
                <button onClick={handleConfirm} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all active:scale-[0.98] ${cart.length > 0 ? "bg-primary text-white shadow-lg hover:bg-primary-hover shadow-amber-500/30" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}><CheckCircle2 className="h-5 w-5" /> Gửi Bếp (In Phiếu)</button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================== */}
      {/* POPUP TÙY CHỈNH MÓN (TOPPINGS) - BẢN FIX LỖI GIAO DIỆN */}
      {/* ========================================== */}
      {customizingDish && (
        <Dialog open={!!customizingDish} onOpenChange={() => setCustomizingDish(null)}>
          <DialogContent 
            className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none bg-white shadow-2xl" 
            showCloseButton={false}
          >
            {/* HEADER: Màu nền tối để làm nổi bật tên món */}
            <div className="bg-[#2D2318] px-8 py-6 text-white relative">
              <DialogTitle className="text-2xl font-black">{customizingDish.name}</DialogTitle>
              <p className="text-amber-400 font-bold text-lg mt-1">{formatCurrency(customizingDish.price)}</p>
              
              {/* Nút đóng riêng cho Modal con */}
              <button 
                onClick={() => setCustomizingDish(null)}
                className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* BODY: Màu nền trắng rõ ràng, padding rộng rãi */}
            <div className="bg-white p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
              {customizingDish.optionGroups?.map((group: any) => (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-brand-dark text-base tracking-wide uppercase">
                      {group.name}
                    </h4>
                    <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                      {group.isRequired ? "Bắt buộc" : `Tối đa ${group.maxChoices}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {group.choices.map((choice: any) => {
                      const isSelected = (selectedOptions[group.id] || []).includes(choice.id);
                      return (
                        <label 
                          key={choice.id} 
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all",
                            isSelected 
                              ? "border-amber-400 bg-amber-50/50 ring-4 ring-amber-400/10" 
                              : "border-stone-100 bg-stone-50 hover:border-stone-200"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                              isSelected ? "border-amber-500 bg-amber-500" : "border-stone-300 bg-white"
                            )}>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={3} />}
                            </div>
                            <span className="font-bold text-stone-700">{choice.name}</span>
                          </div>
                          {choice.price > 0 && (
                            <span className="text-sm font-black text-amber-600">
                              +{formatCurrency(choice.price)}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER: Cố định phía dưới, có màu nền khác biệt */}
            <div className="bg-stone-50 border-t border-stone-100 p-6">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="text-left">
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">Tạm tính</p>
                  <p className="text-3xl font-black text-amber-600 leading-none">
                    {formatCurrency(popupTotalPrice)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-2xl h-14 font-bold border-stone-200 text-stone-500" 
                  onClick={() => setCustomizingDish(null)}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-[2] rounded-2xl h-14 font-black shadow-lg shadow-amber-500/20" 
                  onClick={handleAddCustomizedDish}
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
