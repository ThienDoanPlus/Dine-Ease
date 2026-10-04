import React from "react";
import { NotificationList } from "@/components/shared/notifications/NotificationList";
import { PageHeader } from "@/components/shared/ui/PageHeader";

export default function AdminAlertsPage() {
  return (
    <div className="bg-app-bg min-h-full p-6 lg:p-8">
      <PageHeader 
        title="Hộp thư hệ thống" 
        description="Theo dõi các cảnh báo bảo mật, hoạt động từ nhà hàng và hệ thống." 
      />
      <NotificationList />
    </div>
  );
}
