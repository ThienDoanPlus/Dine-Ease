"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react"; // Đổi Phone thành Mail
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm() {
  // Sửa state phone thành email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending: isLoading } = useLogin();

  // Validate: Kiểm tra có chữ @ và password >= 6
  const isValid = email.includes("@") && password.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    // Gọi thẳng API với email và password
    login({ email, password }); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div>
        <label className="mb-2 ml-1 block text-sm font-bold text-stone-500">Email đăng nhập</label>
        <div className="relative">
          <Input
            type="email"
            placeholder="Nhập địa chỉ email"
            variant="customer"
            size="customer-icon"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Đổi icon thành Mail */}
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
        </div>
      </div>

      <div>
        <div className="mb-2 ml-1 flex items-center justify-between">
          <label className="block text-sm font-bold text-stone-500">Mật khẩu</label>
          <button type="button" className="text-xs font-bold text-amber-600 hover:underline">
            Quên mật khẩu?
          </button>
        </div>
        <div className="relative">
          <Input
            type="password"
            placeholder="Nhập mật khẩu"
            variant="customer"
            size="customer-icon"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
        </div>
      </div>

      <Button
        type="submit"
        variant="customer"
        size="customer"
        className="mt-4 w-full"
        disabled={!isValid || isLoading}
      >
        {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}
      </Button>
    </form>
  );
}
