import React from "react";
import { BookingData, BookingStatus } from "./types";
import { BookingCard } from "./BookingCard";

interface KanbanBoardProps {
  pendingBookings: BookingData[];
  confirmedBookings: BookingData[];
  finalBookings: BookingData[];
  onUpdateStatus: (id: number, newStatus: BookingStatus) => void;
  onAssignTable: (id: number) => void;
}

export function KanbanBoard({
  pendingBookings,
  confirmedBookings,
  finalBookings,
  onUpdateStatus,
  onAssignTable,
}: KanbanBoardProps) {
  const Column = ({
    title,
    count,
    data,
    badgeColor,
  }: {
    title: string;
    count: number;
    data: BookingData[];
    badgeColor: string;
  }) => (
    <div className="flex h-full min-w-[280px] flex-1 flex-col overflow-hidden rounded-3xl border border-stone-100 bg-stone-100/50 shadow-sm transition-all lg:min-w-[300px]">
      {/* Column Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-stone-100/50 bg-stone-50/80 p-5">
        <h3 className="text-brand-dark text-sm font-black tracking-widest uppercase">{title}</h3>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${badgeColor}`}>
          {count}
        </span>
      </div>

      {/* Column Body (Scrollable) */}
      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-3">
        {data.length > 0 ? (
          data.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdateStatus={onUpdateStatus}
              onAssignTable={onAssignTable}
            />
          ))
        ) : (
          <div className="mx-1 flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-xs font-bold text-stone-400">
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-app-bg flex h-full w-full items-start gap-4 p-4 lg:gap-6 lg:p-6 overflow-x-auto no-scrollbar">
      <Column
        title="Yêu cầu mới"
        count={pendingBookings.length}
        data={pendingBookings}
        badgeColor="bg-orange-100 text-orange-600"
      />
      <Column
        title="Đã xác nhận"
        count={confirmedBookings.length}
        data={confirmedBookings}
        badgeColor="bg-blue-100 text-blue-600"
      />
      <Column
        title="Hoàn thành / Hủy"
        count={finalBookings.length}
        data={finalBookings}
        badgeColor="bg-stone-200 text-stone-600"
      />
    </div>
  );
}
