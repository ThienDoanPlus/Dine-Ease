import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ActionFooter } from "@/components/shared/ui/ActionFooter";

interface Category {
  id: string;
  name: string;
}

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoryManageModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManageModalProps) {
  const [newCatName, setNewCatName] = useState("");

  const handleAdd = () => {
    if (!newCatName.trim()) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }
    onAddCategory(newCatName);
    setNewCatName(""); // Reset input sau khi thêm
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="overflow-hidden rounded-3xl border-stone-100 bg-white p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between border-b border-stone-50 px-6 py-5">
          <DialogTitle className="text-brand-dark text-xl font-bold">Danh mục món</DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Tên danh mục mới..."
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleAdd}
              className="bg-brand-dark hover:bg-brand-dark-hover rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all"
            >
              Thêm
            </button>
          </div>
          <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="group flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3"
              >
                <span className="text-sm font-bold text-stone-700">{c.name}</span>
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="rounded-lg p-1.5 text-stone-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="py-4 text-center text-sm text-stone-400">Chưa có danh mục nào.</p>
            )}
          </div>
        </div>

        <ActionFooter
          onCancel={onClose}
          cancelText="Đóng"
          className="bg-stone-50/80 p-5" 
        />
      </DialogContent>
    </Dialog>
  );
}
