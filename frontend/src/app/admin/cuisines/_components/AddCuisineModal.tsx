import React, { useState } from "react";
import { Plus, PenLine, Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { FormLabel } from "@/components/shared/ui/FormLabel";
import { ActionFooter } from "@/components/shared/ui/ActionFooter";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface AddCuisineModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ĐỔI icon thành iconUrl
  onSuccess: (data: { name: string; iconUrl: string }) => void; 
}

export function AddCuisineModal({ isOpen, onClose, onSuccess }: AddCuisineModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍽️");

  const handleSave = () => {
    const cleanName = name.trim();
    const cleanIcon = icon.trim();

    if (!cleanName) {
      toast.error("Vui lòng nhập tên danh mục ẩm thực!");
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 50) {
      toast.error("Tên danh mục phải từ 2 đến 50 ký tự!");
      return;
    }

    // Kiểm tra JS thuần bằng Regex hệt như Backend
    const regex = /^[\p{L}0-9\s\-]+$/u;
    if (!regex.test(cleanName)) {
      toast.error("Tên danh mục không được chứa ký tự đặc biệt (Ví dụ: < > @ # !)");
      return;
    }

    if (!cleanIcon) {
      toast.error("Vui lòng chọn 1 biểu tượng (Emoji)!");
      return;
    }

    // 2. Truyền dữ liệu trùng khớp với DTO Backend
    onSuccess({
      name: cleanName,
      iconUrl: cleanIcon,
    });

    // Reset state
    setName("");
    setIcon("🍽️");
    onClose();
  };

  const handleCancel = () => {
    setName("");
    setIcon("🍽️");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="rounded-5xl overflow-hidden border-stone-100 bg-white p-0 sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-stone-100 p-8">
          <div className="flex items-center gap-4">
            <div className="text-primary-hover flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
              <Plus className="h-6 w-6" strokeWidth={3} />
            </div>
            <DialogTitle className="text-brand-dark m-0 text-2xl font-black tracking-tight uppercase">
              Thêm Danh Mục Mới
            </DialogTitle>
          </div>
          <DialogClose className="hover:text-brand-dark hidden rounded-full bg-stone-50 p-2.5 text-stone-400 transition-colors hover:bg-stone-200 sm:block">
            <X className="h-5 w-5" strokeWidth={2.5} />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-8 p-8 md:p-10">
          <DialogDescription className="sr-only">
            Nhập thông tin cho danh mục ẩm thực mới
          </DialogDescription>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-10">
            <div className="space-y-4 md:col-span-2">
              <FormLabel label="Biểu tượng (Emoji)" required />
              <div className="flex h-32 w-full items-center justify-center rounded-3xl border-2 border-stone-100 bg-stone-50 text-6xl">
                <input
                  type="text"
                  maxLength={5} // Giới hạn 5 ký tự (Vì 1 emoji thỉnh thoảng chiếm 2-4 bytes)
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-20 bg-transparent text-center outline-none"
                  placeholder="🍕"
                />
              </div>
              <p className="text-center text-[11px] font-medium text-stone-400 italic">Nhập 1 Emoji (Windows + .)</p>
            </div>
            <div className="space-y-4 md:col-span-3">
              <FormLabel label="Tên danh mục ẩm thực (*)" icon={PenLine} required />
              <Input
                type="text"
                maxLength={50} // KHOÁ MÕM NGAY TẠI BÀN PHÍM: Gõ đến chữ thứ 50 là tịt, không gõ được nữa
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Món Hàn Quốc..."
                size="lg"
              />
              <p className="text-[11px] font-medium text-stone-400 italic">
                Tên và Icon này sẽ xuất hiện trực tiếp trong ứng dụng của Khách hàng (Tối đa 50 ký tự).
              </p>
            </div>
          </div>
        </div>

        <ActionFooter
          onCancel={handleCancel}
          onConfirm={handleSave}
          confirmText="Lưu Danh Mục"
          className="bg-stone-50/80 p-8"
        />
      </DialogContent>
    </Dialog>
  );
}
