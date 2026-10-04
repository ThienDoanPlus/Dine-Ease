"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search as SearchIcon, SearchX } from "lucide-react";
import { FilterSidebar, FilterState } from "@/components/customer/search/FilterSidebar";
import { AmenitiesBar } from "@/components/customer/search/AmenitiesBar";
import { RestaurantCard } from "@/components/customer/shared/RestaurantCard";
import { usePublicRestaurants } from "@/hooks/useCustomer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactPrice } from "@/lib/utils"; 

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // 1. Cập nhật state mặc định (priceMax: 5000)
  const initialFilters: FilterState = { minRating: 0, priceMax: 5000, cuisines: [], amenities: [] };
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const [currentPage, setCurrentPage] = useState(1); 

  // State "Chốt" (Chỉ thay đổi khi bấm nút Áp dụng/Tìm kiếm để gọi API)
  const [params, setParams] = useState({
    keyword: "",
    minRating: 0,
    maxPrice: undefined as number | undefined, // SỬA LẠI KIỂU DỮ LIỆU ĐỂ HỖ TRỢ UNDEFINED
    cuisineIds: [] as number[],
    amenityIds: [] as number[]
  });

  // GỌI API QUA HOOK
  const { data: responseData, isLoading, isError } = usePublicRestaurants(
    params.keyword,
    params.minRating,
    params.maxPrice,
    params.cuisineIds,
    params.amenityIds,
    currentPage,
    12  // Lấy 12 nhà hàng mỗi trang cho đẹp lưới 3 cột
  );

  const restaurantsFromAPI = responseData?.content || [];

  const handleApply = (customFilters?: FilterState | React.MouseEvent | React.KeyboardEvent) => {
    // Kiểm tra xem customFilters có phải là object FilterState hợp lệ (có thuộc tính cuisines) hay không.
    // Nếu nó là Event object thì bỏ qua và dùng filters state.
    const isValidFilterState = customFilters && typeof customFilters === 'object' && 'cuisines' in customFilters;
    const activeFilters = isValidFilterState ? (customFilters as FilterState) : filters;
    
    setCurrentPage(1); 
    setParams({
      keyword: searchQuery,
      minRating: activeFilters.minRating,
      maxPrice: activeFilters.priceMax >= 5000 ? undefined : activeFilters.priceMax * 1000, 
      cuisineIds: activeFilters.cuisines.map(id => Number(id)), 
      amenityIds: activeFilters.amenities.map(id => Number(id)),
    });
  };

  const toggleAmenity = (id: string) => {
    const newList = filters.amenities.includes(id)
      ? filters.amenities.filter((a) => a !== id)
      : [...filters.amenities, id];

    const newFilters = { ...filters, amenities: newList };
    
    // 1. Cập nhật UI
    setFilters(newFilters);
    
    // 2. Gọi hàm apply với dữ liệu mới nhất (Tránh delay do state async)
    handleApply(newFilters); 
  };

  const clearAmenities = () => {
    const newFilters = { ...filters, amenities: [] };
    setFilters(newFilters);
    handleApply(newFilters);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters(initialFilters);
    setCurrentPage(1);
    setParams({
      keyword: "",
      minRating: 0,
      maxPrice: undefined, // Xóa bộ lọc giá
      cuisineIds: [],
      amenityIds: []
    });
  };

  return (
    <div className="w-full bg-stone-50 pb-20">
      <header className="px-4 pb-10 pt-24 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-8 h-48 overflow-hidden rounded-[2.5rem] shadow-lg md:h-64">
            <Image 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1500" 
              fill 
              className="object-cover" 
              alt="Dine-Ease Search Banner" 
              priority 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[#2D2318]/60 px-4 backdrop-blur-[2px]">
              <div className="flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-stone-100 bg-white p-2 shadow-2xl">
                <div className="flex flex-1 items-center gap-3 px-4">
                  <SearchIcon className="h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                    placeholder="Tìm tên nhà hàng, khu vực, món ăn..."
                    className="w-full py-3 font-medium text-stone-800 outline-none"
                  />
                </div>
                <button 
                  onClick={() => handleApply()} 
                  className="rounded-xl bg-amber-500 p-3 text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 active:scale-95"
                >
                  <SearchIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-1/4">
          <FilterSidebar filters={filters} setFilters={setFilters} onApply={handleApply} onReset={handleReset} />
        </aside>

        <section className="flex-1 w-full min-w-0 min-h-[600px]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#2D2318]">Kết quả tìm kiếm</h2>
              {params.keyword && (
                <p className="text-stone-400 text-sm mt-1">{`Từ khóa: "${params.keyword}"`}</p>
              )}
            </div>
            <span className="text-sm font-medium text-stone-400 md:text-base">
              Tìm thấy {responseData?.totalElements || 0} nhà hàng
            </span>
          </div>

          <AmenitiesBar 
            selectedIds={filters.amenities}
            onToggle={toggleAmenity}
            onClear={clearAmenities}
          />

          {isLoading ? (
             <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <Skeleton key={i} className="h-[350px] rounded-[2rem]" />
               ))}
             </div>
          ) : isError ? (
             <div className="py-20 text-center text-red-500 bg-red-50 rounded-[2rem] border border-red-100">
                <p className="font-bold">Lỗi kết nối máy chủ.</p>
                <button onClick={() => handleApply()} className="mt-4 text-sm underline">Thử lại</button>
             </div>
          ) : restaurantsFromAPI.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {restaurantsFromAPI.map((res) => (
                <RestaurantCard
                  key={res.id}
                  id={res.id}
                  name={res.name}
                  cuisine={res.cuisineName || "Đa dạng món ăn"}
                  location={res.address.split(",").pop()?.trim() || "Việt Nam"}
                  rating={res.avgRating}
                  priceLevel={res.avgPrice ? formatCompactPrice(res.avgPrice) : "Chưa có giá"}
                  imageUrl={res.imageMain || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"}
                  badgeText={res.avgRating >= 4.8 ? "Yêu thích nhất" : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center rounded-[3rem] border border-dashed border-stone-200 bg-white py-32 text-center shadow-sm">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-stone-50 text-stone-200">
                <SearchX className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-800">Không tìm thấy nhà hàng nào</h3>
              <p className="mx-auto max-w-sm px-6 text-stone-500">
                Rất tiếc, các tiêu chí bạn chọn không khớp với bất kỳ quán nào. Thử thay đổi bộ lọc nhé!
              </p>
              <button onClick={() => handleReset()} className="mt-8 rounded-xl bg-stone-800 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-black">
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* Phân trang */}
          {!isLoading && responseData && responseData.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <button 
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-stone-100 disabled:opacity-30 hover:bg-stone-50 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Trang</span>
                <span className="text-xl font-black text-[#2D2318]">{currentPage}</span>
                <span className="text-xl font-medium text-stone-300">/</span>
                <span className="text-xl font-bold text-stone-400">{responseData.totalPages}</span>
              </div>
              <button 
                disabled={currentPage >= (responseData.totalPages || 0)}
                onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D2318] text-white shadow-lg disabled:opacity-30 hover:bg-black transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
