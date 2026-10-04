import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthContext } from "@/providers/AuthProvider";

interface LoginRequest {
  email: string;
  password: string;
}

// Khớp chính xác với Backend AuthResponse.java
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    roles: ("ADMIN" | "RESTAURANT" | "CUSTOMER")[];
    status: string;
  };
}

// CỦA ĐOAN: Tích hợp Mock Login nhưng trả về cấu trúc của BẠN
const mockLoginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.email === "manager@restaurant.com") {
        resolve({
          accessToken: "mock_jwt_token_restaurant_111",
          refreshToken: "mock_refresh_token_111",
          tokenType: "Bearer",
          expiresInSeconds: 86400,
          user: { id: 2, email: "manager@restaurant.com", fullName: "Quản lý Nhà hàng A", phone: "0901234567", roles: ["RESTAURANT"], status: "ACTIVE" },
        });
      }
      else if (data.email === "admin@dineease.com") {
        resolve({
          accessToken: "mock_jwt_token_admin_999",
          refreshToken: "mock_refresh_token_999",
          tokenType: "Bearer",
          expiresInSeconds: 86400,
          user: { id: 1, email: "admin@dineease.com", fullName: "Super Admin", phone: "0999999999", roles: ["ADMIN"], status: "ACTIVE" },
        });
      } else {
        reject({ response: { status: 401 } });
      }
    }, 1000);
  });
};

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginContext } = useAuthContext();
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      if (isMock) {
        console.warn("⚠️ ĐANG DÙNG MOCK API CHO LOGIN");
        return mockLoginApi(data);
      }
      const response: AuthResponse = await api.post("/auth/login", data);
      return response;
    },
    onSuccess: (data) => {
      loginContext(data.accessToken, data.refreshToken, data.user as any);
      toast.success(`Chào mừng trở lại, ${data.user.fullName}!`);

      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        // CỦA BẠN: Kiểm tra mảng roles.includes()
        if (data.user.roles.includes("ADMIN")) router.push("/admin");
        else if (data.user.roles.includes("RESTAURANT")) router.push("/restaurant");
        else router.push("/");
      }
    },
    onError: (error: any) => {
      // 1. Lấy tin nhắn báo lỗi chi tiết từ Backend (Spring Boot) trả về
      const backendMessage = error.response?.data?.message;

      if (error.response?.status === 401) {
        // Nếu sai pass thì báo sai pass
        toast.error(backendMessage || "Email hoặc mật khẩu không chính xác.");
      } 
      else if (error.response?.status === 403) {
        // 2. NẾU BỊ KHÓA (403), IN RA ĐÚNG LÝ DO BỊ KHÓA (Ví dụ: Trạng thái: INACTIVE)
        toast.error(backendMessage || "Tài khoản của bạn đã bị khóa.");
      } 
      else {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    },
  });
};

// Thêm hook này vào cuối file useAuth.ts
export const useRegisterPartner = () => {
  return useMutation({
    mutationFn: async ({ data, imageFile, licenseFile, idCardFile }: { data: any; imageFile: File | null; licenseFile: File | null; idCardFile: File | null }) => {
      const formData = new FormData();
      // Chuyển JSON thành Blob chuẩn Spring Boot
      formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      
      if (imageFile) formData.append("image", imageFile);
      if (licenseFile) formData.append("license", licenseFile);
      if (idCardFile) formData.append("idCard", idCardFile);

      // API này ở luồng Public, không cần token
      const response = await api.post("/auth/partner-register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    },
  });
};

export const useGetPartnerDraft = () => {
  return useMutation({
    mutationFn: async ({ email, phone }: { email: string; phone: string }) => {
      const response = await api.get(`/auth/partner-register/draft?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
      return response; // Trả về nội dung JSON
    },
  });
};
