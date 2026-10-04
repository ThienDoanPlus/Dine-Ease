"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Star, User, Phone, Mail, MapPin, Check, FileEdit, X, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";

// Import Hooks API
import { useAdminRestaurantDetail, useUpdateRestaurantStatus, useRequestRestaurantUpdate } from "@/hooks/useAdmin";

// Import Components
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { ProfileInfoCard } from "@/components/shared/ui/ProfileInfoCard";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PartnerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // Gọi API lấy dữ liệu và Cập nhật trạng thái
  const { data: restaurant, isLoading, error } = useAdminRestaurantDetail(id);
  const updateStatus = useUpdateRestaurantStatus();
  const requestUpdateMutation = useRequestRestaurantUpdate();
  
  // State quản lý Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleSendUpdateRequest = () => {
    if (!updateMessage.trim()) {
      toast.error("Vui lòng nhập nội dung cần đối tác bổ sung!");
      return;
    }
    requestUpdateMutation.mutate({ id, message: updateMessage }, {
      onSuccess: () => {
        toast.success("Đã gửi email yêu cầu bổ sung đến đối tác!");
        setIsUpdateModalOpen(false);
        setUpdateMessage(""); // Xóa form
      },
      onError: () => toast.error("Có lỗi xảy ra khi gửi email.")
    });
  };

  // Hàm xử lý duyệt / từ chối
  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!restaurant) return; // Bảo vệ an toàn biến trạng thái chưa kịp load

    try {
      // Backend yêu cầu { status, commissionRate }
      await updateStatus.mutateAsync({ 
        id, 
        data: { 
          status: newStatus, 
          commissionRate: restaurant.commissionRate || 15.0 // Truyền theo mức hoa hồng đang có
        } 
      });
      
      toast.success(`Đã cập nhật trạng thái hồ sơ thành ${newStatus}`);
      
      // Xử lý xong thì đá về trang List cho mượt
      router.push("/admin/partners"); 
    } catch (e) {
      toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
    }
  };

  // 1. TRẠNG THÁI LOADING
  if (isLoading) {
    return (
      <div className="bg-app-bg min-h-screen space-y-8 p-4 lg:p-8">
        <Skeleton className="h-20 w-full max-w-2xl rounded-2xl" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="h-[400px] rounded-[2rem] lg:col-span-4" />
          <Skeleton className="h-[600px] rounded-[2rem] lg:col-span-8" />
        </div>
      </div>
    );
  }

  // 2. TRẠNG THÁI LỖI / KHÔNG TÌM THẤY
  if (error || !restaurant) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <X className="h-10 w-10" />
        </div>
        <h2 className="text-brand-dark text-2xl font-bold">Không tìm thấy hồ sơ đối tác</h2>
        <p className="text-stone-500">Hồ sơ này có thể đã bị xóa hoặc không tồn tại.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // 3. RENDER GIAO DIỆN CHÍNH
  return (
    <div className="bg-app-bg min-h-full p-4 lg:p-8">
      <PageHeader
        showBackButton={true}
        title="Chi tiết hồ sơ đối tác"
        description={`Mã hồ sơ: #${restaurant.id} • Tỉ lệ hoa hồng: ${restaurant.commissionRate || 15}%`}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="space-y-6 lg:col-span-4">
          <ProfileInfoCard
            name={restaurant.name}
            avatarImage={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
            subTextNode={
              <>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-primary text-lg font-extrabold">
                    {restaurant.rating || "4.5"} sao
                  </span>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= (restaurant.rating || 4.5) ? "fill-current" : "fill-current text-stone-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-center pb-2">
                  <StatusBadge
                    label={restaurant.status === "PENDING" ? "Chờ duyệt" : restaurant.status}
                    variant={restaurant.status === "PENDING" ? "warning" : "success"}
                    pulse={restaurant.status === "PENDING"}
                    className="px-4 py-1.5"
                  />
                </div>
              </>
            }
            infoRows={[
              { icon: User, label: "Đại diện pháp luật", value: restaurant.ownerName },
              { icon: Phone, label: "Số điện thoại", value: restaurant.phoneContact },
              { icon: Mail, label: "Email liên hệ", value: restaurant.ownerEmail, valueClassName: "text-primary-hover" },
            ]}
          />
        </div>

        {/* CỘT PHẢI: TABS CHI TIẾT */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Tabs defaultValue="info" className="flex w-full flex-col gap-6">
            <TabsList className="w-full flex-wrap md:flex-nowrap">
              <TabsTrigger value="info">Thông tin hoạt động</TabsTrigger>
              <TabsTrigger value="legal">Tài liệu pháp lý</TabsTrigger>
            </TabsList>

            <div className="min-h-[400px] flex-1 rounded-[2rem] border border-stone-100 bg-white p-6 shadow-sm lg:p-8">
              <TabsContent value="info" className="m-0 border-none outline-none focus-visible:ring-0">
                <h2 className="text-brand-dark mb-6 text-lg font-bold">Chi tiết hoạt động</h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-[#78716c]">
                      Địa chỉ kinh doanh
                    </p>
                    <p className="text-brand-dark flex items-start gap-2 rounded-xl border border-stone-100 bg-stone-50 p-3 text-[0.95rem] font-semibold">
                      <MapPin className="text-primary mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
                      {restaurant.address || "Chưa cập nhật địa chỉ"}
                    </p>
                  </div>
                  
                  <div className="space-y-1 pt-2 md:col-span-2">
                    <p className="mb-2 text-sm font-medium text-[#78716c]">Giới thiệu nhà hàng</p>
                    <p className="rounded-2xl border-l-4 border-amber-400 bg-amber-50/50 p-5 text-sm leading-relaxed text-stone-600">
                      {restaurant.description || "Nhà hàng hiện chưa cung cấp thông tin mô tả chi tiết trên hệ thống."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="legal" className="m-0 border-none outline-none">
                <h2 className="text-brand-dark mb-6 text-lg font-bold">Hồ sơ đính kèm</h2>
                <div className="grid grid-cols-2 gap-4">
                  {restaurant.legalDocuments?.length > 0 ? (
                    restaurant.legalDocuments.map((doc: any) => (
                      <a 
                        key={doc.id} 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl border border-stone-100 bg-stone-50 flex items-center gap-3 hover:border-amber-400 transition-all"
                      >
                        <FileText className="text-amber-500 h-8 w-8" />
                        <div className="text-sm font-bold">{doc.documentName}</div>
                      </a>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-stone-400">Chưa có tài liệu đính kèm</div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* THANH CÔNG CỤ XỬ LÝ (Chỉ hiện khi trạng thái là PENDING) */}
      {restaurant.status === "PENDING" && (
        <div className="mt-8 mb-10 flex flex-wrap items-center justify-end gap-4 rounded-[2rem] border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5">
          <div className="mr-auto hidden md:block">
            <h4 className="text-brand-dark text-sm font-black uppercase">
              Đang chờ bạn phê duyệt
            </h4>
            <p className="text-xs font-medium text-stone-500">
              Vui lòng kiểm tra kỹ thông tin trước khi duyệt.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
            disabled={updateStatus.isPending || requestUpdateMutation.isPending}
            onClick={() => setIsUpdateModalOpen(true)}
          >
            <FileEdit className="h-4 w-4 mr-2" /> Yêu cầu bổ sung
          </Button>

          <Button 
            variant="danger" 
            size="lg" 
            className="rounded-xl"
            disabled={updateStatus.isPending}
            onClick={() => handleStatusUpdate("REJECTED")}
          >
            <X className="h-4 w-4 mr-2" /> Từ chối
          </Button>

          <Button 
            variant="success" 
            size="lg" 
            className="rounded-xl"
            disabled={updateStatus.isPending}
            onClick={() => handleStatusUpdate("APPROVED")}
          >
            <Check className="h-5 w-5 mr-2" strokeWidth={2.5} /> Phê duyệt nhà hàng
          </Button>
        </div>
      )}

      {/* THANH CÔNG CỤ KHÔI PHỤC (Chỉ hiện khi trạng thái là REJECTED) */}
      {restaurant.status === "REJECTED" && (
        <div className="mt-8 mb-10 flex flex-wrap items-center justify-end gap-4 rounded-[2rem] border border-red-100 bg-white p-6 shadow-xl shadow-red-900/5">
          <div className="mr-auto hidden md:block">
            <h4 className="text-brand-dark text-sm font-black uppercase text-red-500">
              Hồ sơ đã bị từ chối
            </h4>
            <p className="text-xs font-medium text-stone-500">
              Nếu đối tác đã bổ sung đủ giấy tờ qua trao đổi, bạn có thể khôi phục lại hồ sơ.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-xl border-stone-200"
            disabled={updateStatus.isPending}
            onClick={() => handleStatusUpdate("PENDING" as any)}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Khôi phục về Chờ duyệt
          </Button>
        </div>
      )}
      {/* MODAL NHẬP LÝ DO YÊU CẦU BỔ SUNG */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-lg p-8 rounded-3xl border-stone-100 bg-white shadow-xl">
          <DialogTitle className="text-xl font-black text-brand-dark mb-2">
            Yêu cầu bổ sung hồ sơ
          </DialogTitle>
          <p className="text-sm text-stone-500 mb-6">
            Nội dung này sẽ được gửi trực tiếp đến email của chủ nhà hàng. Vui lòng ghi rõ thông tin nào cần chỉnh sửa.
          </p>
          
          <textarea
            rows={5}
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            placeholder="Ví dụ: Hình ảnh CCCD bị mờ, vui lòng chụp lại rõ nét hơn..."
            className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20"
          />

          <div className="mt-6 flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Hủy</Button>
            <Button 
              variant="primary" 
              onClick={handleSendUpdateRequest}
              disabled={requestUpdateMutation.isPending}
            >
              {requestUpdateMutation.isPending ? "Đang gửi..." : "Gửi Email Ngay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
