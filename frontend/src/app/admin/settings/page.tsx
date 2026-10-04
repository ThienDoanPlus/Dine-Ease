"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Percent, History } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

// Import UI Components
import { DataTable } from "@/components/shared/table/DataTable";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { FilterBar } from "@/components/shared/ui/FilterBar";
import { DateRangePicker } from "@/components/shared/ui/DateRangePicker";
import { UpdateCommissionModal } from "./_components/UpdateCommissionModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetCommission, useGetAuditLogs, useUpdateCommission } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/utils";

interface AuditLog {
  id: string;
  time: string;
  actor: { name: string; avatar: string };
  action: string;
  oldValue: string;
  newValue: string;
  reason: string;
  isSystem: boolean;
}

export default function FinancialConfigPage() {
  const { data: currentCommission = "15" } = useGetCommission();
  
  // State DatePicker
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // State Chốt API
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // TRUYỀN VÀO HOOK
  const { data: auditLogsData, isLoading } = useGetAuditLogs(appliedStartDate, appliedEndDate);
  const updateCommissionMutation = useUpdateCommission();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyDate = () => {
    if ((tempStartDate && !tempEndDate) || (!tempStartDate && tempEndDate)) {
      toast.error("Vui lòng chọn đầy đủ cả Ngày bắt đầu và Ngày kết thúc!");
      return;
    }
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    toast.success("Đã cập nhật lịch sử theo ngày!");
  };

  const handleClearDate = () => {
    setTempStartDate("");
    setTempEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    toast.success("Đã xóa bộ lọc, hiển thị toàn bộ lịch sử!");
  };

  // Hàm xử lý lưu
  const handleUpdateSuccess = (newComm: string, newReason: string, applyToExisting: boolean) => {
    updateCommissionMutation.mutate(
      { newCommissionRate: newComm, reason: newReason, applyToExisting },
      {
        onSuccess: () => {
          toast.success(`Cập nhật thành công mức hoa hồng mới: ${newComm}%`);
          setIsModalOpen(false);
        },
        onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại!"),
      }
    );
  };

  // Lấy danh sách Logs (Spring Boot bọc trong trường `content`) và sắp xếp (mới nhất lên đầu)
  const logs = useMemo(() => {
    if (!auditLogsData?.content) return [];
    
    // Tạo một bản sao và sắp xếp (mới nhất lên đầu)
    return [...auditLogsData.content].sort((a: any, b: any) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [auditLogsData]);

  const filteredLogs = logs.filter((log: any) => {
    // Rút trích an toàn: Nếu null thì mặc định là chuỗi rỗng ""
    const actorName = log.actor?.name || "";
    const logReason = log.reason || "";
    const searchLower = searchQuery.toLowerCase();

    return (
      actorName.toLowerCase().includes(searchLower) ||
      logReason.toLowerCase().includes(searchLower)
    );
  });

  // Cấu hình Cột bảng
  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-stone-400">#{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "time",
      header: "Thời gian",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-stone-600">
          {formatDateTime(row.original.time)}
        </span>
      ),
    },
    {
      accessorKey: "actor",
      header: "Người thực hiện",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-stone-200 shadow-sm">
              <Image
                src={log.actor.avatar}
                fill
                alt={log.actor.name}
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span className="text-brand-dark text-sm font-black">{log.actor.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Hành động",
      cell: ({ row }) => (
        <span className="text-brand-dark text-sm font-bold">{row.getValue("action")}</span>
      ),
    },
    {
      accessorKey: "values",
      header: "Giá trị",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-black text-stone-400">
              {log.oldValue}
            </span>
            <span className="text-stone-300">→</span>
            <span className="text-primary-hover bg-primary-light border-primary/20 rounded-md border px-2.5 py-1 text-sm font-black">
              {log.newValue}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Lý do - Ghi chú",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-stone-500 italic">{row.getValue("reason")}</span>
      ),
    },
  ];

  return (
    <div className="bg-app-bg min-h-full space-y-8 p-8">
      <PageHeader
        title="Cấu hình tài chính"
        description="Thiết lập các thông số mặc định của nền tảng. Yêu cầu quyền Super Admin."
      />

      {/* Commission Card */}
      <div className="glass-panel flex flex-col items-start justify-between gap-6 rounded-4xl p-8 transition-all hover:shadow-xl md:flex-row md:items-center">
        <div className="flex items-start gap-6">
          <div className="bg-primary-light text-primary border-primary/20 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border shadow-sm">
            <Percent className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-brand-dark text-lg font-black tracking-wide uppercase">
              Mức hoa hồng mặc định
            </h2>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                Đang áp dụng:
              </span>
              <div className="text-primary-hover rounded-xl border-2 border-stone-100 bg-stone-50 px-6 py-2.5 text-2xl font-black shadow-inner">
                {currentCommission}.0%
              </div>
            </div>
            <p className="mt-4 max-w-xl text-xs leading-relaxed font-medium text-stone-400 italic">
              * Mức phí này sẽ tự động áp dụng cho các nhà hàng đăng ký mới hoặc các nhà hàng đang
              sử dụng cấu hình mặc định.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="xl"
          className="w-full md:w-auto text-sm"
        >
          Cập nhật mức hoa hồng
        </Button>
      </div>

      {/* Audit Log Section */}
      <div className="space-y-6">
        <h2 className="text-brand-dark flex items-center gap-2 text-lg font-bold tracking-wide uppercase">
          <History className="h-5 w-5 text-stone-400" strokeWidth={2.5} /> LỊCH SỬ ĐIỀU CHỈNH -
          AUDIT LOG
        </h2>

        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm theo tên Admin, lý do..."
        >
          <DateRangePicker
            startDate={tempStartDate}
            endDate={tempEndDate}
            onStartDateChange={setTempStartDate}
            onEndDateChange={setTempEndDate}
            onApply={handleApplyDate}
            onClear={handleClearDate}
            className="px-6 py-3"
          />
        </FilterBar>

        <DataTable columns={columns} data={filteredLogs} />
      </div>

      {/* MODAL - Cập nhật Hoa hồng */}
      <UpdateCommissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentCommission={currentCommission}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
