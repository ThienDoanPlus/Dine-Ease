"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Search, ChevronDown, User, LogOut, ListOrdered, Settings, Info, CheckCircle, AlertTriangle, Gift } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useMyNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useCustomer";
import { formatDateTime } from "@/lib/utils";

function NotificationBell() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: notificationsData } = useMyNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications: any[] = (notificationsData as any) || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDynamicIcon = (type: string) => {
    switch (type) {
      case "SYSTEM": return <Info className="h-5 w-5 text-blue-500" />;
      case "ORDER": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "ALERT": return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case "PROMO": return <Gift className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-stone-500" />;
    }
  };

  return (
    <div className="relative" ref={notifRef}>
      <button 
        onClick={() => setIsNotifOpen(!isNotifOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-brand-dark">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isNotifOpen && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
            <h3 className="font-bold text-brand-dark">Thông báo</h3>
            {unreadCount > 0 && (
              <span 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-primary font-medium cursor-pointer hover:underline"
              >
                Đánh dấu đã đọc
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">Chưa có thông báo nào.</div>
            ) : (
              notifications.map((n: any) => (
                <div 
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markReadMutation.mutate(n.id);
                  }}
                  className={`p-4 border-b border-stone-50 cursor-pointer transition-colors flex gap-3 ${!n.isRead ? 'bg-orange-50/50 hover:bg-orange-100/50' : 'hover:bg-stone-100'}`}
                >
                  <div className="mt-1 flex-shrink-0">{getDynamicIcon(n.type)}</div>
                  <div>
                    <h4 className={`text-sm ${!n.isRead ? 'font-bold text-stone-800' : 'font-medium text-stone-600'}`}>{n.title}</h4>
                    <p className={`text-xs mt-1 ${!n.isRead ? 'text-stone-700' : 'text-stone-500'}`}>{n.content}</p>
                    <span className="text-[10px] text-stone-400 mt-2 block">{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 text-center border-t border-stone-100 hover:bg-stone-50 transition-colors">
            <Link href="/user/notifications" onClick={() => setIsNotifOpen(false)} className="text-sm font-bold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function PublicHeader() {
  const { user, logoutContext } = useAuthContext();
  const isLoggedIn = !!user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-brand-dark/95 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-stone-800">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        
        {/* LEFT: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex cursor-pointer items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
            </div>
            <span className="font-heading hidden text-2xl font-bold tracking-tight text-white sm:block">
              Dine <span className="text-primary">Ease</span>
            </span>
          </Link>
        </div>

        {/* RIGHT: Auth & Actions */}
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-5">
              {/* Nút Thông báo (Hộp thư) - Component riêng biệt để gọi API thật */}
              <NotificationBell />
              
              <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer rounded-full p-1 pr-3 hover:bg-stone-800 transition-colors"
              >
                <Image
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"}
                  width={40} height={40} alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-light"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold leading-none text-white">{user?.fullName}</p>
                  <p className="mt-1 text-[11px] font-bold tracking-wider text-primary uppercase">Thành viên</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Menu Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="py-1">
                    <Link href="/user/bookings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-primary transition-colors">
                      <ListOrdered className="h-4 w-4" /> Lịch sử đặt bàn
                    </Link>
                    <Link href="/user/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-primary transition-colors">
                      <Settings className="h-4 w-4" /> Cài đặt hồ sơ
                    </Link>
                    <div className="border-t border-stone-100 my-1"></div>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logoutContext();
                      }} 
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            // Trạng thái chưa đăng nhập
            <Link href="/login">
              <button className="group flex items-center gap-2 rounded-xl border-2 border-stone-700 px-4 py-2 font-bold text-white transition-all hover:border-primary">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-colors group-hover:bg-primary group-hover:text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">Đăng nhập / Đăng kí</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
