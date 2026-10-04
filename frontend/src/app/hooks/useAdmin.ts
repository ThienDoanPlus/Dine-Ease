// src/hooks/useAdmin.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/services/api";

// Hook lấy chi tiết nhà hàng
export const useAdminRestaurantDetail = (id: number) => {
  return useQuery({
    queryKey: ["admin-restaurant-detail", id],
    queryFn: async () => {
      // Đảm bảo endpoint này khớp với Backend Spring Boot của bạn
      const response = await api.get(`/admin/restaurants/${id}`);
      return response.data; // Hoặc tuỳ theo format trả về của BE
    },
    enabled: !!id, // Chỉ chạy khi có id
  });
};

// Hook cập nhật trạng thái nhà hàng
export const useUpdateRestaurantStatus = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { status: "APPROVED" | "REJECTED" } }) => {
      // Đảm bảo endpoint này khớp với Backend
      const response = await api.patch(`/admin/restaurants/${id}/status`, data);
      return response.data;
    },
  });
};
