import React from "react";
import { AppSidebar } from "@/components/shared/layouts/AppSidebar";
import { AppHeader } from "@/components/shared/layouts/AppHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app-bg text-brand-dark flex h-screen w-full overflow-hidden font-sans antialiased">
      {/* Sidebar tự quyết định chiều rộng */}
      <AppSidebar layoutType="admin" />

      {/* Nội dung bên phải chiếm phần không gian còn lại (flex-1) */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader layoutType="admin" />
        <main className="custom-scrollbar flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
