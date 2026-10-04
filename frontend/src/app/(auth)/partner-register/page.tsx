"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormGroup } from "@/components/customer/shared/FormGroup";
import { ImageUploadBox } from "@/components/shared/ui/ImageUploadBox";
import { useRegisterPartner, useGetPartnerDraft } from "@/hooks/useAuth"; // IMPORT HOOK
import { RefreshCcw, Store, MapPin, Check, ArrowRight, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PartnerRegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterPartner(); // GỌI HOOK

  const [formData, setFormData] = useState({
    restaurantName: "",
    phoneContact: "",
    address: "",
    description: "",
    ownerFullName: "", // THÊM MỚI
    ownerEmail: "",    // THÊM MỚI
  });

  // LƯU CẢ ĐỐI TƯỢNG FILE THẬT ĐỂ GỬI LÊN CLOUDINARY
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // State cho Giấy phép và CCCD
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const recoverMutation = useGetPartnerDraft();
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverData, setRecoverData] = useState({ email: "", phone: "" });

  // Validate form
  const isValid =
    coverFile !== null &&
    licenseFile !== null &&
    idCardFile !== null &&
    formData.restaurantName.trim().length > 0 &&
    formData.phoneContact.trim().length >= 10 &&
    formData.address.trim().length > 0 &&
    formData.ownerFullName.trim().length > 0 &&
    formData.ownerEmail.includes("@");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    registerMutation.mutate(
      { data: formData, imageFile: coverFile, licenseFile, idCardFile },
      {
        onSuccess: () => setShowSuccessModal(true),
        onError: () => toast.error("Có lỗi xảy ra hoặc Email đã được đăng ký!"),
      }
    );
  };

  const handleRecover = () => {
    if (!recoverData.email || !recoverData.phone) {
      toast.error("Vui lòng nhập đủ Email và Số điện thoại!"); return;
    }

    recoverMutation.mutate(recoverData, {
      onSuccess: (data: any) => {
        if (!data) {
          toast.error("Không tìm thấy hồ sơ hoặc sai thông tin!");
        } else {
          setFormData({
            restaurantName: data.restaurantName,
            phoneContact: data.phoneContact,
            address: data.address,
            description: data.description,
            ownerFullName: data.ownerFullName,
            ownerEmail: data.ownerEmail,
          });
          toast.success("Đã khôi phục dữ liệu hồ sơ!");
          setShowRecoverModal(false);
        }
      },
      onError: () => toast.error("Có lỗi xảy ra khi khôi phục dữ liệu.")
    });
  };

  const handleImageSelect = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  return (
    <>
      <div className="text-center mb-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-200">
          <Store className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold text-[#2D2318] mb-2">Đăng ký Nhà hàng</h1>
        <p className="text-stone-400 font-medium text-sm">Hợp tác cùng DineEase</p>

        {/* NÚT BẤM KHÔI PHỤC */}
        <button
          type="button"
          onClick={() => setShowRecoverModal(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Bạn được yêu cầu bổ sung hồ sơ? Bấm để khôi phục dữ liệu
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <FormGroup label="Ảnh bìa nhà hàng (Cover)" required>
          <ImageUploadBox
            aspectRatio="cover"
            imageSrc={coverPreview}
            onImageSelect={handleImageSelect}
          />
        </FormGroup>

        {/* THÊM 2 Ô UPLOAD HỒ SƠ PHÁP LÝ VÀO ĐÂY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-100 pb-6">
          <FormGroup label="Giấy phép kinh doanh" required>
            <ImageUploadBox aspectRatio="video" helperText="Chụp rõ nét (Dưới 2MB)" imageSrc={licensePreview} onImageSelect={(f) => { setLicenseFile(f); setLicensePreview(URL.createObjectURL(f)); }} />
          </FormGroup>
          <FormGroup label="Mặt trước CCCD/CMND" required>
            <ImageUploadBox aspectRatio="video" helperText="CCCD của người đại diện" imageSrc={idCardPreview} onImageSelect={(f) => { setIdCardFile(f); setIdCardPreview(URL.createObjectURL(f)); }} />
          </FormGroup>
        </div>

        {/* THÔNG TIN NGƯỜI ĐẠI DIỆN QUAN TRỌNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-100 pb-6">
          <FormGroup label="Họ tên người đại diện" required>
            <div className="relative">
              <Input variant="customer" size="customer-icon" value={formData.ownerFullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ownerFullName: e.target.value })} />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            </div>
          </FormGroup>
          <FormGroup label="Email liên hệ (Nhận tài khoản)" required>
            <div className="relative">
              <Input type="email" variant="customer" size="customer-icon" value={formData.ownerEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ownerEmail: e.target.value })} />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            </div>
          </FormGroup>
        </div>

        {/* Thông tin nhà hàng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Tên nhà hàng" required>
            <Input variant="customer" size="customer" value={formData.restaurantName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, restaurantName: e.target.value })} />
          </FormGroup>
          <FormGroup label="Số điện thoại nhà hàng" required>
            <Input type="tel" variant="customer" size="customer" value={formData.phoneContact} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phoneContact: e.target.value })} />
          </FormGroup>
        </div>

        <FormGroup label="Địa chỉ cụ thể" required>
          <Input variant="customer" size="customer" value={formData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })} />
        </FormGroup>

        <FormGroup label="Mô tả về nhà hàng">
          <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full resize-none rounded-2xl border border-stone-100 bg-stone-50 p-5 font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20" />
        </FormGroup>

        <div className="pt-4">
          <Button type="submit" variant="customer" size="customer" className="w-full" disabled={!isValid || registerMutation.isPending}>
            {registerMutation.isPending ? "Đang gửi yêu cầu..." : "Hoàn tất Đăng ký"}
          </Button>
        </div>
      </form>

      {/* MODAL BÁO THÀNH CÔNG (Giữ nguyên như cũ) */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md p-10 text-center rounded-[2.5rem] border-stone-100" showCloseButton={false}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-10 w-10" strokeWidth={3} /></div>
          <h2 className="mb-3 text-2xl font-bold text-[#2D2318]">Gửi yêu cầu thành công!</h2>
          <p className="mb-8 text-stone-500">Đội ngũ Admin sẽ xem xét và gửi mật khẩu đăng nhập vào Email của bạn trong vòng 24 giờ.</p>
          <Button variant="customer-dark" size="customer" className="w-full" onClick={() => router.push("/")}>Quay lại trang chủ</Button>
        </DialogContent>
      </Dialog>
      {/* MODAL KHÔI PHỤC HỒ SƠ */}
      <Dialog open={showRecoverModal} onOpenChange={setShowRecoverModal}>
        <DialogContent className="sm:max-w-md p-8 rounded-3xl border-stone-100">
          <DialogTitle className="text-xl font-bold text-brand-dark mb-2">Khôi phục hồ sơ cũ</DialogTitle>
          <p className="text-sm text-stone-500 mb-6">
            Nhập Email và Số điện thoại cá nhân (Chủ quán) để hệ thống tìm lại dữ liệu bạn đã điền trước đó.
          </p>

          <div className="space-y-4 mb-6">
            <Input
              type="email" placeholder="Email liên hệ..."
              value={recoverData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecoverData({ ...recoverData, email: e.target.value })}
            />
            <Input
              type="tel" placeholder="Số điện thoại..."
              value={recoverData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecoverData({ ...recoverData, phone: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRecoverModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleRecover} disabled={recoverMutation.isPending}>
              {recoverMutation.isPending ? "Đang tìm..." : "Khôi phục"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
