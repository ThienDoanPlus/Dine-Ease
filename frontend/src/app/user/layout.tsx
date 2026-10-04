// src/app/user/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CalendarClock, Key, LogOut, Bell } from "lucide-react";
import { PublicHeader } from "@/components/customer/layouts/PublicHeader";
import { PublicFooter } from "@/components/customer/layouts/PublicFooter";
import { ChatbotWidget } from "@/components/customer/chatbot/ChatbotWidget";
import { useAuthContext } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Lấy user, trạng thái loading, và hàm logout từ AuthContext của Khoa
  const { user, isLoading, logoutContext } = useAuthContext();

  const menuItems = [
    { name: "Tài khoản của tôi", icon: User, href: "/user/profile", color: "text-blue-600 bg-blue-50" },
    { name: "Hộp thư đến", icon: Bell, href: "/user/notifications", color: "text-rose-600 bg-rose-50" },
    { name: "Lịch sử đặt bàn", icon: CalendarClock, href: "/user/bookings", color: "text-emerald-600 bg-emerald-50" },
    { name: "Đổi mật khẩu", icon: Key, href: "/user/password", color: "text-amber-600 bg-amber-50" },
  ];

  if (pathname.includes("/checkout")) {
    return <>{children}</>;
  }

  // Hàm tạo avatar mặc định nếu user chưa có ảnh (Giữ nguyên của Khoa)
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=F59E0B&color=fff`;

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] text-stone-800 font-sans antialiased">
      <PublicHeader />
      
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-28 pb-20 lg:flex-row">
        
        <aside className="w-full shrink-0 lg:w-80">
          <div className="rounded-[2.5rem] border border-stone-100 bg-white p-6 shadow-sm sticky top-28">
            
            <div className="mb-6 flex items-center gap-4 border-b border-stone-50 pb-6">
              {/* [CẬP NHẬT TỪ YẾN]: Dùng Skeleton khi đang loading để tránh giật layout */}
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </>
              ) : (
                <>
                  <img 
                    src={user?.avatarUrl || fallbackAvatar} 
                    alt="Avatar" 
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-amber-50 shadow-sm" 
                  />
                  <div>
                    <h3 className="font-bold text-[#2D2318] text-lg line-clamp-1">
                      {user?.fullName || "Khách hàng"}
                    </h3>
                    {/* Logic chia màu Hạng thành viên của Khoa/Yến */}
                    <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider 
                      ${user?.memberRank === 'VVIP Member' ? 'bg-purple-100 text-purple-700' : 
                       user?.memberRank === 'Gold Member' ? 'bg-yellow-100 text-yellow-700' :
                       'bg-amber-100 text-amber-700'}`}>
                      {user?.memberRank || "Thành viên"}
                    </span>
                    <p className="text-[10px] text-stone-400 mt-1 font-bold">
                      {user?.loyaltyPoints?.toLocaleString() || 0} điểm tích lũy
                    </p>
                  </div>
                </>
              )}
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-4 rounded-2xl p-3 transition-all ${isActive ? "bg-stone-50 border border-stone-100" : "border border-transparent hover:bg-stone-50"}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform ${item.color} ${isActive ? "scale-110 shadow-sm" : ""}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={`font-semibold ${isActive ? "text-[#2D2318]" : "text-stone-500"}`}>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 border-t border-stone-50 pt-6">
              <button 
                onClick={logoutContext}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 font-bold text-rose-600 transition-colors hover:bg-rose-100"
              >
                <LogOut className="h-5 w-5" /> Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 w-full min-w-0">
          {children}
        </section>
      </main>

      <PublicFooter />
      <ChatbotWidget />
    </div>
  );
}
