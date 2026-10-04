"use client";

import React from "react";
import Link from "next/link";
import { LoginForm } from "@/components/customer/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="text-center">
      {/* Header Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500 shadow-xl shadow-amber-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </div>
      
      <h1 className="mb-2 text-3xl font-bold text-[#2D2318]">Chào mừng trở lại!</h1>
      <p className="mb-10 text-sm text-stone-400">Vui lòng đăng nhập để tiếp tục</p>

      {/* Form */}
      <LoginForm />

      {/* Chuyển sang Đăng ký */}
      <p className="mt-8 text-sm font-medium text-stone-500">
        Bạn chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-amber-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
