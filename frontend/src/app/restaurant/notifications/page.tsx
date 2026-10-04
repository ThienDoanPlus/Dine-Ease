import React from "react";
import { NotificationList } from "@/components/shared/notifications/NotificationList";
import { PageHeader } from "@/components/shared/ui/PageHeader";

export default function RestaurantNotificationsPage() {
  return (
    <div className="bg-app-bg min-h-full p-6 lg:p-8">
      <PageHeader 
        title="Thông báo hệ thống" 
        description="Cập nhật trạng thái đơn hàng và các tin tức từ ban quản trị DineEase." 
      />
      <NotificationList />
    </div>
  );
}
