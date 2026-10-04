"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, MessageSquare, User, Key, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyNotifications } from "@/hooks/useCustomer";

interface AppHeaderProps {
  layoutType: "admin" | "restaurant";
}

export function AppHeader({ layoutType }: AppHeaderProps) {
  const { user, isMounted, logoutContext } = useAuthContext();

  const { data: notificationsData } = useMyNotifications();
  const notifications = (notificationsData as unknown as any[]) || [];
  const hasUnread = notifications.some((n) => !n.isRead);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-end border-b border-stone-100 bg-white/80 px-8 backdrop-blur-md">
        <Skeleton className="h-10 w-40 rounded-xl" />
      </header>
    );
  }

  const isAdmin = layoutType === "admin";
  const displayName = user?.fullName || "Khách";
  // SỬA LOGIC CỦA BẠN VÀO ĐÂY (Kiểm tra mảng roles)
  const displayRole = user?.roles?.includes("ADMIN") ? "Super Admin" : "Restaurant Manager";
  const displayAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100";

  return (
    <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-stone-100 bg-white/80 px-8 backdrop-blur-md">
      <div className="max-w-xl flex-1">
        <div className={cn("group relative", isAdmin ? "w-full max-w-md" : "hidden w-64 lg:block")}>
          <span className="group-focus-within:text-primary absolute inset-y-0 left-4 flex items-center text-stone-400">
            <Search className={isAdmin ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2.5} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAdmin ? "Tìm kiếm nhà hàng, mã đơn..." : "Tìm kiếm nhanh..."}
            className={cn(
              "focus:ring-primary/10 w-full rounded-xl border border-stone-100 bg-stone-50 text-stone-700 transition-all outline-none focus:bg-white focus:ring-4",
              isAdmin ? "py-3 pr-10 pl-12 text-sm" : "py-2.5 pr-4 pl-11 text-sm"
            )}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
        <div className="relative" ref={notifRef}>
          <Link
            href={isAdmin ? "/admin/alerts" : "/restaurant/notifications"}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
          >
            <Bell className="h-5 w-5" strokeWidth={2.5} />
            {/* Logic hiển thị chấm đỏ nếu có thông báo mới */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
            )}
          </Link>
        </div>

        <div className="relative pl-0 sm:pl-2" ref={profileRef}>
          <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="group flex cursor-pointer items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-brand-dark text-sm font-bold">{displayName}</p>
              <p className="text-[10px] font-medium text-stone-400">{displayRole}</p>
            </div>
            <Image src={displayAvatar} width={44} height={44} className={cn("border-2 object-cover shadow-sm transition-transform group-hover:scale-105", isAdmin ? "h-10 w-10 rounded-full border-stone-100" : "h-11 w-11 rounded-2xl border-transparent bg-stone-100")} alt="Profile" />
          </div>

          {isProfileOpen && (
            <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-xl">
              <div className="border-t border-stone-50 p-2">
                <button onClick={logoutContext} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
