"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/AuthProvider";

import { LogOut, LayoutGrid, FileCheck, Store, UtensilsCrossed, Bell, Settings, LayoutTemplate, BookOpen, MonitorSmartphone, ChevronLeft, ChevronRight, LucideIcon, ChefHat, Users, Send } from "lucide-react";

interface AppSidebarProps {
  layoutType: "admin" | "restaurant";
}

interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  hasBadge?: boolean;
}

export function AppSidebar({ layoutType }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, isMounted, logoutContext } = useAuthContext();
  const [isExpanded, setIsExpanded] = useState(true);

  const adminLinks: NavLink[] = [
    { name: "Tổng quan", href: "/admin", icon: LayoutGrid },
    { name: "Duyệt đối tác", href: "/admin/partners", icon: FileCheck },
    { name: "QL Nhà hàng", href: "/admin/restaurants", icon: Store },
    { name: "QL Người dùng", href: "/admin/users", icon: Users },
    { name: "DM Cuisine", href: "/admin/cuisines", icon: UtensilsCrossed },
    { name: "Thông báo", href: "/admin/notifications", icon: Send },
    { name: "Cấu hình", href: "/admin/settings", icon: Settings },
  ];

  const restaurantLinks: NavLink[] = [
    { name: "Tổng quan", href: "/restaurant", icon: LayoutGrid },
    { name: "Sơ đồ bàn", href: "/restaurant/tables", icon: LayoutTemplate },
    { name: "Thực đơn", href: "/restaurant/menu", icon: BookOpen },
    { name: "Đặt bàn", href: "/restaurant/reservations", icon: BookOpen },
    { name: "Quản lý Bếp", href: "/restaurant/kitchen", icon: ChefHat, hasBadge: true },
    { name: "POS Thanh toán", href: "/restaurant/pos", icon: MonitorSmartphone },
    { name: "Cấu hình", href: "/restaurant/settings", icon: Settings },
  ];

  const currentLinks = layoutType === "admin" ? adminLinks : restaurantLinks;

  const isActive = (path: string) => {
    if (path === `/${layoutType}` && pathname === `/${layoutType}`) return true;
    if (path !== `/${layoutType}` && pathname.startsWith(path)) return true;
    return false;
  };

  if (!isMounted) return null;

  const displayName = user?.fullName || "Khách";
  // SỬA LẠI LOGIC CHUẨN CỦA BẠN Ở ĐÂY
  const displayRole = user?.roles?.includes("ADMIN") ? "Super Admin" : "Restaurant Manager";
  const displayAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100";

  return (
    <aside className={cn("relative z-50 flex hidden h-full shrink-0 flex-col border-r border-stone-100 bg-white transition-all duration-300 md:flex", isExpanded ? "w-64 lg:w-72" : "w-20 items-center lg:w-24")}>
      <button onClick={() => setIsExpanded(!isExpanded)} className="hover:text-primary-hover absolute top-10 -right-3.5 z-50 rounded-full border border-stone-200 bg-white p-1.5 text-stone-500 shadow-sm transition-all hover:bg-stone-50">
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div className={cn("flex items-center p-6 transition-all xl:p-8", isExpanded ? "justify-start" : "justify-center p-6")}>
        <Link href={`/${layoutType}`} className="group flex items-center text-2xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200 transition-transform group-hover:scale-105">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <span className={cn("font-bold tracking-tight text-[#2D2318] overflow-hidden whitespace-nowrap transition-all", isExpanded ? "ml-2 w-auto opacity-100" : "ml-0 w-0 opacity-0")}>
            Dine <span className="text-amber-500">Ease</span>
          </span>
        </Link>
      </div>

      <nav className={cn("custom-scrollbar mt-4 flex-1 space-y-2 overflow-y-auto px-4", !isExpanded && "flex flex-col items-center")}>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link key={link.href} href={link.href} title={!isExpanded ? link.name : undefined} className={cn("group relative flex items-center rounded-xl font-medium transition-all", isExpanded ? "gap-4 px-4 py-3" : "h-12 w-12 justify-center", active ? "bg-primary shadow-primary/20 text-white shadow-lg" : "hover:text-brand-dark text-stone-500 hover:bg-stone-50")}>
              <div className="relative shrink-0">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {link.hasBadge && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full border border-white bg-red-500"></span>}
              </div>
              <span className={cn("overflow-hidden whitespace-nowrap transition-all", isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")}>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto p-4 transition-all xl:p-6", !isExpanded && "p-4")}>
        {isExpanded ? (
          <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <Image src={displayAvatar} width={40} height={40} className="shrink-0 rounded-full border-2 border-white object-cover shadow-sm" alt="Avatar" />
            <div className="min-w-0 flex-1">
              <p className="text-brand-dark truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-[11px] font-medium text-stone-500">{displayRole}</p>
            </div>
            <button onClick={logoutContext} title="Đăng xuất" className="shrink-0 rounded-lg border border-stone-200 bg-white p-1.5 text-stone-400 transition-colors hover:text-red-500">
              <LogOut className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button onClick={logoutContext} title="Đăng xuất" className="flex h-12 w-12 items-center justify-center rounded-2xl text-stone-400 transition-all hover:bg-red-50 hover:text-red-500">
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </aside>
  );
}
