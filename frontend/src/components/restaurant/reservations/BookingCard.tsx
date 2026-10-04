"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Users, Check, X, MapPin, CreditCard } from "lucide-react";
import { BookingData, BookingStatus } from "./types";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: BookingData;
  onUpdateStatus: (id: number, newStatus: BookingStatus) => void;
  onAssignTable: (id: number) => void;
}

export function BookingCard({ booking, onUpdateStatus, onAssignTable }: BookingCardProps) {
  const router = useRouter();
  const isDone = booking.status === "COMPLETE" || booking.status === "CANCELLED";

  return (
    <div
      className={cn(
        "group flex cursor-grab flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-md active:cursor-grabbing lg:p-5",
        isDone && "opacity-60 grayscale-[0.5] hover:grayscale-0"
      )}
    >
      {/* Header Thẻ: Ảnh + Info */}
      <div className="flex items-start gap-3">
        <Image
          src={booking.customerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
          alt={booking.customerName}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-xl border border-stone-100 object-cover shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-brand-dark truncate pr-2 text-base font-bold">{booking.customerName}</h4>
          <div className="mt-1 flex items-center gap-2 text-xs font-bold text-stone-500">
            <span className="flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5">
              <Clock className="text-primary h-3 w-3" /> {booking.reservationTime}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5">
              <Users className="h-3 w-3 text-blue-500" /> {booking.guestCount}
            </span>
          </div>
        </div>
      </div>

      {/* Ghi chú & Bàn */}
      <div className="bg-app-bg rounded-xl border border-stone-100 px-3 py-2.5">
        <p className="mb-0.5 text-[10px] font-black tracking-widest text-stone-400 uppercase">
          Ghi chú của khách
        </p>
        <p
          className="line-clamp-2 text-xs leading-relaxed font-medium text-stone-600"
          title={booking.notes}
        >
          {booking.notes || "Không có ghi chú."}
        </p>
        {booking.assignedTableName && (
          <p className="mt-2 flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
            <MapPin className="h-3.5 w-3.5" /> Bàn xếp: {booking.assignedTableName}
          </p>
        )}
      </div>

      {/* Buttons Action */}
      {booking.status === "PENDING" && (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateStatus(booking.id, "CONFIRMED")}
            className="bg-brand-dark flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
          >
            <Check className="h-3.5 w-3.5" />
            Xác nhận
          </button>
          <button
            onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-2 text-xs font-bold text-stone-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
            Từ chối
          </button>
        </div>
      )}

      {(booking.status === "CONFIRMED" || booking.status === "CHECKED_IN") && (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAssignTable(booking.id)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-2 text-xs font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
          >
            <MapPin className="h-3.5 w-3.5" />
            Xếp bàn
          </button>
          <button
            onClick={() => router.push("/restaurant/pos")}
            className="bg-primary hover:bg-primary-hover flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Thanh toán POS
          </button>
        </div>
      )}
    </div>
  );
}
