"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { MapPin, Clock, Star, Phone } from "lucide-react";
import { MenuSection } from "@/components/customer/restaurant/MenuSection";
import { BookingModal } from "@/components/customer/restaurant/BookingModal";
import { StarRating } from "@/components/customer/shared/StarRating";
import { usePublicRestaurantDetail, useGetRestaurantReviews, useRestaurantMenu } from "@/hooks/useCustomer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatCurrency } from "@/lib/utils";

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = Number(params.id);

  const [activeTab, setActiveTab] = useState<"about" | "menu" | "review">("about");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // GỌI API LẤY CHI TIẾT NHÀ HÀNG
  const { data: restaurant, isLoading, isError } = usePublicRestaurantDetail(restaurantId);

  // 2. GỌI API LẤY REVIEW
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetRestaurantReviews(restaurantId);
  const reviews: any[] = (reviewsData as any) || [];

  // 3. GỌI API LẤY MENU ĐỂ HIỂN THỊ THỰC ĐƠN GỢI Ý
  const { data: menuCategories } = useRestaurantMenu(restaurantId);
  // Lấy ra ngẫu nhiên 3-4 món ăn từ tất cả các danh mục làm gợi ý
  let featuredMenuItems = menuCategories 
    ? menuCategories.flatMap(cat => cat.items || []).slice(0, 3) 
    : [];

  if (isLoading) {
    return (
      <div className="w-full bg-stone-50 pb-32 pt-10">
        <div className="mx-auto max-w-7xl px-4 space-y-6">
          <Skeleton className="h-16 w-3/4 rounded-2xl" />
          <Skeleton className="h-8 w-1/2 rounded-xl" />
          <Skeleton className="h-[500px] w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-xl font-bold text-stone-500">
        Không tìm thấy thông tin nhà hàng.
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-50 pb-32 pt-8">
      <div className="mx-auto max-w-7xl px-4">
        
        {/* Header Info */}
        <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:justify-between">
          <div>
            <h1 className="mb-4 text-4xl font-extrabold text-[#2D2318]">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-stone-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium leading-relaxed">{restaurant.address || "Chưa cập nhật địa chỉ"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium">{restaurant.phoneContact || "Chưa cập nhật SĐT"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium">{restaurant.operatingHours || "09:00 - 22:30 (T2-CN)"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500 shrink-0" />
                  <span className="font-bold text-stone-800">{restaurant.avgRating || "Mới"}</span>
                  <span className="text-sm">(Đánh giá)</span>
                </div>
              </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="no-scrollbar sticky top-20 z-40 mb-8 flex items-center gap-8 overflow-x-auto border border-stone-200 bg-white px-6 rounded-2xl shadow-sm">
          {[
            { id: "about", label: "Tổng quan" },
            { id: "menu", label: "Thực đơn" },
            { id: "review", label: "Đánh giá" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 px-2 py-4 font-bold transition-all ${activeTab === tab.id ? "border-amber-500 text-amber-600" : "border-transparent text-stone-400 hover:text-amber-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* ABOUT TAB */}
          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <section className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột trái (Nội dung) */}
                <div className="md:col-span-2 space-y-10">
                  {/* Những điều cần biết */}
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-brand-dark border-b border-stone-200 pb-3">Những điều cần biết</h3>
                    <p className="text-stone-600 leading-relaxed">
                      Chỉ giữ bàn trong 15 phút, nếu không đặt chỗ sẽ bị hủy. Thời gian dùng bữa là 90 phút. 
                      Đối với nhóm từ 13 người trở lên, vui lòng liên hệ nhà hàng để biết thêm chi tiết. 
                      Chúng tôi sẽ liên hệ lại để xác nhận đặt chỗ từ 16:00.
                    </p>
                  </div>
                  
                  {/* Giới thiệu */}
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-brand-dark border-b border-stone-200 pb-3">Giới thiệu về {restaurant.name}</h3>
                    <p className="leading-relaxed text-stone-600 whitespace-pre-wrap">
                      {restaurant.description || "Nhà hàng chưa cập nhật bài giới thiệu chi tiết. Vui lòng liên hệ trực tiếp để biết thêm thông tin."}
                    </p>
                  </div>

                  {/* Thực đơn gợi ý (Featured Menu) */}
                  {featuredMenuItems.length > 0 && (
                    <div className="pt-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-6">
                        <h3 className="text-xl font-bold text-brand-dark">Thực đơn gợi ý</h3>
                        <button 
                          onClick={() => setActiveTab("menu")} 
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          Xem tất cả
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {featuredMenuItems.map(item => (
                          <div key={item.id} className="group relative rounded-2xl border border-stone-100 bg-white p-3 shadow-sm hover:shadow-md transition-all">
                            <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-stone-100">
                              <Image 
                                src={item.imageUrls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} 
                                alt={item.name} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                              />
                            </div>
                            <h4 className="font-bold text-sm text-[#2D2318] line-clamp-1" title={item.name}>{item.name}</h4>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-black text-amber-600 text-sm">{formatCurrency(item.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột phải (Ảnh + Bản đồ) */}
                <div className="md:col-span-1 space-y-6">
                  {/* Ảnh chính */}
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md border border-stone-100">
                    <Image 
                      src={restaurant.imageMain || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"} 
                      fill 
                      className="object-cover transition-transform duration-700 hover:scale-105" 
                      alt={restaurant.name} 
                      priority 
                    />
                  </div>

                  {/* Thẻ Google Map & Thông tin liên hệ */}
                  <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
                    {/* Google Maps Iframe */}
                    <div className="h-48 w-full bg-stone-100 relative">
                      <iframe 
                        src={`https://www.google.com/maps?q=${encodeURIComponent(restaurant.address || "Hồ Chí Minh")}&output=embed`}
                        className="absolute inset-0 w-full h-full border-0" 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    {/* Contact Info */}
                    <div className="p-5">
                      <h4 className="font-bold text-brand-dark mb-2 text-lg leading-tight">{restaurant.name}</h4>
                      <p className="text-sm text-stone-500 mb-5 leading-relaxed">{restaurant.address || "Chưa cập nhật địa chỉ"}</p>
                      
                      <div className="space-y-4 border-t border-stone-100 pt-4">
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address || "Hồ Chí Minh")}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-3 text-sm text-blue-600 font-semibold hover:underline"
                        >
                          <MapPin className="h-4 w-4 shrink-0" />
                          Chỉ đường
                        </a>
                        <a 
                          href={`tel:${restaurant.phoneContact}`} 
                          className="flex items-center gap-3 text-sm text-blue-600 font-semibold hover:underline"
                        >
                          <Phone className="h-4 w-4 shrink-0" />
                          {restaurant.phoneContact || "Chưa cập nhật SĐT"}
                        </a>
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="flex items-center gap-3 text-sm text-blue-600 font-semibold hover:underline"
                        >
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          https://dineease.com/r/{restaurant.id}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* MENU TAB - TRUYỀN ID VÀO COMPONENT VỪA SỬA */}
          {activeTab === "menu" && <MenuSection restaurantId={restaurantId} />}

          {/* REVIEW TAB - ĐÃ RÁP API */}
          {activeTab === "review" && (
            <section className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
              <h3 className="mb-6 border-l-4 border-amber-500 pl-4 text-2xl font-black text-[#2D2318]">
                Đánh giá từ khách hàng ({reviews?.length || 0})
              </h3>
              
              {isLoadingReviews ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={rev.customerAvatar || `https://ui-avatars.com/api/?name=${rev.customerName}&background=F59E0B&color=fff`} 
                            alt={rev.customerName} 
                            className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-stone-50"
                          />
                          <div>
                            <h4 className="font-bold text-stone-800">{rev.customerName}</h4>
                            <p className="text-xs font-medium text-stone-400">{formatDateTime(rev.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                          <span className="text-sm font-bold text-amber-600">{rev.rating}</span>
                          <StarRating rating={rev.rating} maxStars={5} size="sm" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium leading-relaxed text-stone-600">
                        {rev.comment}
                      </p>
                      {/* Phản hồi từ nhà hàng (nếu có) */}
                      {rev.replyFromRestaurant && (
                        <div className="mt-4 rounded-2xl border-l-4 border-emerald-400 bg-emerald-50 p-4">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Phản hồi từ nhà hàng:</p>
                          <p className="text-sm text-stone-600">{rev.replyFromRestaurant}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="py-20 text-center text-stone-500">
                    Nhà hàng này chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm nhé!
                 </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Sticky Bottom Booking Button */}
      <div className="glass-nav fixed bottom-0 left-0 right-0 z-40 flex justify-center border-t border-stone-200/50 p-6">
        <button onClick={() => setIsBookingOpen(true)} className="w-full max-w-lg rounded-2xl bg-amber-500 py-4 text-lg font-black text-white shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 hover:bg-amber-600 active:scale-95">
          Đặt bàn ngay
        </button>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        restaurantId={restaurant.id} 
        restaurantName={restaurant.name} 
        // TRUYỀN DỮ LIỆU ĐỂ BẮT ĐẦU LUỒNG CHECKOUT
        depositAmount={100000} // Mặc định 100k, sau này có thể thêm trường "deposit" vào Entity Restaurant
      />
      
    </div>
  );
}
