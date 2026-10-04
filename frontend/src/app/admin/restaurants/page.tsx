"use client";

import React, { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Edit, Lock, Unlock, Star } from "lucide-react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table/DataTable";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { FilterBar } from "@/components/shared/ui/FilterBar";
import { FilterSelect } from "@/components/shared/ui/FilterSelect";
import { ActionIconButton } from "@/components/shared/ui/ActionIconButton";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// --- GỌI API HOOKS ---
import { useAdminRestaurants, useUpdateRestaurantStatus } from "@/hooks/useAdmin";

// Khớp chuẩn 100% với DTO RestaurantAdminResponse của Backend
interface RestaurantData {
  id: number;
  name: string;
  cuisineName: string;
  imageUrl: string;
  commissionRate: number;
  rating: number;
  status: string;
}

export default function RestaurantManagementPage() {
  const router = useRouter();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- HOOKS KẾT NỐI SERVER ---
  const { data: restaurantsData, isLoading } = useAdminRestaurants(
    debouncedSearch,
    statusFilter,
    pagination.pageIndex,
    pagination.pageSize
  );
  
  const updateStatusMutation = useUpdateRestaurantStatus();

  // --- ACTIONS ---
  const handleToggleLock = (id: number, currentStatus: string, currentCommission: number) => {
    const isActive = currentStatus === "ACTIVE" || currentStatus === "APPROVED";
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    
    updateStatusMutation.mutate({
      id,
      data: { 
        status: newStatus, 
        commissionRate: currentCommission // <--- TRUYỀN THÊM TRƯỜNG NÀY ĐỂ ĐỒNG BỘ DTO BACKEND
      }
    }, {
      onSuccess: () => {
        toast.success(`Đã ${isActive ? "khóa" : "mở khóa"} nhà hàng #${id}`);
      },
      onError: () => {
        toast.error("Cập nhật trạng thái thất bại!");
      }
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("Tất cả");
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  // --- COLUMNS CHO DATA TABLE ---
  const columns = useMemo<ColumnDef<RestaurantData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-stone-400">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Tên Nhà Hàng",
        cell: ({ row }) => {
          const restaurant = row.original;
          const isInactive = restaurant.status !== "ACTIVE" && restaurant.status !== "APPROVED";
          return (
            <div className="flex items-center gap-4">
              <div className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-100 shadow-sm ${isInactive ? "grayscale opacity-60" : ""}`}>
                <Image
                  src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200"}
                  fill
                  className="object-cover"
                  alt={restaurant.name}
                  sizes="48px"
                />
              </div>
              <div>
                <p className={`text-base font-black ${isInactive ? "text-stone-500" : "text-brand-dark"}`}>
                  {restaurant.name}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-stone-400 italic">
                  Tag: {restaurant.cuisineName || "Khác"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "commissionRate",
        header: "Hoa hồng",
        cell: ({ row }) => (
          <span className="text-sm font-black text-stone-500">{row.original.commissionRate}%</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Đánh giá",
        cell: ({ row }) => {
          const isActive = row.original.status === "ACTIVE" || row.original.status === "APPROVED";
          return (
            <div className="flex items-center gap-1.5">
              <Star className={`fill-amber-500 text-amber-500 h-4 w-4 ${!isActive ? "opacity-50 grayscale" : ""}`} />
              <span className="text-sm font-bold text-stone-700">{row.original.rating || "5.0"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isActive = row.original.status === "ACTIVE" || row.original.status === "APPROVED";
          return (
            <Switch
              checked={isActive}
              // TRUYỀN THÊM commissionRate
              onCheckedChange={() => handleToggleLock(row.original.id, row.original.status, row.original.commissionRate)}
              className="data-[state=checked]:bg-emerald-500"
              disabled={updateStatusMutation.isPending}
            />
          );
        }
      },
      {
        id: "actions",
        header: () => <div className="text-center">Hành động</div>,
        cell: ({ row }) => {
          const restaurant = row.original;
          const isActive = restaurant.status === "ACTIVE" || restaurant.status === "APPROVED";
          return (
            <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <ActionIconButton
                icon={Edit}
                actionType="edit"
                title="Xem chi tiết hồ sơ"
                href={`/admin/${restaurant.id}`}
              />
              <ActionIconButton
                icon={isActive ? Lock : Unlock}
                actionType={isActive ? "lock" : "unlock"}
                title={isActive ? "Tạm khóa nhà hàng" : "Mở khóa nhà hàng"}
                // TRUYỀN THÊM commissionRate
                onClick={() => handleToggleLock(restaurant.id, restaurant.status, restaurant.commissionRate)}
                disabled={updateStatusMutation.isPending}
              />
            </div>
          );
        },
      },
    ],
    [updateStatusMutation.isPending]
  );

  const restaurantsList = useMemo(() => restaurantsData?.content || [], [restaurantsData]);

  return (
    <div className="bg-app-bg min-h-full space-y-8 p-8">
      <PageHeader
        title="Danh sách nhà hàng"
        description="Quản lý thông tin và trạng thái đóng/mở của các đối tác đang hoạt động trên hệ thống."
        action={
          <button onClick={() => router.push("/admin/partners")} className="bg-brand-dark hover:bg-brand-dark-hover flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-stone-200 transition-all active:scale-95">
            <Plus className="h-5 w-5" strokeWidth={2.5} /> Duyệt đối tác mới
          </button>
        }
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }}
        searchPlaceholder="Nhập tên nhà hàng..."
      >
        <FilterSelect
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
          }}
          options={[
            { value: "Tất cả", label: "Trạng thái: Tất cả" },
            { value: "ACTIVE", label: "Đang hoạt động" },
            { value: "INACTIVE", label: "Tạm khóa" },
          ]}
          className="bg-stone-50 text-sm"
        />

        <button onClick={handleClearFilters} className="px-5 py-3 text-sm font-bold whitespace-nowrap text-stone-500 transition-colors hover:text-red-500">
          Xóa bộ lọc
        </button>
      </FilterBar>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-4xl" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={restaurantsList} 
          manualPagination={true}
          pageCount={restaurantsData?.totalPages || -1}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalElements={restaurantsData?.totalElements}
        />
      )}
    </div>
  );
}
