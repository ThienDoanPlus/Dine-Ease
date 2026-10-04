"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { RegisterForm } from "@/components/customer/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/login" className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-50 hover:text-amber-500">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-bold text-[#2D2318]">Đăng ký thành viên</h2>
      </div>

      {/* Form */}
      <RegisterForm />
    </>
  );
}
