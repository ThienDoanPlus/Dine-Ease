import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// --- QUẢN LÝ DANH MỤC (CATEGORIES) ---
export const useGetCategories = () => {
  return useQuery({
    queryKey: ["restaurant-categories"],
    queryFn: async () => {
      if (isMock) return [{ id: 1, name: "Món chính (Mock)" }, { id: 2, name: "Khai vị (Mock)" }];
      return await api.get("/manage/categories");
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (isMock) return { id: Date.now(), name };
      return await api.post("/manage/categories", { name });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-categories"] }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      if (!isMock) await api.delete(`/manage/categories/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-categories"] }),
  });
};

// --- QUẢN LÝ MÓN ĂN (ITEMS) ---
export const useGetMenuItems = () => {
  return useQuery({
    queryKey: ["restaurant-menu-items"],
    queryFn: async () => {
      if (isMock) return []; 
      return await api.get("/manage/menu-items");
    },
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, imageFiles }: { data: any, imageFiles: File[] }) => {
      const formData = new FormData();
      
      // 1. Ép kiểu JSON thành Blob để Spring Boot hiểu đây là @RequestPart("data")
      formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      
      // 2. Append nhiều ảnh (Chỉ append nếu mảng có file để tránh lỗi)
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append("images", file);
        });
      }

      // QUAN TRỌNG: Ghi đè để Axios không lấy Content-Type mặc định là application/json
      // Interceptor trong api.ts sẽ tự động xóa header này để trình duyệt tự tính Boundary
      return await api.post("/manage/menu-items", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-menu-items"] }),
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, imageFiles }: { id: number; data: any; imageFiles: File[] }) => {
      const formData = new FormData();
      
      formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formData.append("images", file);
        });
      }

      // QUAN TRỌNG: Ghi đè Header
      return await api.put(`/manage/menu-items/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-menu-items"] }),
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!isMock) await api.delete(`/manage/menu-items/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-menu-items"] }),
  });
};

// Hook cập nhật nhanh trạng thái (Hết hàng/Đang bán)
export const useUpdateMenuItemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "AVAILABLE" | "SOLD_OUT" }) => {
      return await api.patch(`/manage/menu-items/${id}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-menu-items"] }),
  });
};

