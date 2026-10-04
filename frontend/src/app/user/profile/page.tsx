"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormGroup } from "@/components/customer/shared/FormGroup";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUpdateProfile, useUploadImage } from "@/hooks/useCustomer"; 
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, updateUserContext } = useAuthContext();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadImage(); 
  
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || ""
      });
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh!");
      return;
    }

    const toastId = toast.loading("Đang tải ảnh lên...");

    try {
      const uploadedUrl = await uploadImage.mutateAsync(file);
      setFormData(prev => ({ ...prev, avatarUrl: uploadedUrl }));
      toast.success("Tải ảnh lên thành công!", { id: toastId });
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên.", { id: toastId });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { email, ...safePayload } = formData;
      const updatedUser = await updateProfile.mutateAsync(safePayload);
      updateUserContext(updatedUser as any); 
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || "U")}&background=F59E0B&color=fff`;

  if (isAuthLoading) return <ProfileSkeleton />;

  return (
    <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm lg:p-10">
      <h2 className="mb-8 text-2xl font-bold text-[#2D2318]">Chỉnh sửa thông tin</h2>

      <div className="mb-10 flex flex-col items-center gap-6 sm:flex-row">
        <div className="group relative">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl ring-1 ring-stone-100 bg-stone-50">
            {uploadImage.isPending ? (
              <div className="flex h-full w-full items-center justify-center bg-stone-100">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <img 
                src={formData.avatarUrl || fallbackAvatar} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Avatar" 
              />
            )}
          </div>
          
          <button 
            type="button"
            disabled={uploadImage.isPending}
            onClick={() => fileInputRef.current?.click()} 
            className="absolute bottom-0 right-0 rounded-full bg-stone-900 p-2.5 text-white shadow-lg transition-all hover:scale-110 hover:bg-amber-500 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-stone-500">Ảnh đại diện của bạn</p>
          <p className="mt-1 text-xs text-stone-400">Hỗ trợ JPG, PNG, WEBP (Tối đa 2MB)</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <FormGroup label="Họ và tên">
          <Input
            variant="customer"
            size="customer"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Nhập họ tên đầy đủ"
            required
          />
        </FormGroup>

        <FormGroup label="Số điện thoại">
          <Input
            type="tel"
            variant="customer"
            size="customer"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Nhập số điện thoại"
          />
        </FormGroup>

        <FormGroup label="Email (Không thể thay đổi)">
          <Input
            type="email"
            variant="customer"
            size="customer"
            value={formData.email}
            disabled 
            className="bg-stone-50 opacity-70 cursor-not-allowed"
          />
        </FormGroup>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="customer" 
            size="customer" 
            className="w-full"
            disabled={updateProfile.isPending || uploadImage.isPending}
          >
            {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ProfileSkeleton() {
    return (
        <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm lg:p-10 space-y-8">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="space-y-6 max-w-xl">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      );
}
