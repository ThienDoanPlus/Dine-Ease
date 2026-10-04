// src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ===================== DASHBOARD =====================
export const useAdminDashboard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["admin-dashboard", startDate, endDate],
    queryFn: async (): Promise<any> => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const response = await api.get(`/admin/reports/dashboard?${params.toString()}`);
      return response;
    },
  });
};

// ===================== CUISINES =====================
export const useAdminCuisines = () => {
  return useQuery({
    queryKey: ["admin-cuisines"],
    queryFn: async (): Promise<any> => {
      const response = await api.get("/admin/cuisines");
      return response;
    },
  });
};

export const useCreateCuisine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cuisine: { name: string; iconUrl: string }): Promise<any> => {
      const response = await api.post("/admin/cuisines", cuisine);
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cuisines"] }),
  });
};

export const useDeleteCuisine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string): Promise<any> => {
      await api.delete(`/admin/cuisines/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cuisines"] }),
  });
};

export const useUpdateCuisine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; iconUrl: string } }): Promise<any> => {
      const response = await api.put(`/admin/cuisines/${id}`, data);
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cuisines"] }),
  });
};

// ===================== NOTIFICATIONS =====================
export const useAdminNotifications = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["admin-notifications", page, size],
    queryFn: async (): Promise<any> => {
      const response = await api.get(`/admin/notifications?page=${page}&size=${size}`);
      return response;
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any): Promise<any> => {
      const response = await api.post("/admin/notifications", payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    },
  });
};

export const useCancelNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<any> => {
      const response = await api.patch(`/admin/notifications/${id}/cancel`);
      return response;
    },
    onSuccess: () => {
      // Refresh lại bảng lịch sử sau khi hủy
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};

// ===================== RESTAURANTS & PARTNERS =====================
export const useAdminRestaurants = (keyword = "", status?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ["admin-restaurants", keyword, status, page, size],
    queryFn: async (): Promise<any> => {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (keyword) params.append("keyword", keyword);
      if (status && status !== "Tất cả") params.append("status", status);

      const response = await api.get(`/admin/restaurants?${params.toString()}`);
      return response;
    },
  });
};

export const useUpdateRestaurantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: { status: string; commissionRate?: number };
    }): Promise<any> => {
      const response = await api.patch(`/admin/restaurants/${id}/status`, data);
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] }),
  });
};

export const useRequestRestaurantUpdate = () => {
  return useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }): Promise<any> => {
      return await api.patch(`/admin/restaurants/${id}/request-update`, { message });
    }
  });
};

export const useUpdateRestaurantProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
      imageFile,
    }: {
      id: string | number;
      data: any;
      imageFile: File | null;
    }): Promise<any> => {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      if (imageFile) {
        formData.append("image", imageFile);
      }
      return await api.put(`/admin/restaurants/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-restaurant-detail", variables.id] });
    },
  });
};

export const useAdminRestaurantDetail = (id: number) => {
  return useQuery({
    queryKey: ["admin-restaurant-detail", id],
    queryFn: async (): Promise<any> => {
      const response = await api.get(`/admin/restaurants/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// ===================== USERS MANAGEMENT =====================
export const useAdminUsers = (keyword = "", page = 0, size = 10) => {
  return useQuery({
    // Đưa keyword, page, size vào queryKey để React Query tự gọi lại API khi giá trị thay đổi
    queryKey: ["admin-users", keyword, page, size],
    queryFn: async (): Promise<any> => {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (keyword) params.append("keyword", keyword);

      const response = await api.get(`/admin/users?${params.toString()}`);
      return response;
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "ACTIVE" | "BANNED" }): Promise<any> => {
      const response = await api.patch(`/admin/users/${id}/status`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// ===================== SETTINGS & AUDIT LOGS =====================
export const useGetCommission = () => {
  return useQuery({
    queryKey: ["admin-commission"],
    queryFn: async (): Promise<any> => {
      const response = await api.get("/admin/settings/commission");
      return response;
    },
  });
};

export const useGetAuditLogs = (startDate?: string, endDate?: string, page = 0, size = 20) => {
  return useQuery({
    queryKey: ["admin-audit-logs", startDate, endDate, page, size],
    queryFn: async (): Promise<any> => {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(`/admin/settings/audit-logs?${params.toString()}`);
      return response;
    },
  });
};

export const useUpdateCommission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      newCommissionRate: number | string;
      reason: string;
      applyToExisting: boolean;
    }): Promise<any> => {
      await api.post("/admin/settings/commission", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
  });
};

// ===================== REPORTS & RANKINGS =====================
export const useAdminTopRankings = () => {
  return useQuery({
    queryKey: ["admin-top-rankings"],
    queryFn: async (): Promise<any> => {
      // Dùng Promise.all để gọi song song 2 API cho nhanh
      const [topRevenue, topCancelled] = await Promise.all([
        api.get("/admin/reports/top-revenue"),
        api.get("/admin/reports/top-cancelled")
      ]);
      return { topRevenue, topCancelled };
    },
  });
};

export const useAdminCuisineChart = () => {
  return useQuery({
    queryKey: ["admin-cuisine-chart"],
    queryFn: async (): Promise<any[]> => await api.get("/admin/reports/cuisine-chart"),
  });
};

export const useAdminRevenueChart = () => {
  return useQuery({
    queryKey: ["admin-revenue-chart"],
    queryFn: async (): Promise<any[]> => await api.get("/admin/reports/revenue-chart"),
  });
};

export const useExportAdminReport = () => {
  return useMutation({
    mutationFn: async ({ format, startDate, endDate }: { format: string, startDate?: string, endDate?: string }) => {
      const params = new URLSearchParams({ format });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      // Quan trọng: Phải ép responseType là 'blob' để Axios không làm hỏng file
      const response = await api.get(`/admin/reports/export?${params.toString()}`, {
        responseType: "blob" 
      });
      return { data: response, format };
    },
    onSuccess: ({ data, format }) => {
      // Logic biến blob thành file tải xuống
      const url = window.URL.createObjectURL(new Blob([data as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Admin_Report.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    }
  });
};
