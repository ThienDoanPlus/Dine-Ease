"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

interface PublicFooterProps {
  variant?: "full" | "mini";
}

export function PublicFooter({ variant = "full" }: PublicFooterProps) {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (variant === "mini") {
    return (
      <footer className="mt-auto border-t border-stone-800 bg-brand-dark py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-bold tracking-widest text-stone-500 uppercase">
            © 2026 Dine Ease • Trải nghiệm ẩm thực hoàn hảo
          </p>
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="mt-auto border-t border-stone-800 bg-brand-dark px-4 pb-10 pt-20">
        <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4">
          <div>
            <h5 className="mb-6 font-bold text-white">Khám phá</h5>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><Link href="#" className="transition-colors hover:text-primary">Đánh giá tốt nhất</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Ưu đãi nổi bật</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Danh mục ẩm thực</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">Về chúng tôi</h5>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><Link href="#" className="transition-colors hover:text-primary">Dine Ease là gì?</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Tuyển dụng</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">Đối tác</h5>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><Link href="/partner-register" className="transition-colors hover:text-primary">Đăng ký Nhà hàng</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Trang Quản trị</Link></li>
              <li><Link href="#" className="transition-colors hover:text-primary">Dành cho Developer</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">Tải ứng dụng</h5>
            <div className="space-y-3">
              {/* App Store Button Mock */}
              <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-black p-3 text-white transition-colors hover:bg-stone-900">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.04 1.72-3.32 1.72-1.25 0-1.63-.78-3.14-.78-1.53 0-1.95.76-3.15.78-1.23.02-2.35-.78-3.35-1.74C2.01 18.23.5 14.5.5 10.93c0-3.66 2.37-5.59 4.67-5.59 1.2 0 2.34.82 3.08.82.73 0 2.05-.98 3.48-.98 1.5 0 2.8.54 3.65 1.57-3.04 1.83-2.54 6.2 1.15 7.7-.7 1.88-1.6 3.75-2.98 5.75zM12.02 4.14c-.02-2.13 1.74-3.9 3.84-4.14.24 2.48-2.22 4.45-3.84 4.14z"/></svg>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">Download on the</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </div>
              {/* Google Play Button Mock */}
              <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-black p-3 text-white transition-colors hover:bg-stone-900">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.41-.814V2.628c0-.31.144-.601.409-.814zm1.533-.76l10.288 6.002 2.106 1.229-12.394-7.231zm0 21.893l12.394-7.231-2.106 1.229-10.288 6.002zM16.48 8.082l2.364 1.378 2.222 1.296c.65.379.65 1.514 0 1.892l-2.222 1.296-2.364 1.378-2.021-1.179L12.441 12l2.018-2.739 2.021-1.179z"/></svg>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">Get it on</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-stone-800 pt-10 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Dine <span className="text-primary">Ease</span></span>
          </div>
          <p className="text-sm text-stone-500">© 2026 Dine Ease. All rights reserved.</p>
        </div>
      </div>
    </footer>

    {/* Scroll to Top Button */}
    {showTopBtn && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-24 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition-transform hover:scale-110 animate-in zoom-in duration-300"
        aria-label="Lên đầu trang"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    )}
    </>
  );
}
