"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Eye, Trash2, CheckCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table/DataTable";
import { SegmentedControl } from "@/components/shared/ui/SegmentedControl";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { FilterBar } from "@/components/shared/ui/FilterBar";
import { ActionIconButton } from "@/components/shared/ui/ActionIconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Import Hooks API
import { useAdminRestaurants, useUpdateRestaurantStatus } from "@/hooks/useAdmin";

export default function PartnerManagementPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const tabMapping = [
    { label: "Tất cả", value: "Tất cả" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đã duyệt", value: "APPROVED" },
    { label: "Bị từ chối", value: "REJECTED" },
  ];

  // GỌI API THỰC TẾ
  const { data: responseData, isLoading } = useAdminRestaurants(searchQuery, activeTab, 0, 100);
  const updateStatusMutation = useUpdateRestaurantStatus();

  const partners = responseData?.content || [];

  // HÀNH ĐỘNG DUYỆT (Kích hoạt Email Async ở Backend)
  const handleApprove = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn DUYỆT nhà hàng này? Hệ thống sẽ tạo tài khoản và gửi Email tự động.")) {
      updateStatusMutation.mutate(
        { id, data: { status: "APPROVED", commissionRate: 15.0 } },
        {
          onSuccess: () => toast.success(`Hồ sơ #${id} đã được phê duyệt! Email chứa mật khẩu đã được gửi cho đối tác.`),
          onError: () => toast.error("Có lỗi xảy ra khi phê duyệt.")
        }
      );
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-sm text-stone-400">#{row.original.id}</span> },
    { accessorKey: "name", header: "Tên Nhà Hàng", cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: "owner", header: "Chủ sở hữu", cell: ({ row }) => <div><p className="font-bold">{row.original.ownerName}</p><p className="text-[11px] text-stone-500">{row.original.ownerEmail}</p></div> },
    {
      accessorKey: "status", header: "Trạng thái", cell: ({ row }) => {
        const s = row.original.status;
        if (s === "PENDING") return <StatusBadge label="Chờ duyệt" variant="warning" pulse />;
        if (s === "APPROVED" || s === "ACTIVE") return <StatusBadge label="Đã duyệt" variant="success" />;
        return <StatusBadge label={s} variant="default" />;
      }
    },
    {
      id: "actions", header: () => <div className="text-center">Hành động</div>, cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-2">
            {row.original.status === "PENDING" && <ActionIconButton icon={CheckCircle} actionType="approve" title="Duyệt" onClick={() => handleApprove(row.original.id)} />}
            <ActionIconButton icon={Eye} actionType="view" title="Xem" href={`/admin/${row.original.id}`} />
          </div>
        );
      }
    },
  ], []);

  const filteredPartners = partners.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-app-bg min-h-full space-y-6 p-6 lg:p-8">
      <PageHeader title="Yêu cầu duyệt (Đối tác)" />
      <div className="mb-2">
        <SegmentedControl
          variant="default"
          value={activeTab}
          onChange={setActiveTab}
          options={tabMapping}
        />
      </div>
      <FilterBar searchValue={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Tìm tên..." />
      {isLoading ? <div>Đang tải dữ liệu...</div> : <DataTable columns={columns} data={filteredPartners} />}
    </div>
  );
}
