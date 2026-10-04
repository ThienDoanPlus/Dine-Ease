import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormLabel } from "@/components/shared/ui/FormLabel";
import { ActionFooter } from "@/components/shared/ui/ActionFooter";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface UpdateCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCommission: string | number;
  onSuccess: (newCommission: string, reason: string, applyToExisting: boolean) => void;
}

export function UpdateCommissionModal({
  isOpen,
  onClose,
  currentCommission,
  onSuccess,
}: UpdateCommissionModalProps) {
  const [newCommission, setNewCommission] = useState("");
  const [reason, setReason] = useState("");
  const [applyToExisting, setApplyToExisting] = useState(false);

  // Reset form mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setNewCommission("");
      setReason("");
      setApplyToExisting(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!newCommission || !reason.trim()) {
      toast.error("Vui lòng nhập mức hoa hồng mới và lý do thay đổi!");
      return;
    }

    // Truyền dữ liệu ngược lại cho Component cha xử lý (page.tsx)
    onSuccess(newCommission, reason, applyToExisting);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-5xl overflow-hidden border-stone-100 bg-white p-0 sm:max-w-3xl">
        <div className="space-y-8 p-8 md:p-10">
          {/* Header Cảnh báo */}
          <DialogHeader className="flex flex-row items-start gap-5 space-y-0 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
              <AlertTriangle className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-brand-dark text-2xl font-black tracking-tight uppercase">
                Xác nhận cập nhật cấu hình tài chính
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed font-medium text-stone-500">
                <span className="font-extrabold text-red-500">Cảnh báo:</span> Việc thay đổi mức hoa
                hồng sẽ ảnh hưởng trực tiếp đến doanh thu của nền tảng và các nhà hàng đối tác.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Body Form */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            <div className="space-y-3 md:col-span-3">
              <FormLabel label="Lý do thay đổi (Bắt buộc)" required />
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do, quyết định số mấy, ngày ban hành..."
                className="h-32 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400"
              ></textarea>
            </div>

            <div className="space-y-6 md:col-span-2">
              <div>
                <FormLabel label="Mức hoa hồng hiện tại" />
                <p className="text-3xl font-black text-stone-300">{currentCommission}.0%</p>
              </div>
              <div className="space-y-3">
                <FormLabel label="Mức hoa hồng mới" required />
                <div className="group relative">
                  <input
                    type="number"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    placeholder="Số từ 0 - 100"
                    className="text-brand-dark focus:border-primary w-full rounded-xl border-2 border-amber-400 bg-white px-4 py-3 text-xl font-black transition-all outline-none placeholder:text-base placeholder:font-medium placeholder:text-stone-300 focus:ring-4 focus:ring-amber-400/20"
                  />
                  <span className="text-primary absolute top-1/2 right-4 -translate-y-1/2 text-xl font-black">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI CHECKBOX HỒI TỐ NGUY HIỂM */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-red-600">Áp dụng hồi tố</h4>
              <p className="text-xs text-red-500 font-medium">
                Bật tuỳ chọn này sẽ lập tức thay đổi mức hoa hồng của TẤT CẢ các nhà hàng đang hoạt
                động bằng với mức mới này.
              </p>
            </div>
            <Switch
              checked={applyToExisting}
              onCheckedChange={setApplyToExisting}
              className="data-[state=checked]:bg-red-500"
            />
          </div>

          {/* Footer */}
          <ActionFooter
            onCancel={onClose}
            onConfirm={handleConfirm}
            confirmText="XÁC NHẬN THAY ĐỔI"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
