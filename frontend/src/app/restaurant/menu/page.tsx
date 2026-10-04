"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, LayoutList, Edit, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

// Shared Components
import { DataTable } from "@/components/shared/table/DataTable";
import { Switch } from "@/components/ui/switch";
import { ActionIconButton } from "@/components/shared/ui/ActionIconButton";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { FilterBar } from "@/components/shared/ui/FilterBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Modals
import { CategoryManageModal } from "@/components/restaurant/menu/CategoryManageModal";
import { DishFormModal } from "@/components/restaurant/menu/DishFormModal";

// --- HOOKS API KẾT NỐI BACKEND ---
import {
  useGetCategories,
  useCreateCategory,
  useDeleteCategory,
  useGetMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUpdateMenuItemStatus
} from "@/hooks/useMenu";
import { formatCurrency, cn } from "@/lib/utils";

export default function MenuManagementPage() {
  // ... (States và logic giữ nguyên)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); 

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);

  const { data: catData, isLoading: isLoadingCats } = useGetCategories();
  const categories = (catData as any) || [];
  
  const { data: dishData, isLoading: isLoadingDishes } = useGetMenuItems();
  const dishes: any[] = (dishData as any[]) || [];

  const createCatMutation = useCreateCategory();
  const deleteCatMutation = useDeleteCategory();
  
  const createDishMutation = useCreateMenuItem();
  const updateDishMutation = useUpdateMenuItem();
  const deleteDishMutation = useDeleteMenuItem();
  const updateStatusMutation = useUpdateMenuItemStatus();

  const handleAddCategory = (name: string) => {
    createCatMutation.mutate(name, {
      onSuccess: () => toast.success("Thêm danh mục thành công"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Lỗi khi thêm danh mục"),
    });
  };

  const handleDeleteCategory = (id: string | number) => {
    if (confirm("Xóa danh mục này? Hệ thống sẽ không cho phép nếu danh mục đang chứa món ăn.")) {
      deleteCatMutation.mutate(id, {
        onSuccess: () => toast.success("Đã xóa danh mục"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Không thể xóa danh mục này"),
      });
    }
  };

  const handleSaveDish = (dishData: any, imageFiles: File[]) => {
    if (editingDish) {
      updateDishMutation.mutate(
        { id: editingDish.id, data: dishData, imageFiles },
        {
          onSuccess: () => {
            toast.success("Cập nhật món ăn thành công");
            setIsDishModalOpen(false);
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    } else {
      createDishMutation.mutate(
        { data: dishData, imageFiles },
        {
          onSuccess: () => {
            toast.success("Thêm món mới thành công");
            setIsDishModalOpen(false);
          },
          onError: () => toast.error("Thêm món thất bại"),
        }
      );
    }
  };

  const toggleDishStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "AVAILABLE" ? "SOLD_OUT" : "AVAILABLE";
    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => toast.success(newStatus === "AVAILABLE" ? "Đã mở bán lại món ăn" : "Đã báo hết hàng món này"),
        onError: () => toast.error("Lỗi cập nhật trạng thái"),
      }
    );
  };

  const deleteDish = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa món này khỏi thực đơn?")) {
      deleteDishMutation.mutate(id, {
        onSuccess: () => toast.success("Đã xóa món ăn khỏi thực đơn"),
        onError: () => toast.error("Lỗi khi xóa món ăn"),
      });
    }
  };

  const openEditDishModal = (dish: any) => {
    const matchedCat = categories.find((c: any) => c.name === dish.categoryName);
    setEditingDish({ ...dish, categoryId: matchedCat?.id });
    setIsDishModalOpen(true);
  };

  const openAddDishModal = () => {
    setEditingDish(null);
    setIsDishModalOpen(true);
  };

  // --- CẤU HÌNH CỘT BẢNG - BẢN FIX GIAO DIỆN ---
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "imageUrls",
        header: () => <div className="w-16 text-center">Ảnh</div>,
        cell: ({ row }) => {
          const isAvailable = row.original.status === "AVAILABLE";
          const firstImage = row.original.imageUrls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
          return (
            <div className={cn(
              "mx-auto h-16 w-16 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 transition-all",
              !isAvailable && "grayscale opacity-40 scale-95" // LÀM MỜ ẢNH KHI HẾT HÀNG
            )}>
              <Image src={firstImage} alt="Dish" width={64} height={64} className="h-full w-full object-cover" />
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Tên món & Mô tả",
        cell: ({ row }) => {
          const isAvailable = row.original.status === "AVAILABLE";
          return (
            <div className={cn("transition-all", !isAvailable && "opacity-50")}>
              <p className={cn(
                "text-brand-dark text-lg font-bold",
                !isAvailable && "text-stone-400 line-through decoration-stone-300" // GẠCH NGANG TÊN KHI HẾT HÀNG
              )}>
                {row.original.name}
                {row.original.isBestseller && isAvailable && (
                  <span className="ml-2 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase shadow-sm">
                    Bestseller
                  </span>
                )}
              </p>
              <p className={cn(
                "mt-0.5 text-[10px] font-black tracking-widest uppercase",
                isAvailable ? "text-primary-hover" : "text-stone-400"
              )}>
                {row.original.categoryName || "Khác"}
              </p>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-stone-500 italic">
                {row.original.status === "SOLD_OUT" ? "Hiện tại đã hết món" : (row.original.description || "Chưa có mô tả")}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Giá niêm yết",
        cell: ({ row }) => {
          const isAvailable = row.original.status === "AVAILABLE";
          return (
            <span className={cn(
              "text-lg font-black tabular-nums",
              isAvailable ? "text-brand-dark" : "text-stone-400 line-through" // LÀM MỜ GIÁ KHI HẾT HÀNG
            )}>
              {formatCurrency(row.original.price)}
            </span>
          );
        },
      },
      {
        id: "active",
        header: () => <div className="text-center">Trạng thái</div>,
        cell: ({ row }) => {
          const isAvailable = row.original.status === "AVAILABLE";
          return (
            <div className="flex flex-col items-center gap-1">
              <Switch
                checked={isAvailable}
                onCheckedChange={() => toggleDishStatus(row.original.id, row.original.status)}
                disabled={updateStatusMutation.isPending}
                className="data-[state=checked]:bg-emerald-500"
              />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter",
                isAvailable ? "text-emerald-600" : "text-rose-500"
              )}>
                {isAvailable ? "Đang bán" : "Hết hàng"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Quản lý</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <ActionIconButton 
              icon={Edit} 
              actionType="edit" 
              title="Sửa" 
              className="bg-stone-100 text-stone-600 hover:bg-amber-500 hover:text-white"
              onClick={() => openEditDishModal(row.original)} 
            />
            <ActionIconButton 
              icon={Trash2} 
              actionType="delete" 
              title="Xóa" 
              className="bg-stone-100 text-stone-600 hover:bg-rose-500 hover:text-white"
              onClick={() => deleteDish(row.original.id)} 
            />
          </div>
        ),
      },
    ],
    [categories, updateStatusMutation.isPending]
  );

  // --- LỌC DỮ LIỆU FRONTEND MƯỢT MÀ ---
  const filteredDishes = useMemo(() => {
    return dishes.filter((d: any) => {
      // 1. Map ID Category đang active với Tên Category của Món ăn
      const activeCatName = categories.find((c: any) => c.id.toString() === activeCategory)?.name;
      const matchCat = activeCategory === "all" || d.categoryName === activeCatName;
      
      // 2. Tìm kiếm tên
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCat && matchSearch;
    });
  }, [dishes, activeCategory, searchQuery, categories]);

  return (
    <div className="flex h-full flex-col overflow-hidden space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Quản lý Thực đơn"
        description="Quản lý danh sách món ăn, phân loại danh mục và cập nhật trạng thái phục vụ."
        action={
          <>
            <button onClick={openAddDishModal} className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white shadow-lg shadow-amber-200 transition-all active:scale-95">
              <Plus className="h-5 w-5" strokeWidth={2.5} /> Thêm món mới
            </button>
            <button onClick={() => setIsCatModalOpen(true)} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 font-bold text-stone-600 shadow-sm transition-all hover:bg-stone-50 active:scale-95">
              <LayoutList className="h-5 w-5" strokeWidth={2.5} /> Danh mục
            </button>
          </>
        }
      />

      {/* KHU VỰC ĐIỀU HƯỚNG VÀ TÌM KIẾM MỚI */}
      <div className="flex items-center gap-4 rounded-[2rem] border border-stone-100 bg-white p-2 shadow-sm">
        
        {/* 1. Ô tìm kiếm gọn nhẹ ở bên trái */}
        <div className="group relative w-72 shrink-0 ml-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm tên món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-stone-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-amber-400/20 border border-transparent focus:border-amber-400"
          />
        </div>

        {/* Đường kẻ ngăn cách (Divider) */}
        <div className="h-8 w-px bg-stone-100 shrink-0" />

        {/* 2. Danh mục món ăn có thể cuộn ngang */}
        <div className="flex-1 overflow-hidden">
          {isLoadingCats ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm font-bold px-4">
              <Loader2 className="animate-spin h-4 w-4" /> Đang tải...
            </div>
          ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList 
                variant="pill" 
                className="bg-transparent p-0 gap-2 overflow-x-auto no-scrollbar justify-start"
              >
                <TabsTrigger 
                  value="all" 
                  className="whitespace-nowrap rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white shadow-none"
                >
                  Tất cả
                </TabsTrigger>
                {categories.map((cat: any) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id.toString()}
                    className="whitespace-nowrap rounded-xl px-6 py-2 text-sm font-bold border border-transparent hover:bg-stone-50 data-[state=active]:bg-amber-500 data-[state=active]:text-white shadow-none"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      {/* Box chứa Table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm">
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {isLoadingDishes ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : (
            <DataTable columns={columns} data={filteredDishes} />
          )}
        </div>
      </div>

      {/* GỌI MODALS */}
      <CategoryManageModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <DishFormModal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        categories={categories}
        initialData={editingDish}
        onSave={handleSaveDish}
      />
    </div>
  );
}
