// src/components/shared/ui/ProfileInfoCard.tsx
import React from "react";
import Image from "next/image";
import { Camera, LucideIcon } from "lucide-react";
import { InfoRow } from "./InfoRow";

export interface ProfileInfoRowData {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  valueClassName?: string;
}

interface ProfileInfoCardProps {
  name: string;
  avatarImage: string;
  coverImage?: string; // Nếu không có sẽ hiển thị gradient mặc định
  subTextNode?: React.ReactNode; // Phần hiển thị sao đánh giá, hoặc Cuisine/ID
  infoRows: ProfileInfoRowData[];

  // Các prop dành cho chế độ có thể chỉnh sửa (Trang Settings)
  isEditable?: boolean;
  onCoverClick?: () => void;
  onAvatarClick?: () => void;
}

export function ProfileInfoCard({
  name,
  avatarImage,
  coverImage,
  subTextNode,
  infoRows,
  isEditable = false,
  onCoverClick,
  onAvatarClick,
}: ProfileInfoCardProps) {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-stone-100 bg-white shadow-sm">
      {/* Cover Image Section */}
      <div className="group relative h-32 overflow-hidden bg-stone-200">
        {coverImage ? (
          <Image src={coverImage} alt="Cover" fill className="object-cover" />
        ) : (
          <div className="absolute relative inset-0 bg-gradient-to-r from-amber-400 to-orange-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==')] opacity-10"></div>
          </div>
        )}

        {isEditable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onCoverClick}
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/40"
            >
              <Camera className="h-4 w-4" /> Đổi ảnh bìa
            </button>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="relative px-6 pb-8 text-center">
        {/* Avatar Section */}
        <div className="group absolute -top-14 left-1/2 z-10 mx-auto block h-28 w-28 -translate-x-1/2 overflow-hidden rounded-full border-4 border-white bg-stone-100 shadow-xl">
          <Image src={avatarImage} alt={name} fill className="object-cover" />

          {isEditable && (
            <div
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={onAvatarClick}
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Title & SubText Section */}
        <div className="pt-20 text-center">
          <h2 className="text-brand-dark text-2xl leading-tight font-black tracking-tight">
            {name}
          </h2>

          {subTextNode && <div className="mt-2">{subTextNode}</div>}
        </div>

        {/* Info Rows Section */}
        {infoRows.length > 0 && (
          <div className="mt-5 space-y-4 border-t border-stone-50 px-2 pt-5 text-left">
            {infoRows.map((row, index) => (
              <InfoRow
                key={index}
                icon={row.icon}
                label={row.label}
                value={row.value}
                valueClassName={row.valueClassName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
