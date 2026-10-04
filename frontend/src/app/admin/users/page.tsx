"use client";

import React, { useState, useMemo } from "react";
import { Lock, Unlock, Users, Search, Mail, ShieldCheck } from "lucide-react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table/DataTable";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { ActionIconButton } from "@/components/shared/ui/ActionIconButton";
import { FilterBar } from "@/components/shared/ui/FilterBar";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  status: "ACTIVE" | "BANNED";
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // [CẬP NHẬT]: STATE QUẢN LÝ PHÂN TRANG GỌI API
  // ==========================================
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Truyền Search, Page, Size vào Hook
  const { data: usersData, isLoading } = useAdminUsers(searchQuery, pagination.pageIndex, pagination.pageSize);
  const updateStatusMutation = useUpdateUserStatus();

  // Hàm xử lý khi bấm nút Khóa / Mở khóa
  const handleToggleBan = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
    const actionName = newStatus === "BANNED" ? "khóa" : "mở khóa";

    if (window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`)) {
      updateStatusMutation.mutate(
        { id, status: newStatus },
        {
          onSuccess: () => toast.success(`Đã ${actionName} tài khoản thành công!`),
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "Thao tác thất bại!");
          }
        }
      );
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium text-stone-400">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Người dùng",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-700">{row.original.fullName}</p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "roles",
        header: "Vai trò",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase"
              >
                <ShieldCheck className="h-2.5 w-2.5 text-stone-400" />
                {role}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${row.original.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
            <span className={row.original.status === "ACTIVE" ? "text-emerald-600 font-bold text-sm" : "text-rose-600 font-bold text-sm"}>
              {row.original.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">Hành động</div>,
        cell: ({ row }) => {
          const user = row.original;
          const isBanned = user.status === "BANNED";
          
          if (user.roles?.includes("ADMIN")) return null;

          return (
            <div className="flex items-center justify-center gap-2">
              <ActionIconButton
                icon={isBanned ? Unlock : Lock}
                actionType={isBanned ? "unlock" : "lock"}
                title={isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                onClick={() => handleToggleBan(user.id, user.status)}
                disabled={updateStatusMutation.isPending}
              />
            </div>
          );
        },
      },
    ],
    [updateStatusMutation.isPending]
  );

  const usersList = useMemo(() => usersData?.content || [], [usersData]);

  return (
    <div className="bg-app-bg min-h-full space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Quản lý Người dùng"
        description="Quản lý tài khoản khách hàng và phân quyền hệ thống"
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
           setSearchQuery(val);
           setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page
        }}
        searchPlaceholder="Tìm tên hoặc email..."
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-4xl" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={usersList} 
          manualPagination={true}
          pageCount={usersData?.totalPages || -1}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalElements={usersData?.totalElements}
        />
      )}
    </div>
  );
}
