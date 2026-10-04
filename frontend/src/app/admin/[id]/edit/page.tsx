"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Mail, Lock, RefreshCw, Info, Settings, Image as LucideImage } from "lucide-react";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { ImageUploadBox } from "@/components/shared/ui/ImageUploadBox";
import { InfoRow } from "@/components/shared/ui/InfoRow";
import { SectionHeader } from "@/components/shared/ui/SectionHeader";
import { FormLabel } from "@/components/shared/ui/FormLabel";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { ActionFooter } from "@/components/shared/ui/ActionFooter";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// --- GỌI HOOKS TỪ BACKEND ---
import { useAdminRestaurantDetail, useUpdateRestaurantProfile } from "@/hooks/useAdmin";
import { usePublicCuisines, usePublicAmenities } from "@/hooks/useCustomer"; 

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // --- KẾT NỐI API ---
  const { data: restaurant, isLoading } = useAdminRestaurantDetail(Number(params.id));
  const { data: MASTER_CUISINES } = usePublicCuisines();
  const { data: MASTER_AMENITIES } = usePublicAmenities();
  const updateMutation = useUpdateRestaurantProfile();

  // --- FORM STATES ---
  const [password, setPassword] = useState("****************");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [commission, setCommission] = useState("");
  
  // Trạng thái mảng (Chỉ cho chọn 1 Cuisine theo DB, nhưng Amenities thì nhiều)
  const [selectedCuisineId, setSelectedCuisineId] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  // Images (Lưu object File để gửi lên server)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Đổ dữ liệu cũ vào form khi API load xong
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setPhone(restaurant.phoneContact || "");
      setAddress(restaurant.address || "");
      setCommission(restaurant.commissionRate?.toString() || "15");
      setCoverImagePreview(restaurant.imageUrl || null);
      // Gán Cuisine hiện tại (Chỉ 1 ID) - Tìm trong list master
      if (MASTER_CUISINES && restaurant.cuisineName) {
         const match = MASTER_CUISINES.find(c => c.name === restaurant.cuisineName);
         if (match) setSelectedCuisineId(match.id);
      }
    }
  }, [restaurant, MASTER_CUISINES]);

  // --- HANDLERS ---
  const generateRandomPassword = () => {
    const randomPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    setPassword(randomPass);
    setIsPasswordChanged(true); // Đánh dấu là đã đổi pass để gửi lên server
    toast.info("Đã tạo mật khẩu mới. Sẽ có hiệu lực sau khi Lưu.");
  };

  const handleImageSelect = (file: File) => {
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleToggleAmenity = (id: number) => {
    setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!name || !phone || !address || !commission) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const payload: any = {
      name,
      phoneContact: phone,
      address,
      commissionRate: parseFloat(commission),
      cuisineId: selectedCuisineId,
      amenityIds: selectedAmenities
    };

    if (isPasswordChanged) {
      payload.newPassword = password;
    }

    updateMutation.mutate({
      id: params.id,
      data: payload,
      imageFile: coverImageFile
    }, {
      onSuccess: () => {
        toast.success(`Đã lưu thay đổi thông tin nhà hàng!`);
        router.push("/admin/restaurants");
      },
      onError: () => toast.error("Có lỗi xảy ra khi lưu dữ liệu.")
    });
  };

  if (isLoading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-app-bg min-h-full space-y-8 p-8">
      <PageHeader showBackButton={true} backUrl="/admin/restaurants" title="CHỈNH SỬA NHÀ HÀNG" description="Cập nhật các thông tin cơ bản, cấu hình và hình ảnh hiển thị của đối tác." />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* LOGO & ACCOUNT */}
        <div className="glass-panel h-fit space-y-8 rounded-[2rem] p-8">
          <SectionHeader title="TÀI KHOẢN ĐĂNG NHẬP" icon={Info} colorTheme="amber" />
          <div className="flex flex-col items-start gap-8 md:flex-row">
            <div className="w-full flex-1 space-y-6">
              <div className="space-y-2 rounded-xl border border-stone-100 bg-stone-50 p-4">
                <InfoRow icon={Mail} label="Email đăng nhập" value={restaurant?.ownerEmail || "---"} valueClassName="text-stone-400" />
              </div>
              <div className="space-y-2">
                <FormLabel label="Cấp lại mật khẩu mới" icon={Lock} />
                <div className="flex gap-2">
                  <input type="text" value={password} readOnly className="text-brand-dark flex-1 rounded-xl border-2 border-stone-100 bg-white px-4 py-3 text-sm font-bold transition-all outline-none" />
                  <button onClick={generateRandomPassword} className="bg-brand-dark hover:bg-brand-dark-hover flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-md">
                    <RefreshCw className="h-3.5 w-3.5" /> Tạo mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHUNG */}
        <div className="glass-panel max-h-fit space-y-6 rounded-[2rem] p-8">
          <SectionHeader title="THÔNG TIN CHUNG" icon={Info} colorTheme="indigo" />
          <div className="space-y-5">
            <div className="space-y-2">
              <FormLabel label="Tên nhà hàng*" required />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="text-brand-dark w-full rounded-xl border-2 border-stone-100 bg-white px-4 py-3.5 text-sm font-bold" />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FormLabel label="Số điện thoại Hotline*" required />
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-brand-dark w-full rounded-xl border-2 border-stone-100 bg-white px-4 py-3.5 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <FormLabel label="Địa chỉ chi tiết*" required />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="text-brand-dark w-full rounded-xl border-2 border-stone-100 bg-white px-4 py-3.5 text-sm font-bold" />
              </div>
            </div>

            {/* Quản lý Cuisine (Chỉ chọn 1) */}
            <div className="space-y-3 pt-2">
              <FormLabel label="Danh mục ẩm thực (Cuisine)*" required />
              <div className="flex flex-wrap gap-2.5">
                {MASTER_CUISINES?.map((cuisine) => (
                  <button key={cuisine.id} onClick={() => setSelectedCuisineId(cuisine.id)} type="button" className={cn("flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all", selectedCuisineId === cuisine.id ? "border-amber-500 bg-amber-500 text-white" : "border-stone-100 bg-white text-stone-500")}>
                    <span>{cuisine.iconUrl}</span> {cuisine.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quản lý Tiện Ích */}
            <div className="space-y-3 pt-6 border-t border-stone-100 mt-6">
              <FormLabel label="Tiện ích cung cấp (Amenities)" />
              <div className="flex flex-wrap gap-2.5">
                {MASTER_AMENITIES?.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button key={amenity.id} onClick={() => handleToggleAmenity(amenity.id)} type="button" className={cn("flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all", isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-100 bg-white text-stone-500")}>
                      <span>{amenity.icon}</span> {amenity.name}
                      {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* HÌNH ẢNH */}
        <div className="glass-panel space-y-8 rounded-[2rem] p-8 xl:col-span-2">
           <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <SectionHeader title="ẢNH BÌA (COVER IMAGE)" icon={LucideImage} colorTheme="rose" className="mb-4" />
                <ImageUploadBox imageSrc={coverImagePreview} aspectRatio="cover" onImageSelect={handleImageSelect} />
              </div>
              <div className="flex-1">
                 <SectionHeader title="CẤU HÌNH HỆ THỐNG" icon={Settings} colorTheme="emerald" />
                 <div className="flex flex-col gap-4 rounded-2xl border border-stone-100 bg-stone-50/50 p-6">
                    <FormLabel label="Mức hoa hồng thiết lập (%) *" required />
                    <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} className="text-primary-hover w-full rounded-xl border-2 border-amber-400 bg-white px-4 py-3 text-center text-lg font-black shadow-sm" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <ActionFooter onCancel={() => router.back()} onConfirm={handleSave} isConfirmDisabled={updateMutation.isPending} confirmText={updateMutation.isPending ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"} className="pt-6 pb-12" />
    </div>
  );
}
