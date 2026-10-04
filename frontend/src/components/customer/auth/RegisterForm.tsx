// src/components/customer/auth/RegisterForm.tsx
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegister, useUploadImage } from "@/hooks/useCustomer";

export function RegisterForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const registerMutation = useRegister();
  const uploadMutation = useUploadImage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Điều kiện để submit
  const isValid = formData.fullName && formData.phone && formData.email && formData.password.length >= 8 && termsAccepted;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      let uploadedImageUrl = ""; // Mặc định là chuỗi rỗng

      // BƯỚC 1: CHỈ UPLOAD NẾU CÓ FILE
      if (selectedFile) {
        toast.loading("Đang tải ảnh lên...");
        uploadedImageUrl = await uploadMutation.mutateAsync(selectedFile);
        toast.dismiss();
      }

      // BƯỚC 2: GỬI DATA ĐĂNG KÝ
      toast.loading("Đang tạo tài khoản...");
      
      await registerMutation.mutateAsync({
        ...formData,
        avatarUrl: uploadedImageUrl // Nếu không chọn ảnh, trường này sẽ gửi lên chuỗi rỗng
      });

      toast.dismiss();
      toast.success("Đăng ký thành công! Mời bạn đăng nhập.");
      router.push("/login");
    } catch (error: unknown) {
      toast.dismiss();
      const errorMsg = (error as any).response?.data?.message || "Đăng ký thất bại.";
      toast.error(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Chọn Ảnh Đại Diện */}
      <div className="mb-6 flex flex-col items-center">
        <div className="group relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-stone-200 bg-stone-50 shadow-inner">
            {previewUrl ? (
              <div className="relative h-full w-full">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <User className="h-8 w-8 text-stone-300" />
            )}
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 rounded-full bg-amber-500 p-2 text-white shadow-lg">
            <Camera className="h-4 w-4" />
          </button>
          <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} />
        </div>
        <p className="mt-2 text-[10px] font-bold text-stone-400 uppercase">Ảnh đại diện (Không bắt buộc)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input placeholder="Họ và tên" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
        <Input placeholder="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      </div>
      <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
      <Input type="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

      <div className="flex items-start gap-3 py-2">
        <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-5 w-5 rounded border-stone-300 text-amber-500" />
        <label className="text-xs text-stone-500">Tôi đồng ý với các điều khoản dịch vụ.</label>
      </div>

      <Button type="submit" variant="customer" size="customer" className="w-full" disabled={!isValid || registerMutation.isPending || uploadMutation.isPending}>
        {registerMutation.isPending || uploadMutation.isPending ? (
          <span className="flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Đang xử lý...</span>
        ) : "Tạo tài khoản ngay"}
      </Button>
    </form>
  );
}
