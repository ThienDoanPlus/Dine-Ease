"use client";

import React, { useState } from "react";
import { Sparkle, Plus, History, Users, Send, Calendar, Smartphone, MessageSquare, RotateCw, Loader2, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/shared/ui/RichTextEditor";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { ActionIconButton } from "@/components/shared/ui/ActionIconButton";
import { FormLabel } from "@/components/shared/ui/FormLabel";
import { SectionHeader } from "@/components/shared/ui/SectionHeader";
import { FilterSelect } from "@/components/shared/ui/FilterSelect";
import { PhoneMockupPreview } from "@/components/admin/ui/PhoneMockupPreview";
import { toast } from "sonner";
import { formatDateTime, cn } from "@/lib/utils";

// --- GỌI API HOOKS ---
import { useAdminNotifications, useCreateNotification, useCancelNotification } from "@/hooks/useAdmin";
import { useUploadImage } from "@/hooks/useCustomer";

export default function NotificationsManagementPage() {
  const [activeTab, setActiveTab] = useState("create");
  
  // 1. Tạo biến lấy ngày hôm nay để chặn chọn ngày lùi
  const todayStr = new Date().toISOString().split("T")[0];
  
  // --- STATE TAB CREATE (Đã đồng bộ Enum với Backend) ---
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL"); // ALL, CUSTOMER, RESTAURANT
  const [specificTargetEmail, setSpecificTargetEmail] = useState("");
  const [channel, setChannel] = useState("IN_APP"); // IN_APP, EMAIL
  const [type, setType] = useState("SYSTEM"); // <--- THÊM STATE NÀY
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // 2. Thêm state để theo dõi tất cả các ảnh tạm (blob URLs)
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const uploadMutation = useUploadImage();

  const handleImageInsert = (blobUrl: string, file: File) => {
    setPendingImages(prev => ({ ...prev, [blobUrl]: file }));
  };
  // --- KẾT NỐI API ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: responseData, isLoading, refetch, isFetching } = useAdminNotifications(currentPage - 1, itemsPerPage);
  const createMutation = useCreateNotification();
  const cancelMutation = useCancelNotification();

  const historyData = responseData?.content || [];
  const totalPages = responseData?.totalPages || 1;

  // Viết hàm xử lý bấm hủy:
  const handleCancelCampaign = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy chiến dịch này? Hành động này không thể hoàn tác.")) {
      cancelMutation.mutate(id, {
        onSuccess: () => toast.success("Đã hủy chiến dịch thành công!"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Không thể hủy chiến dịch này.")
      });
    }
  };

  // --- HÀM XỬ LÝ LƯU ---
  const handleSaveCampaign = async () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tiêu đề thông báo!");
    if (!body.trim() || body === "<p></p>") return toast.error("Vui lòng soạn nội dung thông báo!");
    if (scheduleType === "later" && (!scheduleDate || !scheduleTime)) {
      return toast.error("Vui lòng chọn ngày và giờ gửi!");
    }
    if (targetAudience === "SPECIFIC_USER" && !specificTargetEmail.includes("@")) {
      return toast.error("Vui lòng nhập Email người nhận hợp lệ!");
    }

    let finalHtml = body;
    const blobRegex = /src="(blob:[^"]+)"/g;
    let match;
    const matches = [];

    // 1. Tìm tất cả các blob URL có trong nội dung hiện tại
    while ((match = blobRegex.exec(body)) !== null) {
      matches.push(match[1]);
    }

    try {
      let toastId;
      if (matches.length > 0) {
        toastId = toast.loading("Đang xử lý hình ảnh...");
      }

      // 2. Duyệt qua từng blob, upload lên Cloudinary và thay thế trong HTML
      for (const blobUrl of matches) {
        const fileToUpload = pendingImages[blobUrl];
        if (fileToUpload) {
          // Gọi API upload thật
          const cloudinaryUrl = await uploadMutation.mutateAsync(fileToUpload);
          // Thay thế đường dẫn tạm bằng đường dẫn thật
          finalHtml = finalHtml.replace(blobUrl, cloudinaryUrl);
        }
      }

      if (toastId) toast.dismiss(toastId);

      // Nối ngày giờ thành chuẩn ISO-8601 Instant (Nếu gửi ngay thì truyền null)
      let scheduledTimeISO = null;
      if (scheduleType === "later") {
         const selectedDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
         
         // [VÁ LỖ HỔNG LOGIC]: Chặn người dùng chọn giờ trong quá khứ
         if (selectedDateTime < new Date()) {
           return toast.error("Lịch gửi thông báo không được nằm ở trong quá khứ!");
         }

         scheduledTimeISO = selectedDateTime.toISOString();
      }

      createMutation.mutate({
        title,
        content: finalHtml,
        targetAudience,
        specificTargetEmail,
        channel,
        type, // <--- GỬI TYPE LÊN BACKEND
        scheduledTime: scheduledTimeISO
      }, {
        onSuccess: () => {
          toast.success("Đã lưu chiến dịch truyền thông thành công!");
          setPendingImages({}); // Reset thùng chứa ảnh
          handleCancel();
          setActiveTab("history"); // Chuyển sang tab lịch sử để xem kết quả
        },
        onError: () => toast.error("Có lỗi xảy ra khi tạo chiến dịch!")
      });

    } catch (error) {
      toast.dismiss();
      toast.error("Lỗi khi upload ảnh. Vui lòng thử lại!");
    }
  };

  const handleCancel = () => {
    // Dọn dẹp bộ nhớ RAM cho các blob URL
    Object.keys(pendingImages).forEach(url => URL.revokeObjectURL(url));
    setPendingImages({});

    setTitle("");
    setBody("");
    setTargetAudience("ALL");
    setSpecificTargetEmail("");
    setChannel("IN_APP");
    setType("SYSTEM");
    setScheduleType("now");
    setScheduleDate("");
    setScheduleTime("");
  };

  // --- RENDER UI ---
  const renderChannelIcon = (ch: string) => {
    if (ch === "IN_APP") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600"><Smartphone className="h-3.5 w-3.5" strokeWidth={2.5} /></div>
          <span className="text-xs font-bold text-stone-700">App Push</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-amber-600"><Send className="h-3.5 w-3.5" strokeWidth={2.5} /></div>
        <span className="text-xs font-bold text-stone-700">Email</span>
      </div>
    );
  };

  const renderStatusBadge = (status: string) => {
    if (status === "PROCESSING") return <StatusBadge label="Đang chạy" variant="info" pulse />;
    if (status === "SCHEDULED") return <StatusBadge label="Đã lên lịch" variant="warning" />;
    if (status === "SENT") return <StatusBadge label="Đã gửi" variant="success" />;
    if (status === "FAILED") return <StatusBadge label="Lỗi" variant="danger" />;
    if (status === "CANCELED") return <StatusBadge label="Đã hủy" variant="default" />;
    return <StatusBadge label={status} variant="default" />;
  };

  return (
    <div className="bg-app-bg min-h-full space-y-8 p-8">
      <PageHeader title="Trung tâm Truyền thông" description="Soạn thảo & Quản lý các chiến dịch gửi thông báo hàng loạt qua App (Push) hoặc Email." />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative w-full">
        <div className="relative z-0 flex w-full max-w-full overflow-hidden border-b border-stone-200 pb-px">
          <TabsList className="h-auto justify-start gap-4 bg-transparent p-0 w-full overflow-x-auto">
            <TabsTrigger value="create" className="hover:text-primary-hover data-[state=active]:bg-primary flex items-center gap-2 rounded-t-xl border border-transparent bg-white px-6 py-3 font-bold text-stone-500 transition-all hover:bg-stone-50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-200 data-[state=active]:hover:text-white">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Tạo thông báo mới
            </TabsTrigger>
            <TabsTrigger value="history" className="hover:text-primary-hover data-[state=active]:bg-primary flex items-center gap-2 rounded-t-xl border border-transparent bg-white px-6 py-3 font-bold text-stone-500 transition-all hover:bg-stone-50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-200 data-[state=active]:hover:text-white">
              <History className="h-4 w-4" strokeWidth={2.5} /> Lịch sử chiến dịch
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: TẠO THÔNG BÁO MỚI */}
        <TabsContent value="create" className="mt-8 outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="relative flex flex-col space-y-6 overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
                <div className="space-y-2">
                  <FormLabel label="Tiêu đề thông báo (*)" required />
                  <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." className="focus-visible:border-primary h-auto w-full rounded-xl border-stone-200 px-4 py-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-amber-400" />
                </div>

                <div className="space-y-2">
                  <FormLabel label="Nội dung thông báo (*)" required />
                  <RichTextEditor 
                    value={body} 
                    onChange={setBody} 
                    placeholder="Soạn thảo nội dung thông báo..." 
                    onImageInsert={handleImageInsert} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2">
                  <div className="space-y-2">
                    <FormLabel label="Loại thông báo (*)" icon={MessageSquare} required />
                    <FilterSelect value={type} onChange={(e) => setType(e.target.value)}
                      options={[
                        { value: "SYSTEM", label: "Hệ thống chung (Màu Xanh)" },
                        { value: "ORDER", label: "Đơn hàng/Giao dịch (Màu Lục)" },
                        { value: "PROMO", label: "Khuyến mãi/Voucher (Màu Vàng)" },
                        { value: "ALERT", label: "Cảnh báo khẩn (Màu Đỏ)" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel label="Đối tượng nhận (*)" icon={Users} required />
                    <FilterSelect value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                      options={[
                        { value: "ALL", label: "Tất cả mọi người" },
                        { value: "CUSTOMER", label: "Chỉ Khách hàng" },
                        { value: "RESTAURANT", label: "Chỉ Đối tác (Chủ quán)" },
                        { value: "SPECIFIC_USER", label: "Cá nhân cụ thể (Nhập Email)" },
                      ]}
                    />
                  </div>
                </div>

                {/* HIỆN THÊM Ô NHẬP EMAIL NẾU CHỌN SPECIFIC_USER */}
                {targetAudience === "SPECIFIC_USER" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <FormLabel label="Email người nhận (*)" required />
                    <Input 
                      type="email" 
                      placeholder="VD: nguyenvana@gmail.com" 
                      value={specificTargetEmail}
                      onChange={(e) => setSpecificTargetEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <FormLabel label="Lựa chọn nền tảng" icon={Send} required />
                  <div className="flex flex-col gap-3 pt-1">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="radio" name="channel" checked={channel === "IN_APP"} onChange={() => setChannel("IN_APP")} className="h-4 w-4 accent-amber-500" />
                      <span className="text-sm font-medium text-stone-700">App Notification (Quả chuông)</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="radio" name="channel" checked={channel === "EMAIL"} onChange={() => setChannel("EMAIL")} className="h-4 w-4 accent-amber-500" />
                      <span className="text-sm font-medium text-stone-700">Gửi qua Email</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 border-t border-stone-100 pt-4">
                  <FormLabel label="Lịch chiến dịch" icon={Calendar} />
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="radio" name="schedule" checked={scheduleType === "now"} onChange={() => setScheduleType("now")} className="h-4 w-4 accent-amber-500" />
                      <span className="text-sm font-medium text-stone-600">Gửi ngay</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="radio" name="schedule" checked={scheduleType === "later"} onChange={() => setScheduleType("later")} className="h-4 w-4 accent-amber-500" />
                      <span className="text-sm font-medium text-stone-600">Lên lịch gửi</span>
                    </label>
                  </div>
                  {scheduleType === "later" && (
                    <div className="mt-2 flex items-center gap-3">
                      
                      {/* Ô CHỌN NGÀY ĐÃ ĐƯỢC CUSTOM LẠI ĐỊNH DẠNG DD/MM/YYYY */}
                      <div className="relative w-40">
                        {/* Lớp hiển thị UI (Nhìn thấy được) */}
                        <div className="flex h-[42px] w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2.5 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400">
                          <span className="text-sm font-bold text-stone-700">
                            {scheduleDate ? scheduleDate.split("-").reverse().join("/") : "DD/MM/YYYY"}
                          </span>
                          <Calendar className="h-4 w-4 text-stone-400" />
                        </div>

                        {/* Lớp input thật bị làm trong suốt (Ẩn đi nhưng vẫn bấm được) */}
                        <input 
                          type="date" 
                          min={todayStr} 
                          value={scheduleDate} 
                          onChange={(e) => setScheduleDate(e.target.value)} 
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0" 
                        />
                      </div>

                      {/* Ô CHỌN GIỜ (Giữ nguyên) */}
                      <input 
                        type="time" 
                        value={scheduleTime} 
                        onChange={(e) => setScheduleTime(e.target.value)} 
                        className="h-[42px] rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" 
                      />
                      
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-end gap-3 border-t border-stone-100 pt-6">
                  <button onClick={handleCancel} className="rounded-xl border border-stone-200 px-6 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50">Hủy</button>
                  <button onClick={handleSaveCampaign} disabled={createMutation.isPending} className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-xl px-8 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50">
                    {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Lưu Chiến Dịch
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-6">
              <div className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <SectionHeader title="Chế Độ Mô Phỏng" icon={Smartphone} colorTheme="amber" className="mb-0" />
                <p className="mb-6 mt-1 text-xs text-stone-500">Xem trước hiển thị trên thiết bị điện thoại</p>
                <PhoneMockupPreview>
                  <div className="rounded-[20px] border border-white/20 bg-white/80 p-3.5 shadow-lg backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm">
                        <Sparkle className="h-5 w-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between">
                          <span className="text-brand-dark-hover text-[12px] font-bold">Dine Ease</span>
                          <span className="text-[10px] text-stone-500">now</span>
                        </div>
                        <p className="truncate text-[13px] font-bold">{title || "Tiêu đề thông báo..."}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-stone-600">
                          {body ? body.replace(/<[^>]*>?/gm, "") : "Nội dung chi tiết thông báo..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </PhoneMockupPreview>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LỊCH SỬ CHIẾN DỊCH */}
        <TabsContent value="history" className="mt-8 outline-none">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 p-5">
              <h2 className="text-brand-dark text-base font-bold">Lịch sử Chiến dịch</h2>
              
              <button 
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95 disabled:opacity-50"
              >
                <RotateCw className={cn("h-3.5 w-3.5 text-stone-400", isFetching && "animate-spin")} />
                {isFetching ? "Đang cập nhật..." : "Làm mới"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Tiêu đề chiến dịch</th>
                    <th className="px-6 py-4">Kênh gửi</th>
                    <th className="px-6 py-4">Đối tượng</th>
                    <th className="px-6 py-4">Lịch gửi</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {isLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-stone-400">Đang tải dữ liệu...</td></tr>
                  ) : historyData.length > 0 ? (
                    historyData.map((item: any) => (
                      <tr key={item.id} className="transition-colors hover:bg-stone-50">
                        <td className="px-6 py-4 font-mono text-xs text-stone-500">#{item.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-brand-dark max-w-[250px] truncate">{item.title}</td>
                        <td className="px-6 py-4">{renderChannelIcon(item.channel)}</td>
                        <td className="px-6 py-4 text-xs font-bold text-stone-600">{item.targetAudience}</td>
                        <td className="px-6 py-4 text-xs font-medium text-stone-600">
                          {formatDateTime(item.scheduledTime)}
                        </td>
                        <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {item.status === "SCHEDULED" ? (
                              <ActionIconButton 
                                icon={XCircle} 
                                actionType="delete" 
                                title="Hủy khẩn cấp chiến dịch này" 
                                onClick={() => handleCancelCampaign(item.id)} 
                                disabled={cancelMutation.isPending}
                              />
                            ) : (
                              <span className="text-xs text-stone-300">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="py-8 text-center text-stone-400">Không tìm thấy chiến dịch nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4">
                 <span className="text-xs text-stone-500">Trang {currentPage} / {totalPages}</span>
                 <div className="flex gap-2">
                   <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded border px-3 py-1 text-xs hover:bg-stone-50 disabled:opacity-50">Trước</button>
                   <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded border px-3 py-1 text-xs hover:bg-stone-50 disabled:opacity-50">Sau</button>
                 </div>
               </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
