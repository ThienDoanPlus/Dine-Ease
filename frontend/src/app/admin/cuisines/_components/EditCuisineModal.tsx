import React, { useState, useEffect } from "react";
import { Edit3, PenLine, X } from "lucide-react";
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

interface EditCuisineModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuisine: { id: number; name: string; iconUrl: string } | null;
  onSuccess: (id: number, data: { name: string; iconUrl: string }) => void;
}

export function EditCuisineModal({ isOpen, onClose, cuisine, onSuccess }: EditCuisineModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  // Đổ dữ liệu cũ vào Form mỗi khi mở Modal
  useEffect(() => {
    if (isOpen && cuisine) {
      setName(cuisine.name);
      setIcon(cuisine.iconUrl);
    }
  }, [isOpen, cuisine]);

  const handleSave = () => {
    const cleanName = name.trim();
    const cleanIcon = icon.trim();

    if (!cleanName) return toast.error("Vui lòng nhập tên danh mục ẩm thực!");
    if (cleanName.length < 2 || cleanName.length > 50) return toast.error("Tên danh mục phải từ 2 đến 50 ký tự!");
    
    // Validate Regex giống Backend
    const regex = /^[\p{L}0-9\s\-]+$/u;
    if (!regex.test(cleanName)) return toast.error("Tên danh mục không được chứa ký tự đặc biệt");
    if (!cleanIcon) return toast.error("Vui lòng chọn 1 biểu tượng (Emoji)!");

    if (cuisine) {
      onSuccess(cuisine.id, { name: cleanName, iconUrl: cleanIcon });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-5xl overflow-hidden border-stone-100 bg-white p-0 sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-stone-100 p-8">
          <div className="flex items-center gap-4">
            <div className="text-blue-600 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
              <Edit3 className="h-6 w-6" strokeWidth={3} />
            </div>
            <DialogTitle className="text-brand-dark m-0 text-2xl font-black tracking-tight uppercase">
              Chỉnh Sửa Danh Mục
            </DialogTitle>
          </div>
          <DialogClose className="hover:text-brand-dark hidden rounded-full bg-stone-50 p-2.5 text-stone-400 transition-colors hover:bg-stone-200 sm:block">
            <X className="h-5 w-5" strokeWidth={2.5} />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-8 p-8 md:p-10">
          <DialogDescription className="sr-only">Nhập thông tin chỉnh sửa</DialogDescription>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-10">
            <div className="space-y-4 md:col-span-2">
              <FormLabel label="Biểu tượng (Emoji)" required />
              <div className="flex h-32 w-full items-center justify-center rounded-3xl border-2 border-stone-100 bg-stone-50 text-6xl">
                <input
                  type="text"
                  maxLength={5}
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-20 bg-transparent text-center outline-none"
                />
              </div>
            </div>
            <div className="space-y-4 md:col-span-3">
              <FormLabel label="Tên danh mục ẩm thực (*)" icon={PenLine} required />
              <Input
                type="text"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Món Hàn Quốc..."
                size="lg"
              />
            </div>
          </div>
        </div>

        <ActionFooter
          onCancel={onClose}
          onConfirm={handleSave}
          confirmText="Lưu Thay Đổi"
          className="bg-stone-50/80 p-8"
        />
      </DialogContent>
    </Dialog>
  );
}
