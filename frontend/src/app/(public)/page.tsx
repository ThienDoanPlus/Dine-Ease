"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, CheckCircle, Clock, Gift, Loader2, ChevronLeft } from "lucide-react";
import { RestaurantCard } from "@/components/customer/shared/RestaurantCard";
import { usePublicRestaurants, usePublicCuisines } from "@/hooks/useCustomer"; 
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactPrice } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000"
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800"
];

export default function Homepage() {
  const router = useRouter();
  const [heroRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);
  const [emblaRef] = useEmblaCarousel({ dragFree: true });
  const [galleryRef] = useEmblaCarousel({ dragFree: true, loop: true });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dùng ID để lọc cho chính xác (undefined = Tất cả)
  const [activeCuisineId, setActiveCuisineId] = useState<number | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // GỌI API LẤY DANH MỤC ẨM THỰC THẬT TỪ DATABASE
  const { data: cuisines, isLoading: isLoadingCuisines } = usePublicCuisines();

  // GỌI API LẤY NHÀ HÀNG
  const pageSize = isExpanded ? 6 : 3; 
  const { data: responseData, isLoading, isError } = usePublicRestaurants(
    "", 
    0, 
    undefined, 
    activeCuisineId ? [activeCuisineId] : undefined, 
    undefined, 
    currentPage,
    pageSize
  );
  
  const restaurants = responseData?.content || [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full bg-[#faf9f6]">
      {/* HERO SECTION */}
      <section className="px-4 pb-16 pt-8 md:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative h-[550px] overflow-hidden rounded-2xl shadow-xl border border-stone-200/50">
            {/* HERO CAROUSEL BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing" ref={heroRef}>
              <div className="flex h-full">
                {HERO_IMAGES.map((src, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                    <Image src={src} fill className="object-cover pointer-events-none" priority={idx === 0} alt={`Hero ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* OVERLAY & CONTENT */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 pointer-events-none"></div>
            <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 md:px-20 md:pb-20 pointer-events-none">
              <h1 className="mb-6 max-w-3xl font-heading text-5xl font-bold leading-tight text-white md:text-7xl drop-shadow-lg">
                Hương vị truyền thống, <br />
                <span className="text-accent">trải nghiệm tinh tế</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg text-white/90 drop-shadow-md">Khám phá và đặt bàn tại những không gian ẩm thực đậm đà bản sắc Việt.</p>
              <div className="flex w-full max-w-3xl flex-col items-center gap-2 rounded-xl bg-white/95 p-2 shadow-2xl backdrop-blur-md md:flex-row pointer-events-auto">
                <div className="flex w-full flex-1 items-center gap-3 px-4 md:border-r md:border-stone-200">
                  <Search className="h-5 w-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm không gian, món ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full py-4 text-brand-dark outline-none bg-transparent"
                  />
                </div>
                <button onClick={handleSearch} className="w-full rounded-lg bg-primary px-10 py-4 font-bold tracking-wide text-white transition-all hover:bg-primary-hover md:w-auto uppercase text-sm">
                  Tìm bàn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATE SLIDER (DATA THẬT) */}
      <section className="border-y border-stone-200/60 bg-white py-6">
        <div className="relative mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center font-heading text-3xl font-bold text-brand-dark">Tinh hoa ẩm thực</h2>
          <p className="mb-4 text-center text-sm text-stone-500">Hành trình khám phá hương vị truyền thống qua từng danh mục</p>
          
          <div className="overflow-hidden cursor-grab active:cursor-grabbing py-2 pb-2 w-max max-w-full mx-auto" ref={emblaRef}>
            <div className="flex gap-3 px-4 flex-nowrap">
              <div onClick={() => { setActiveCuisineId(undefined); setCurrentPage(1); }} className={`group flex-[0_0_auto] flex items-center gap-3 px-6 py-4 rounded-full border transition-all select-none ${activeCuisineId === undefined ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105" : "border-stone-200 bg-stone-50 text-stone-600 hover:border-amber-300 hover:bg-amber-50"}`}>
                <span className="text-2xl">✨</span>
                <span className="font-bold whitespace-nowrap">Tất cả</span>
              </div>

              {isLoadingCuisines ? <Loader2 className="animate-spin text-primary mx-auto" /> : 
                cuisines?.map((cat) => (
                  <div key={cat.id} onClick={() => { setActiveCuisineId(cat.id); setCurrentPage(1); }} className={`group flex-[0_0_auto] flex items-center gap-3 px-6 py-4 rounded-full border transition-all select-none ${activeCuisineId === cat.id ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105" : "border-stone-200 bg-stone-50 text-stone-600 hover:border-amber-300 hover:bg-amber-50"}`}>
                    <span className="text-2xl">{cat.iconUrl || "🍴"}</span>
                    <span className="font-bold whitespace-nowrap">{cat.name}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </section>

      {/* GỢI Ý HÀNG ĐẦU */}
      <section className="bg-gradient-to-br from-brand-dark to-stone-900 py-16 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between border-b border-stone-700/60 pb-4">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white">Gợi ý từ Mâm Vị</h2>
          </div>
          
          <button 
            onClick={() => {
              setIsExpanded(!isExpanded);
              setCurrentPage(1);
            }} 
            className="flex items-center gap-2 font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            {isExpanded ? "Thu gọn" : "Xem tất cả"} <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </button>
        </div>

        <div className="grid min-h-[300px] grid-cols-1 gap-8 md:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="h-[350px] w-full rounded-3xl" />
              <Skeleton className="h-[350px] w-full rounded-3xl" />
              <Skeleton className="h-[350px] w-full rounded-3xl" />
            </>
          ) : isError ? (
            <div className="col-span-3 py-20 text-center text-red-500">Lỗi kết nối máy chủ.</div>
          ) : restaurants.length > 0 ? (
            restaurants.map(res => (
              <RestaurantCard 
                key={res.id} 
                id={res.id} 
                name={res.name} 
                cuisine={res.cuisineName || "Đa dạng ẩm thực"} 
                location={res.address.split(",").pop()?.trim()} 
                rating={res.avgRating} 
                priceLevel={res.avgPrice ? formatCompactPrice(res.avgPrice) : "Chưa có giá"} 
                imageUrl={res.imageMain || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"} 
                badgeText={res.avgRating >= 4.8 ? "Yêu thích nhất" : undefined}
              />
            ))
          ) : (
            <div className="col-span-3 py-20 text-center text-stone-400">Chưa có nhà hàng nào.</div>
          )}
        </div>

        {/* Phân trang */}
        {isExpanded && responseData && responseData.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-6">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-800 shadow-sm border border-stone-700 disabled:opacity-30 hover:bg-stone-700 text-white transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">Trang</span>
              <span className="text-xl font-black text-white">{currentPage}</span>
              <span className="text-xl font-medium text-stone-600">/</span>
              <span className="text-xl font-bold text-stone-500">{responseData.totalPages}</span>
            </div>
            <button 
              disabled={currentPage >= responseData.totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg disabled:opacity-30 hover:bg-amber-600 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        </div>
      </section>
      
      {/* HOW IT WORKS */}
      <section className="bg-[#fffdf9] px-4 py-20 border-b border-stone-200/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-14 text-center font-heading text-4xl font-bold text-brand-dark">Trải nghiệm hoàn hảo</h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3e0] text-primary shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md group-hover:bg-primary group-hover:text-white">
                <Search className="h-7 w-7" />
              </div>
              <h4 className="mb-3 text-lg font-bold text-brand-dark">Khám phá</h4>
              <p className="text-sm leading-relaxed text-stone-500">Tìm kiếm không gian ẩm thực phù hợp với sở thích của bạn.</p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3e0] text-primary shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md group-hover:bg-primary group-hover:text-white">
                <Clock className="h-7 w-7" />
              </div>
              <h4 className="mb-3 text-lg font-bold text-brand-dark">Đặt bàn</h4>
              <p className="text-sm leading-relaxed text-stone-500">Chủ động thời gian, nhận xác nhận nhanh chóng từ nhà hàng.</p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3e0] text-primary shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md group-hover:bg-primary group-hover:text-white">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h4 className="mb-3 text-lg font-bold text-brand-dark">Thưởng thức</h4>
              <p className="text-sm leading-relaxed text-stone-500">Trải nghiệm những hương vị tinh túy và dịch vụ đẳng cấp.</p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3e0] text-primary shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md group-hover:bg-primary group-hover:text-white">
                <Gift className="h-7 w-7" />
              </div>
              <h4 className="mb-3 text-lg font-bold text-brand-dark">Tri ân</h4>
              <p className="text-sm leading-relaxed text-stone-500">Tích lũy điểm thưởng và nhận các ưu đãi đặc quyền.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#faf9f6]">
        <div className="mx-auto max-w-7xl px-4 mb-8">
          <h2 className="text-center font-heading text-3xl font-bold text-brand-dark">Không gian nổi bật</h2>
        </div>
        <div className="overflow-hidden cursor-grab active:cursor-grabbing w-full max-w-7xl mx-auto" ref={galleryRef}>
          <div className="flex -ml-4">
            {GALLERY_IMAGES.map((src, index) => (
              <div key={index} className="flex-[0_0_85%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_35%]">
                <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg select-none">
                  <Image src={src} fill className="object-cover transition-transform duration-700 hover:scale-105 pointer-events-none" alt={`Không gian ${index + 1}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-2xl bg-brand-dark p-12 md:flex-row md:p-20 shadow-2xl">
          <div className="absolute inset-0 wave-bg"></div>
          <div className="absolute inset-0 wave-bg-2 mix-blend-screen"></div>
          <div className="relative z-10 md:w-1/2">
            <span className="mb-4 block text-sm font-bold tracking-widest text-accent uppercase">Đồng hành cùng chúng tôi</span>
            <h2 className="mb-6 font-heading text-4xl font-bold leading-tight text-white md:text-5xl">Nâng tầm giá trị <br />doanh nghiệp</h2>
            <p className="mb-10 text-lg text-stone-400 font-light leading-relaxed">Trở thành đối tác của Dine Ease để tiếp cận hàng ngàn thực khách, tối ưu hóa quy trình quản lý và khẳng định vị thế thương hiệu.</p>
            <Link href="/partner-register">
              <button className="rounded-lg bg-primary px-8 py-4 font-bold tracking-wide text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-hover uppercase text-sm">
                Đăng ký ngay
              </button>
            </Link>
          </div>
          <div className="relative md:w-1/2">
            <Image src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200" width={600} height={400} className="rounded-xl shadow-2xl transition-transform duration-700 hover:scale-105 border border-white/10" alt="Chef" />
          </div>
        </div>
      </section>
    </div>
  );
}
