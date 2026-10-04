"use client";

import React, { useState } from "react";
import { Key, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormGroup } from "@/components/customer/shared/FormGroup";
import { useChangePassword } from "@/hooks/useCustomer";
import { useAuthContext } from "@/providers/AuthProvider";

export default function PasswordPage() {
  const { logoutContext } = useAuthContext();
  const changePasswordMutation = useChangePassword();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isValid = formData.oldPassword && formData.newPassword.length >= 6 && formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(formData);
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      
      // Vì Token Version ở Backend đã tăng lên 1, Token hiện tại sẽ chết ngay lập tức.
      // Do đó ta tự động gọi hàm Đăng xuất để xóa Cookie sạch sẽ và đẩy về trang Login.
      setTimeout(() => {
        logoutContext();
      }, 1500);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm lg:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Key className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#2D2318]">Đổi mật khẩu</h2>
          <p className="text-sm text-stone-500">Bảo mật tài khoản của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <FormGroup label="Mật khẩu hiện tại" required>
          <Input
            type="password"
            variant="customer"
            size="customer"
            value={formData.oldPassword}
            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
            placeholder="Nhập mật khẩu đang sử dụng"
          />
        </FormGroup>

        <FormGroup label="Mật khẩu mới" required>
          <Input
            type="password"
            variant="customer"
            size="customer"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Ít nhất 6 ký tự"
          />
        </FormGroup>

        <FormGroup label="Xác nhận mật khẩu mới" required>
          <Input
            type="password"
            variant="customer"
            size="customer"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Nhập lại mật khẩu mới"
          />
        </FormGroup>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="customer" 
            size="customer" 
            className="w-full"
            disabled={!isValid || changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Đang xử lý...
              </span>
            ) : "Cập nhật mật khẩu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
