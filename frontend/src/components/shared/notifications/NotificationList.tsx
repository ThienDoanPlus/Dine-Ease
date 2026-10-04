"use client";

import React, { useState } from "react";
import { Bell, Info, CheckCircle, AlertTriangle, Gift, CheckCheck, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { SegmentedControl } from "@/components/shared/ui/SegmentedControl";

// IMPORT HOOKS
import { useMyNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useCustomer";

export function NotificationList() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  // State quản lý danh sách các ID thông báo đang được mở chi tiết
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // GỌI API
  const { data: notificationsData, isLoading } = useMyNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications: any[] = (notificationsData as any) || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const filteredData = notifications.filter((n: any) => 
    filter === "all" ? true : !n.isRead
  );

  // Hàm xử lý đóng/mở chi tiết
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id: number, isRead: boolean) => {
    // 1. Nếu chưa đọc thì đánh dấu đã đọc
    if (!isRead) markReadMutation.mutate(id);
    // 2. Toggle trạng thái mở rộng
    toggleExpand(id);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) markAllReadMutation.mutate();
  };

  const getDynamicIcon = (type: string) => {
    switch (type) {
      case "SYSTEM": return <Info className="h-5 w-5 text-blue-500" />;
      case "ORDER": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "ALERT": return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case "PROMO": return <Gift className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-stone-500" />;
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" /></div>;
  }

  return (
    <div className="rounded-4xl border border-stone-100 bg-white p-6 shadow-sm md:p-8">
      {/* Header & Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          variant="pill"
          value={filter}
          onChange={(val) => setFilter(val as any)}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "unread", label: `Chưa đọc (${unreadCount})` },
          ]}
        />
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 text-sm font-bold text-amber-600 transition-colors hover:text-amber-700 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((notif: any) => {
            const isExpanded = expandedIds.includes(notif.id);
            
            return (
              <div 
                key={notif.id}
                onClick={() => handleItemClick(notif.id, notif.isRead)}
                className={cn(
                  "group relative flex flex-col cursor-pointer rounded-2xl p-4 transition-all border",
                  notif.isRead 
                    ? "bg-transparent border-transparent hover:bg-stone-50" 
                    : "bg-amber-50/30 border-amber-100 hover:bg-amber-50/50",
                  isExpanded && "border-amber-200 bg-white shadow-md ring-4 ring-amber-400/5"
                )}
              >
                {/* Header item: Icon + Title + Meta */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-stone-100">
                    {getDynamicIcon(notif.type)}
                  </div>

                  <div className="flex-1 pr-8">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("text-sm mb-0.5", notif.isRead ? "font-bold text-stone-700" : "font-black text-brand-dark")}>
                        {notif.title}
                      </h4>
                      <p className="text-[10px] font-bold text-stone-400">
                        {formatDateTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Sơ lược nội dung: Chỉ hiện khi chưa mở rộng */}
                    {!isExpanded && (
                      <div 
                        className="text-xs text-stone-500 line-clamp-1 font-medium"
                        dangerouslySetInnerHTML={{ __html: notif.content.replace(/<img[^>]*>/g, '[Hình ảnh]') }}
                      />
                    )}
                  </div>

                  {/* Nút chỉ báo đóng mở */}
                  <div className="absolute right-4 top-5 text-stone-300">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  
                  {/* Chấm đỏ báo chưa đọc */}
                  {!notif.isRead && !isExpanded && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></div>
                  )}
                </div>

                {/* Chi tiết nội dung: Chỉ hiện khi isExpanded = true */}
                {isExpanded && (
                  <div 
                    className="mt-4 pt-4 border-t border-stone-100 animate-in fade-in slide-in-from-top-2 duration-300"
                    onClick={(e) => e.stopPropagation()} // Ngăn click vào nội dung bị đóng lại
                  >
                    <div 
                      className="prose prose-sm max-w-none text-stone-600 font-medium 
                                 prose-img:rounded-2xl prose-img:shadow-lg prose-img:max-h-[400px] prose-img:mx-auto"
                      dangerouslySetInnerHTML={{ __html: notif.content }}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-300">
              <Bell className="h-8 w-8" />
            </div>
            <p className="font-bold text-stone-500">Không có thông báo nào!</p>
          </div>
        )}
      </div>
    </div>
  );
}
