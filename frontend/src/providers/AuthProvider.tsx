"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/services/api";
import { User } from "@/types/customer"; // <-- [SỬA]: Import từ Type chung

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isMounted: boolean;
  loginContext: (token: string, refreshToken: string, userData: User) => void;
  logoutContext: () => Promise<void>;
  updateUserContext: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse user từ localStorage");
      }
    }
    setIsMounted(true);
    setIsLoading(false); // Render mượt hơn
  }, []);

  const loginContext = (token: string, refreshToken: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    const cookieOptions = { 
      expires: 1, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax" as const 
    };
    
    Cookies.set("accessToken", token, cookieOptions);
    Cookies.set("userRoles", userData.roles.join(","), cookieOptions); 
    
    setUser(userData);
  };

  const logoutContext = async () => {
    try {
      await api.post("/auth/logout"); 
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      Cookies.remove("accessToken");
      Cookies.remove("userRoles");
      
      setUser(null);
      router.push("/login");
    }
  };

  const updateUserContext = (userData: User) => {
    // 1. Cập nhật State để UI đổi ngay lập tức
    setUser(userData);
    // 2. Cập nhật localStorage để F5 không bị mất
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isMounted, isLoading, loginContext, logoutContext, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext phải được sử dụng trong AuthProvider");
  }
  return context;
}
