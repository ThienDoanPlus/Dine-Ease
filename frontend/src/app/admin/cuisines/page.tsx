"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table/DataTable";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { FilterBar } from "@/components/shared/ui/FilterBar";
import { ActionIconButton } from "@/components/shared/ui/ActionIconButton";
import { AddCuisineModal } from "./_components/AddCuisineModal";
import { EditCuisineModal } from "./_components/EditCuisineModal"; // IMPORT MODAL SỬA
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Import Hooks gọi API Backend
import { useAdminCuisines, useCreateCuisine, useDeleteCuisine, useUpdateCuisine } from "@/hooks/useAdmin";

interface Cuisine {
  id: number;
  name: string;
  iconUrl: string;
}

export default function CuisineManagementPage() {
  // --- KẾT NỐI API ---
  const { data: cuisinesData = [], isLoading } = useAdminCuisines();
  const createCuisineMutation = useCreateCuisine();
  const deleteCuisineMutation = useDeleteCuisine();
  const updateCuisineMutation = useUpdateCuisine(); // GỌI HOOK UPDATE

  // --- STATE TÌM KIẾM & MODAL ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // STATE CHO CHỨC NĂNG SỬA
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState<Cuisine | null>(null);

  // --- LOGIC GỌI API ---
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      deleteCuisineMutation.mutate(id, {
        onSuccess: () => toast.success("Đã xóa danh mục thành công!"),
        onError: () => toast.error("Xóa thất bại. Có thể danh mục đang được sử dụng.")
      });
    }
  };

  const handleAddSuccess = (data: { name: string; iconUrl: string }) => {
    createCuisineMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Đã thêm danh mục "${data.name}" thành công!`);
        setIsAddModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Thêm danh mục thất bại!");
      }
    });
  };

  // HÀM XỬ LÝ KHI BẤM LƯU TỪ MODAL SỬA
  const handleEditSuccess = (id: number, data: { name: string; iconUrl: string }) => {
    updateCuisineMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success(`Đã cập nhật danh mục thành "${data.name}"!`);
          setIsEditModalOpen(false);
          setEditingCuisine(null);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Cập nhật thất bại!");
        }
      }
    );
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = useMemo<ColumnDef<Cuisine>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-sm font-bold text-stone-400">#{row.original.id}</span>,
      },
      {
        accessorKey: "iconUrl",
        header: "Icon",
        cell: ({ row }) => (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-2xl shadow-sm">
            {row.original.iconUrl}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Tên Danh Mục",
        cell: ({ row }) => <span className="text-brand-dark text-base font-extrabold">{row.original.name}</span>,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Hành động</div>,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <ActionIconButton
                icon={Edit}
                actionType="edit"
                title="Sửa"
                onClick={() => {
                  // MỞ FORM SỬA VÀ ĐỔ DỮ LIỆU
                  setEditingCuisine(row.original);
                  setIsEditModalOpen(true);
                }}
              />
              <ActionIconButton
                icon={Trash2}
                actionType="delete"
                title="Xóa"
                onClick={() => handleDelete(row.original.id)}
                disabled={deleteCuisineMutation.isPending}
              />
            </div>
          );
        },
      },
    ],
    [deleteCuisineMutation.isPending]
  );

  // --- BỘ LỌC TÌM KIẾM Ở FRONTEND ---
  const sortedAndFilteredCuisines = useMemo(() => {
    if (!cuisinesData) return [];
    return cuisinesData
      .filter((c: Cuisine) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a: Cuisine, b: Cuisine) => b.id - a.id); // Mới nhất lên đầu
  }, [cuisinesData, searchQuery]);

  return (
    <div className="bg-app-bg min-h-full space-y-8 p-8">
      <PageHeader
        title="Danh Mục Ẩm Thực (Cuisine)"
        description="Quản lý các thẻ phân loại nhà hàng/món ăn hiển thị trên ứng dụng khách hàng."
        action={
          <Button size="lg" className="rounded-2xl shadow-xl shadow-stone-200" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-5 w-5" strokeWidth={2.5} /> Thêm danh mục mới
          </Button>
        }
      />

      <FilterBar searchValue={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Tìm kiếm tên danh mục..." />

      {isLoading ? (
        <div className="space-y-4">
           <Skeleton className="h-12 w-full rounded-2xl" />
           <Skeleton className="h-64 w-full rounded-4xl" />
        </div>
      ) : (
        <DataTable columns={columns} data={sortedAndFilteredCuisines} searchValue={searchQuery} />
      )}

      {/* Modal: Thêm Danh Mục */}
      <AddCuisineModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleAddSuccess} />

      {/* Modal: Sửa Danh Mục (Gắn vào đây) */}
      <EditCuisineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCuisine(null);
        }}
        cuisine={editingCuisine}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
