"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchValue?: string;
  
  // ==========================================
  // [BỔ SUNG PROPS CHO SERVER-SIDE PAGINATION]
  // ==========================================
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualPagination?: boolean;
  totalElements?: number; // Tổng số bản ghi thực tế trong DB
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchValue = "",
  pageCount,
  pagination,
  onPaginationChange,
  manualPagination = false,
  totalElements,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(searchValue);

  // State nội bộ dành cho các trang Client-Side cũ
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Nếu cha có truyền State xuống thì dùng của cha (Server-side), nếu không thì dùng nội bộ (Client-side)
  const actualPagination = pagination ?? internalPagination;
  const actualOnPaginationChange = onPaginationChange ?? setInternalPagination;

  // Sync state từ prop truyền vào xuống table
  React.useEffect(() => {
    setGlobalFilter(searchValue);
  }, [searchValue]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount, // Truyền tổng số trang từ Backend xuống
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    
    // BẬT CHẾ ĐỘ MANUAL
    manualPagination: manualPagination, 
    
    state: {
      sorting,
      globalFilter,
      pagination: actualPagination, // Kết nối State
    },
    onPaginationChange: actualOnPaginationChange, // Lắng nghe sự kiện Next/Prev
  });

  // Tính toán số hiển thị ở góc trái dưới
  const currentTotal = totalElements ?? table.getFilteredRowModel().rows.length;
  const currentCount = manualPagination ? data.length : table.getRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden overflow-x-auto rounded-4xl border border-stone-100 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-[#2D2318]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-0">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-8 py-5 text-[11px] font-bold tracking-widest whitespace-nowrap text-white uppercase"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-stone-50/80">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group transition-colors hover:bg-amber-50/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-8 py-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center font-medium text-stone-400"
                >
                  Không tìm thấy dữ liệu phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm font-medium text-stone-500">
          Hiển thị <span className="text-brand-dark font-bold">{currentCount}</span> của{" "}
          <span className="text-brand-dark font-bold">{currentTotal}</span> kết quả
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="hover:text-brand-dark rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-500 shadow-sm transition-all disabled:opacity-50 disabled:hover:text-stone-500"
          >
            Trước
          </button>
          <div className="mx-1 flex items-center gap-1 text-sm font-bold text-stone-500">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="disabled:bg-brand-dark bg-brand-dark hover:bg-brand-dark-hover rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
