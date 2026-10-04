import React from "react";
import { NotificationList } from "@/components/shared/notifications/NotificationList";

export default function UserNotificationsPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-black tracking-tight text-[#2D2318]">Hộp thư đến</h1>
      <NotificationList />
    </div>
  );
}
