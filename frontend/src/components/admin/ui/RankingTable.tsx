import React from "react";
import { cn } from "@/lib/utils";

interface Column {
  label: string;
  className?: string;
}

interface RankingTableProps<T> {
  title: string;
  action?: React.ReactNode; // Có thể là Link "Xem tất cả" hoặc StatusBadge
  columns: Column[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function RankingTable<T>({ title, action, columns, data, renderRow }: RankingTableProps<T>) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-4xl border border-white/40 bg-white/80 shadow-sm backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 p-6">
        <h2 className="text-brand-dark text-sm font-bold tracking-wide uppercase">{title}</h2>
        {action && <div>{action}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/80 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-6 py-4", col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
