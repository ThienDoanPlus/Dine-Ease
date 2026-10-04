import React from "react";
import { AppSidebar } from "@/components/shared/layouts/AppSidebar";
import { AppHeader } from "@/components/shared/layouts/AppHeader";

// 1. IMPORT COMPONENT VỪA TẠO VÀO
import { GlobalRestaurantWarning } from "@/components/restaurant/shared/GlobalRestaurantWarning";

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app-bg text-brand-dark flex h-screen w-full overflow-hidden font-sans antialiased">
      {/* Sidebar */}
      <AppSidebar layoutType="restaurant" />

      {/* Nội dung bên phải */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader layoutType="restaurant" />
        
        {/* 2. GẮN BANNER VÀO DƯỚI HEADER, TRÊN MAIN CONTENT */}
        <GlobalRestaurantWarning />

        <main className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
