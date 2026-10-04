import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActionFooterProps {
  onCancel: () => void;
  onConfirm?: () => void; // Thêm dấu ? để cho phép modal chỉ có 1 nút Hủy/Đóng
  cancelText?: string;
  confirmText?: string;
  isConfirmDisabled?: boolean; // Hỗ trợ disable khi đang loading gọi API
  isCancelDisabled?: boolean;
  className?: string;
}

export function ActionFooter({
  onCancel,
  onConfirm,
  cancelText = "Hủy bỏ",
  confirmText = "Xác nhận",
  isConfirmDisabled = false,
  isCancelDisabled = false,
  className,
}: ActionFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse items-center justify-end gap-4 border-t border-stone-100 pt-6 sm:flex-row",
        className
      )}
    >
      <Button 
        variant="outline" 
        size="xl" 
        uppercase 
        className="w-full sm:w-auto" 
        onClick={onCancel}
        disabled={isCancelDisabled}
      >
        {cancelText}
      </Button>

      {/* Chỉ render nút Xác nhận nếu có truyền hàm onConfirm */}
      {onConfirm && (
        <Button
          variant="primary"
          size="xl"
          uppercase
          className="w-full px-10 sm:w-auto"
          onClick={onConfirm}
          disabled={isConfirmDisabled}
        >
          {confirmText}
        </Button>
      )}
    </div>
  );
}
