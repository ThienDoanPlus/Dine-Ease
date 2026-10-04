import React from "react";
import { Clock, CalendarDays, Users, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingSummaryCardProps {
  time: string;
  date: string;
  guests: number;
  onEditClick?: () => void;
}

export function BookingSummaryCard({
  time,
  date,
  guests,
  onEditClick,
}: BookingSummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">Tóm tắt đặt chỗ</h3>
        </div>

        <div className="space-y-5">
          {/* Giờ đến */}
          <div className="group flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
              <Clock className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-0.5">Giờ đến</p>
              <p className="font-bold text-stone-800 text-base">{time}</p>
            </div>
          </div>

          {/* Ngày đặt */}
          <div className="group flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
              <CalendarDays className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-0.5">Ngày đặt</p>
              <p className="font-bold text-stone-800 text-base">{date}</p>
            </div>
          </div>

          {/* Số người */}
          <div className="group flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
              <Users className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-0.5">Số người</p>
              <p className="font-bold text-stone-800 text-base">
                {guests < 10 ? `0${guests}` : guests} Khách
              </p>
            </div>
          </div>
        </div>

        {/* Nút sửa */}
        {onEditClick && (
          <Button
            variant="customer-outline"
            className="mt-8 w-full font-bold"
            onClick={onEditClick}
          >
            Sửa thông tin
          </Button>
        )}
      </div>
    </div>
  );
}
