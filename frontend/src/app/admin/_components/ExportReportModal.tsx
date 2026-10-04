import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ActionFooter } from "@/components/shared/ui/ActionFooter";
// IMPORT HOOK
import { useExportAdminReport } from "@/hooks/useAdmin";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Bổ sung nhận State thời gian từ Dashboard truyền vào (Tùy chọn)
  startDate?: string;
  endDate?: string;
}

export function ExportReportModal({ isOpen, onClose, startDate, endDate }: ExportReportModalProps) {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");
  const exportMutation = useExportAdminReport();

  const handleExport = () => {
    exportMutation.mutate(
      { format: exportFormat, startDate, endDate },
      {
        onSuccess: () => {
          toast.success(`Đã xuất báo cáo thành công dưới định dạng ${exportFormat.toUpperCase()}!`);
          onClose();
        },
        onError: () => toast.error("Có lỗi xảy ra khi xuất báo cáo!")
      }
    );
  };

  const isExporting = exportMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-4xl border-stone-100 bg-white p-0 text-center sm:max-w-md">
        <DialogHeader className="border-b border-stone-50 p-8">
          <div className="text-primary-hover mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 shadow-inner">
            <Download className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-brand-dark text-2xl font-black tracking-tight">Xuất báo cáo</DialogTitle>
          <DialogDescription className="mt-2 block w-full text-center text-sm text-stone-500">
            Chọn định dạng tệp bạn muốn tải xuống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <button onClick={() => setExportFormat("excel")} className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition-all ${exportFormat === "excel" ? "border-amber-400 bg-amber-50/50" : "border-stone-200 bg-stone-50 hover:border-amber-400"}`}>
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 shadow-sm transition-all ${exportFormat === "excel" ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-500 group-hover:bg-green-100 group-hover:text-green-700"}`}>
                <FileSpreadsheet className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-brand-dark font-bold">Microsoft Excel</p>
                <p className="text-xs font-medium text-stone-500">.xlsx (Dữ liệu đầy đủ nhất)</p>
              </div>
            </div>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm ${exportFormat === "excel" ? "border-primary" : "border-stone-300"}`}>
              {exportFormat === "excel" && <div className="bg-primary h-3 w-3 rounded-full"></div>}
            </div>
          </button>

          <button onClick={() => setExportFormat("pdf")} className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition-all ${exportFormat === "pdf" ? "border-amber-400 bg-amber-50/50" : "border-stone-200 bg-stone-50 hover:border-amber-400"}`}>
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 shadow-sm transition-all ${exportFormat === "pdf" ? "bg-red-100 text-red-700" : "bg-stone-200 text-stone-500 group-hover:bg-red-100 group-hover:text-red-700"}`}>
                <FileText className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-brand-dark font-bold">PDF Document</p>
                <p className="text-xs font-medium text-stone-500">.pdf (Dành cho trình bày)</p>
              </div>
            </div>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm ${exportFormat === "pdf" ? "border-primary" : "border-stone-300"}`}>
              {exportFormat === "pdf" && <div className="bg-primary h-3 w-3 rounded-full"></div>}
            </div>
          </button>
        </div>

        <ActionFooter
          onCancel={onClose}
          onConfirm={handleExport}
          cancelText="Hủy"
          confirmText={isExporting ? "Đang xuất..." : "Xuất Ngay"}
          isCancelDisabled={isExporting}
          isConfirmDisabled={isExporting}
          className="bg-stone-50/80 p-6"
        />
      </DialogContent>
    </Dialog>
  );
}
