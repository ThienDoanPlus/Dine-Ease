"use client";

import React, { useState } from "react";
import { Download, Banknote, ShoppingBag, Store, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/ui/PageHeader";
import { StatCard } from "@/components/shared/ui/StatCard";
import { DateRangePicker } from "@/components/shared/ui/DateRangePicker";
import { RankingTable } from "@/components/admin/ui/RankingTable";
import { ExportReportModal } from "./_components/ExportReportModal";
import { Button } from "@/components/ui/button";

import { 
  useAdminDashboard, 
  useAdminCuisineChart, 
  useAdminRevenueChart, 
  useAdminTopRankings 
} from "@/hooks/useAdmin";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xl">
        <p className="mb-2 text-sm font-bold text-stone-500">Ngày: {label}</p>
        <p className="text-sm font-black text-amber-600">
          Doanh thu: {data.revenue.toLocaleString("vi-VN")} VNĐ
        </p>
        <p className="mt-1 text-sm font-bold text-blue-600">
          Số đơn: {data.orders}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  
  // State tạm (dùng cho DatePicker)
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // State chính thức (Truyền vào Hook để gọi API)
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const { data: dashboardStats, isLoading } = useAdminDashboard(appliedStartDate, appliedEndDate);
  const { data: cuisineData = [] } = useAdminCuisineChart();
  const { data: trendData = [] } = useAdminRevenueChart();
  const { data: rankingsData, isLoading: isLoadingRankings } = useAdminTopRankings();

  // Hàm xử lý khi bấm nút "Áp dụng"
  const handleApplyFilter = () => {
    // [ĐÃ FIX]: Kiểm tra nếu chỉ chọn 1 trong 2 ngày (tránh lỗi API)
    if ((tempStartDate && !tempEndDate) || (!tempStartDate && tempEndDate)) {
      toast.error("Vui lòng chọn đầy đủ cả ngày bắt đầu và ngày kết thúc!");
      return;
    }
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    toast.success("Đã lọc dữ liệu thành công!");
  };

  // [ĐÃ FIX]: Hàm xóa bộ lọc
  const handleClearFilter = () => {
    setTempStartDate("");
    setTempEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    toast.info("Đã xóa bộ lọc!");
  };

  return (
    <>
      <div className="bg-app-bg min-h-full p-8">
        <PageHeader
          title="TỔNG QUAN HỆ THỐNG"
          description="Báo cáo hoạt động kinh doanh toàn nền tảng"
          action={
            <>
              <DateRangePicker 
                startDate={tempStartDate} 
                endDate={tempEndDate} 
                onStartDateChange={setTempStartDate} 
                onEndDateChange={setTempEndDate} 
                onApply={handleApplyFilter} 
                onClear={handleClearFilter}
              />
              <Button onClick={() => setExportModalOpen(true)}>
                <Download className="h-4 w-4" strokeWidth={2.5} /> Xuất báo cáo
              </Button>
            </>
          }
        />

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Nhà hàng hoạt động" value={isLoading ? "..." : dashboardStats?.totalRestaurants || 0} unit="Quán" icon={Store} colorTheme="purple" />
          <StatCard title="Tổng đơn toàn hệ thống" value={isLoading ? "..." : dashboardStats?.totalReservations || 0} unit="Đơn" icon={ShoppingBag} colorTheme="blue" />
          <StatCard title="Đơn thành công" value={isLoading ? "..." : dashboardStats?.successfulReservations || 0} unit="Đơn" icon={CheckCircle} colorTheme="emerald" />
          <StatCard title="Tổng hoa hồng" value={isLoading ? "..." : (dashboardStats?.totalCommissionRevenue || 0).toLocaleString("vi-VN")} unit="VNĐ" icon={Banknote} colorTheme="amber" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="glass-panel rounded-4xl p-8 lg:col-span-2">
            <h2 className="text-brand-dark text-xl font-bold">XU HƯỚNG KINH DOANH</h2>
            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#A8A29E", fontSize: 10, fontWeight: "bold" }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                  <CartesianGrid vertical={false} stroke="#F5F5F4" strokeDasharray="3 3" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} fill="#F59E0B" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel relative flex flex-col items-center justify-center overflow-hidden rounded-4xl p-8">
            <h2 className="text-brand-dark text-xl font-bold mb-4">TỈ LỆ ĐẶT BÀN</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cuisineData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {cuisineData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* [BỔ SUNG]: RENDER 2 BẢNG XẾP HẠNG TOP RANKING */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* Bảng Top Doanh Thu */}
          <div className="h-96">
            <RankingTable
              title="🏆 TOP 5 DOANH THU NHÀ HÀNG"
              action={<span className="text-[10px] font-bold text-stone-400">Dữ liệu thời gian thực</span>}
              columns={[
                { label: "Hạng", className: "w-16" },
                { label: "Nhà hàng" },
                { label: "Đơn thành công", className: "text-center" },
                { label: "Tổng doanh thu", className: "text-right" }
              ]}
              data={rankingsData?.topRevenue || []}
              renderRow={(item: any, index: number) => (
                <tr key={index} className="transition-colors hover:bg-stone-50">
                  <td className="px-6 py-4 text-sm font-black text-stone-400">#{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-brand-dark">{item.name}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-stone-500">{item.totalOrders}</td>
                  <td className="px-6 py-4 text-right text-sm font-black text-emerald-600">
                    {item.revenue ? item.revenue.toLocaleString("vi-VN") : 0} đ
                  </td>
                </tr>
              )}
            />
          </div>

          {/* Bảng Top Hủy Đơn */}
          <div className="h-96">
            <RankingTable
              title="⚠️ TOP 5 HỦY ĐƠN ĐẶT BÀN"
              action={<span className="text-[10px] font-bold text-stone-400">Cần lưu ý</span>}
              columns={[
                { label: "Hạng", className: "w-16" },
                { label: "Nhà hàng" },
                { label: "Số lượng hủy", className: "text-right text-rose-500" }
              ]}
              data={rankingsData?.topCancelled || []}
              renderRow={(item: any, index: number) => (
                <tr key={index} className="transition-colors hover:bg-stone-50">
                  <td className="px-6 py-4 text-sm font-black text-stone-400">#{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-brand-dark">{item.name}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="rounded-lg bg-rose-50 px-3 py-1 text-sm font-black text-rose-600 border border-rose-100">
                      {item.cancelCount} đơn
                    </span>
                  </td>
                </tr>
              )}
            />
          </div>

        </div>

      </div>
      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
        startDate={appliedStartDate} 
        endDate={appliedEndDate} 
      />
    </>
  );
}
