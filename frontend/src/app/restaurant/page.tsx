"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Banknote, Users, ShoppingBag, PieChart, Download, CreditCard, Coins, Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import { StatCard } from "@/components/shared/ui/StatCard";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/shared/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/skeleton";

// --- IMPORT HOOKS MỚI ---
import { useGetRestaurantDashboard, useGetRecentTransactions, useExportRestaurantReport, useGetTopSellingItems } from "@/hooks/useRestaurant";

export default function RestaurantDashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  // --- GỌI API ---
  const { data: dashData, isLoading: isLoadingDash } = useGetRestaurantDashboard(period);
  const dashboardData = dashData as any;
  const { data: trxData, isLoading: isLoadingTrx } = useGetRecentTransactions();
  const transactionsData: any[] = (trxData as any[]) || [];
  const { data: topData, isLoading: isLoadingTop } = useGetTopSellingItems();
  const topItemsData: any[] = (topData as any[]) || [];
  const exportMutation = useExportRestaurantReport();

  const handleExport = () => {
    exportMutation.mutate({ format: "excel" }, {
      onSuccess: () => toast.success("Đã kết xuất báo cáo thành công!"),
      onError: () => toast.error("Lỗi kết xuất báo cáo")
    });
  };

  const getMethodIcon = (type: string) => {
    if (type === "card") return <CreditCard className="h-5 w-5 text-stone-400" />;
    if (type === "momo") return <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#A50064] text-[8px] font-black text-white italic">M</div>;
    return <Coins className="h-5 w-5 text-stone-400" />;
  };

  const getStatusConfig = (status: string): any => {
    if (status === "Hoàn tất") return { variant: "success" };
    if (status === "Đang chờ") return { variant: "warning", pulse: true };
    return { variant: "danger" };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 p-6 pb-20 duration-500 lg:p-8">
      <PageHeader
        title="Tổng quan hoạt động"
        description="Báo cáo doanh thu và hiệu suất kinh doanh của nhà hàng theo thời gian thực."
        action={
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <SegmentedControl
              variant="default"
              fullWidth
              value={period}
              onChange={(val) => setPeriod(val as any)}
              options={[{ value: "today", label: "Hôm nay" }, { value: "week", label: "Tuần" }, { value: "month", label: "Tháng" }]}
            />
            <Button onClick={handleExport} disabled={exportMutation.isPending} size="lg" uppercase className="w-full sm:w-auto rounded-2xl shadow-xl shadow-stone-200">
              {exportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Download className="h-4 w-4" strokeWidth={2.5} />}
              {exportMutation.isPending ? "Đang xuất..." : "Xuất báo cáo"}
            </Button>
          </div>
        }
      />

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Doanh thu tổng" value={isLoadingDash ? "..." : (dashboardData?.totalRevenue?.toLocaleString("vi-VN") || 0)} unit="VNĐ" icon={Banknote} colorTheme="amber" />
        <StatCard title="Đang phục vụ" value={isLoadingDash ? "..." : (dashboardData?.totalGuests || 0)} unit="Khách" icon={Users} colorTheme="blue" />
        <StatCard title="Đơn hàng mới" value={isLoadingDash ? "..." : (dashboardData?.newOrders || 0)} unit="Order" icon={ShoppingBag} colorTheme="emerald" />

        {/* Card Tỉ lệ lấp đầy bàn */}
        <div className="bg-primary border-primary-hover shadow-primary/30 rounded-4xl border p-6 text-white shadow-xl lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <PieChart className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <p className="mb-1 text-[9px] font-bold tracking-[0.2em] text-white/80 uppercase">Tỉ lệ lấp đầy bàn</p>
          <h4 className="text-4xl font-black tracking-tighter">{isLoadingDash ? "..." : `${dashboardData?.occupancyRate || 0}%`}</h4>
        </div>
      </div>

      {/* CHART & TOP ITEMS */}
      <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-3">
        {/* RECHARTS Tích hợp */}
        <div className="glass-panel p-6 lg:p-10 xl:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-brand-dark text-xl font-bold tracking-tight">Hiệu suất Doanh thu</h3>
              <p className="mt-1 text-xs font-medium text-stone-400 italic">Theo dõi biến động dòng tiền theo thời gian thực</p>
            </div>
          </div>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRestRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#A8A29E", fontSize: 11, fontWeight: "bold" }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  allowDecimals={false}
                  tick={{ fill: "#A8A29E", fontSize: 11, fontWeight: "bold" }} 
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    return `${Math.floor(value / 1000000)}M`;
                  }}
                  domain={[0, 'auto']}
                />
                <CartesianGrid vertical={false} stroke="#F5F5F4" strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)}M VNĐ`, "Doanh thu"]} />
                <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorRestRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP SELLING ITEMS */}
        <div className="glass-panel flex flex-col p-6 lg:p-10">
          <h3 className="mb-8 text-xl font-bold tracking-tight">Thực đơn bán chạy</h3>
          <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto pr-2">
            {isLoadingTop ? (
              <div className="space-y-4">
                 <Skeleton className="h-16 w-full rounded-2xl" />
                 <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : topItemsData && topItemsData.length > 0 ? (
              topItemsData.map((item: any, idx: number) => (
                <div key={item.id} className="group flex items-center gap-4 rounded-2xl p-2 transition-all hover:bg-stone-50">
                  <div className="relative shrink-0">
                    <img src={item.img} alt={item.name} className="h-14 w-14 rounded-2xl object-cover shadow-sm" />
                    <div className="absolute -top-2 -left-2 h-6 w-6 bg-primary flex items-center justify-center rounded-lg border-2 border-white text-[10px] font-black text-white shadow-lg">{idx + 1}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-start justify-between">
                      <p className="text-brand-dark truncate text-sm font-bold">{item.name}</p>
                      <p className="text-[10px] font-black text-primary">{item.orders} đơn</p>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm font-medium text-stone-400">Chưa có dữ liệu.</div>
            )}
          </div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="glass-panel p-6 lg:p-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h3 className="text-brand-dark text-xl font-bold tracking-tight">Lịch sử giao dịch mới nhất</h3>
          <div className="flex w-fit items-center gap-2 rounded-full bg-stone-50 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span className="text-[9px] font-black tracking-widest text-stone-400 uppercase">Đang cập nhật trực tiếp</span>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto pb-4">
          <table className="w-full min-w-[800px] text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-stone-50 text-[10px] font-black tracking-[0.25em] text-stone-300 uppercase">
                <th className="pb-5 pl-4">Mã đơn & Phương thức</th>
                <th className="pb-5 text-center">Khung giờ</th>
                <th className="pb-5">Sản phẩm tiêu biểu</th>
                <th className="pb-5 text-right">Tổng thanh toán</th>
                <th className="pr-4 pb-5 text-center">Trạng thái đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50/80">
              {isLoadingTrx ? (
                <tr><td colSpan={5} className="py-8 text-center text-stone-400">Đang tải giao dịch...</td></tr>
              ) : transactionsData && transactionsData.length > 0 ? (
                transactionsData.map((trx: any, idx: number) => (
                  <tr key={idx} className="group transition-all hover:bg-stone-50/50">
                    <td className="py-5 pl-4">
                      <div className="flex items-center gap-4">
                        <div className="group-hover:bg-primary-light flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 transition-colors">
                          {getMethodIcon(trx.type)}
                        </div>
                        <div>
                          <p className="text-brand-dark group-hover:text-primary-hover text-sm font-black tracking-tight">{trx.id}</p>
                          <p className="mt-0.5 text-[9px] font-bold text-stone-400 uppercase">{trx.method}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-center text-sm font-bold text-stone-400 italic">{trx.time}</td>
                    <td className="py-5"><p className="max-w-[200px] truncate text-sm font-semibold text-stone-600">{trx.items}</p></td>
                    <td className="py-5 text-right">
                      <span className="text-brand-dark text-sm font-black tabular-nums">{trx.amount.toLocaleString("vi-VN")}</span>
                      <small className="ml-1 text-[9px] font-bold text-stone-400 uppercase">VNĐ</small>
                    </td>
                    <td className="py-5 pr-4 text-center">
                      <div className="flex justify-center"><StatusBadge label={trx.status} {...getStatusConfig(trx.status)} /></div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-8 text-center text-stone-400">Chưa có giao dịch nào hôm nay.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
