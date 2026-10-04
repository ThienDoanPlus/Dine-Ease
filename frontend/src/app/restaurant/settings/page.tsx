"use client";

import React, { useState, useEffect } from "react";
import { Phone, MapPin, Mail, Save, Settings, Clock, Info, Key, ShieldCheck, Percent, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { FormLabel } from "@/components/shared/ui/FormLabel";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { InfoRow } from "@/components/shared/ui/InfoRow";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { ProfileInfoCard } from "@/components/shared/ui/ProfileInfoCard";
import { ImageUploadBox } from "@/components/shared/ui/ImageUploadBox";

// Hooks
import { useAuthContext } from "@/providers/AuthProvider";
import { 
  useGetRestaurantSettings, useUpdateRestaurantInfo, 
  useUpdateBookingConfig, useUpdateOperatingHours, useUpdateRestaurantImages 
} from "@/hooks/useRestaurant";
import { usePublicAmenities } from "@/hooks/useCustomer";

const defaultHours = [
  { day: "Thứ Hai", from: "07:00", to: "21:00", active: true },
  { day: "Thứ Ba", from: "07:00", to: "21:00", active: true },
  { day: "Thứ Tư", from: "07:00", to: "21:00", active: true },
  { day: "Thứ Năm", from: "07:00", to: "21:00", active: true },
  { day: "Thứ Sáu", from: "07:00", to: "21:00", active: true },
  { day: "Thứ Bảy", from: "08:00", to: "23:00", active: true },
  { day: "Chủ Nhật", from: "08:00", to: "23:00", active: false },
];

export default function RestaurantProfileSettings() {
  const { user } = useAuthContext();
  
  // Lấy Master Data
  const { data: MASTER_AMENITIES } = usePublicAmenities();
  
  // API Hooks
  const { data: settings, isLoading, isError, refetch } = useGetRestaurantSettings();
  const updateInfoMutation = useUpdateRestaurantInfo();
  const updateConfigMutation = useUpdateBookingConfig();
  const updateHoursMutation = useUpdateOperatingHours();
  const updateImagesMutation = useUpdateRestaurantImages();

  // States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [deposit, setDeposit] = useState("");
  const [maxPax, setMaxPax] = useState("");
  const [commission, setCommission] = useState("15");
  const [workingHours, setWorkingHours] = useState(defaultHours);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  // States Hình ảnh
  const [images, setImages] = useState({ logo: "", cover: "" });
  const [files, setFiles] = useState<{ logo: File | null; cover: File | null }>({ logo: null, cover: null });

  // Load Data
  useEffect(() => {
    if (settings) {
      console.log("Restaurant settings loaded:", settings);
      setName(settings.name || "");
      setPhone(settings.phone || "");
      setAddress(settings.address || "");
      setDesc(settings.description || "");
      setDeposit(settings.depositAmount?.toString() || "0");
      setMaxPax(settings.maxPax?.toString() || "20");
      setCommission(settings.commissionRate?.toString() || "15");
      setSelectedAmenities(settings.amenityIds || []);
      setImages({ logo: settings.logoUrl || "", cover: settings.coverUrl || "" });
      
      try {
        if (settings.operatingHours && settings.operatingHours !== "[]") {
          setWorkingHours(JSON.parse(settings.operatingHours));
        }
      } catch (e) { console.error("Failed to parse operating hours", e); }
    }
  }, [settings]);

  const handleToggleAmenity = (id: number) => {
    setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const handleToggleDay = (index: number, checked: boolean) => {
    const newHours = [...workingHours];
    newHours[index].active = checked;
    setWorkingHours(newHours);
  };

  const handleSave = async () => {
    try {
      // 1. Cập nhật thông tin chung
      await updateInfoMutation.mutateAsync({ name, phone, address, description: desc, amenityIds: selectedAmenities });
      
      // 2. Cập nhật config
      await updateConfigMutation.mutateAsync({ depositAmount: Number(deposit), maxPax: Number(maxPax) });
      
      // 3. Cập nhật giờ
      await updateHoursMutation.mutateAsync(JSON.stringify(workingHours));

      // 4. Cập nhật ảnh (nếu có thay đổi file mới)
      if (files.logo || files.cover) {
        await updateImagesMutation.mutateAsync({ logo: files.logo, cover: files.cover });
      }

      toast.success("Đã lưu cấu hình nhà hàng thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu thông tin.");
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-amber-500 h-10 w-10" />
      <p className="font-bold text-stone-400">Đang tải cấu hình nhà hàng...</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
        <Loader2 className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-stone-800">Không thể tải dữ liệu</h2>
      <p className="text-stone-500 mb-6">Đã có lỗi xảy ra khi kết nối tới máy chủ.</p>
      <button onClick={() => refetch()} className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold active:scale-95 transition-all">Thử lại</button>
    </div>
  );

  return (
    <div className="bg-app-bg min-h-full p-6 lg:p-8">
      <PageHeader title="Hồ sơ nhà hàng" action={<StatusBadge label="Đang hoạt động" variant="success" pulse />} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: LIVE PREVIEW PROFILE CARD */}
        <div className="space-y-6 lg:col-span-4">
          <ProfileInfoCard
            name={name}
            avatarImage={images.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
            coverImage={images.cover || "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200"}
            subTextNode={<div className="text-sm font-medium text-stone-500 mt-2">ID: #{user?.id}</div>}
            infoRows={[
              { icon: Phone, label: "Hotline", value: phone },
              { icon: Mail, label: "Email quản lý", value: user?.email, valueClassName: "text-stone-400" },
              { icon: MapPin, label: "Địa chỉ", value: address, valueClassName: "line-clamp-2 text-xs" },
            ]}
          />

          <div className="flex flex-col gap-6 rounded-4xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-lg shadow-amber-500/5">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 text-amber-600 shadow-inner ring-1 ring-amber-200">
                <Percent className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-brand-dark">Chiết khấu hệ thống</h3>
                <p className="mt-1 text-sm font-medium text-stone-600">Hoa hồng hiện tại: <strong className="text-amber-600">{commission}%</strong> / đơn hoàn tất.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS SETTINGS */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Tabs defaultValue="info" className="flex w-full flex-col gap-6">
            <TabsList className="w-full flex-wrap md:flex-nowrap">
              <TabsTrigger value="info"><Info className="mr-2 h-4 w-4" /> Thông tin chung</TabsTrigger>
              <TabsTrigger value="booking"><Settings className="mr-2 h-4 w-4" /> Cấu hình đặt bàn</TabsTrigger>
              <TabsTrigger value="hours"><Clock className="mr-2 h-4 w-4" /> Giờ hoạt động</TabsTrigger>
            </TabsList>

            <div className="flex-1 rounded-4xl border border-stone-100 bg-white p-6 shadow-sm lg:p-8">
              {/* TAB 1: INFO */}
              <TabsContent value="info" className="m-0 border-none outline-none">
                <div className="mb-8 grid grid-cols-1 gap-6 border-b border-stone-100 pb-8 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-1">
                    <FormLabel label="Ảnh đại diện (Logo)" />
                    <ImageUploadBox imageSrc={images.logo} aspectRatio="square" onImageSelect={(f) => { setFiles(p => ({...p, logo: f})); setImages(p => ({...p, logo: URL.createObjectURL(f)})) }} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <FormLabel label="Ảnh bìa (Cover)" />
                    <ImageUploadBox imageSrc={images.cover} aspectRatio="cover" onImageSelect={(f) => { setFiles(p => ({...p, cover: f})); setImages(p => ({...p, cover: URL.createObjectURL(f)})) }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2"><FormLabel label="Tên nhà hàng" /><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="space-y-2"><FormLabel label="Hotline" /><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  <div className="space-y-2"><FormLabel label="Địa chỉ Maps" /><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                  <div className="space-y-2 pt-2 md:col-span-2"><FormLabel label="Giới thiệu" /><textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-amber-400 transition-all" /></div>

                  {/* AMENITIES */}
                  <div className="space-y-3 pt-4 md:col-span-2 border-t border-stone-100 mt-2">
                    <FormLabel label="Tiện ích cung cấp" />
                    <div className="flex flex-wrap gap-3">
                      {MASTER_AMENITIES?.map((a) => (
                        <button key={a.id} type="button" onClick={() => handleToggleAmenity(a.id)} className={cn("flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all", selectedAmenities.includes(a.id) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-stone-100 bg-white text-stone-500 hover:border-emerald-200")}>
                          {a.icon} {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: BOOKING CONFIG */}
              <TabsContent value="booking" className="m-0 border-none outline-none">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel label="Tiền cọc bắt buộc (VNĐ)" />
                    <Input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <FormLabel label="Số khách tối đa 1 bàn" />
                    <Input type="number" value={maxPax} onChange={(e) => setMaxPax(e.target.value)} />
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: HOURS */}
              <TabsContent value="hours" className="m-0 border-none outline-none">
                <div className="space-y-2.5">
                  {workingHours.map((wh, idx) => (
                    <div key={wh.day} className={`grid grid-cols-[90px_1fr_1fr_50px] items-center gap-3 rounded-xl border p-3 transition-all ${wh.active ? "bg-stone-50/50 border-stone-200 shadow-sm" : "bg-transparent opacity-60 grayscale border-dashed border-stone-200"}`}>
                      <span className="text-sm font-bold">{wh.day}</span>
                      <input type="time" value={wh.from} onChange={(e) => { const n = [...workingHours]; n[idx].from = e.target.value; setWorkingHours(n); }} disabled={!wh.active} className="w-full rounded-lg border p-2 text-center text-sm outline-none focus:border-amber-400" />
                      <input type="time" value={wh.to} onChange={(e) => { const n = [...workingHours]; n[idx].to = e.target.value; setWorkingHours(n); }} disabled={!wh.active} className="w-full rounded-lg border p-2 text-center text-sm outline-none focus:border-amber-400" />
                      <div className="flex justify-end"><Switch checked={wh.active} onCheckedChange={(val) => handleToggleDay(idx, val)} className="data-[state=checked]:bg-emerald-500" /></div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-auto flex items-center justify-between rounded-4xl bg-white p-5 shadow-xl shadow-amber-900/5 border border-amber-100">
            <p className="text-sm font-bold text-stone-500">Đồng bộ ngay lập tức lên ứng dụng khách hàng.</p>
            <button 
              onClick={handleSave} 
              disabled={updateInfoMutation.isPending || updateConfigMutation.isPending || updateHoursMutation.isPending || updateImagesMutation.isPending}
              className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-xl px-8 py-3.5 text-xs font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {(updateInfoMutation.isPending || updateConfigMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4"/>}
              LƯU THAY ĐỔI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
