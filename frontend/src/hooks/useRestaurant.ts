import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export interface FloorPlanResponse {
  tables: any[];
  architecturalData: string;
}

export const useGetFloorPlan = () => {
  return useQuery({
    queryKey: ["restaurant-floor-plan"],
    queryFn: async () => {
      if (isMock) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              tables: [
                { id: "1", tableName: "Bàn 01", capacity: 4, status: "empty", x: 100, y: 150, width: 80, height: 80, shape: "rect", rotation: 0, floorName: "1_main" },
                { id: "2", tableName: "Bàn 02", capacity: 2, status: "serving", x: 300, y: 150, width: 80, height: 80, shape: "circle", rotation: 0, floorName: "1_main" },
              ],
              architecturalData: JSON.stringify([
                { id: "w1", type: "wall", label: "Tường mặt tiền", color: "#d6d3d1", x: 50, y: 50, width: 500, height: 20, rotation: 0, floorName: "1_main" }
              ])
            } as FloorPlanResponse);
          }, 500); 
        });
      }

      // Khớp chuẩn với ManageTableController.java của bạn
      return await api.get("/manage/tables/floor-plan") as unknown as FloorPlanResponse; 
    },
  });
};

export const useSyncFloorPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      if (isMock) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
      }
      return await api.post("/manage/tables/sync", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-floor-plan"] });
    },
  });
};

export const useExportRestaurantReport = () => {
  return useMutation({
    mutationFn: async ({ format }: { format: string }) => {
      const response = await api.get(`/manage/reports/export?format=${format}`, {
        responseType: "blob" 
      });
      return { data: response, format };
    },
    onSuccess: ({ data, format }) => {
      const url = window.URL.createObjectURL(new Blob([data as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Restaurant_Report.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    }
  });
};

export const useGetTopSellingItems = () => {
  return useQuery({
    queryKey: ["restaurant-top-items"],
    queryFn: async () => {
      if (process.env.NEXT_PUBLIC_USE_MOCK === "true") return [];
      return await api.get("/manage/reports/top-items");
    },
  });
};

export const useGetRestaurantDashboard = (period: string) => {
  return useQuery({
    queryKey: ["restaurant-dashboard", period],
    queryFn: async () => {
      if (isMock) return { totalRevenue: 0, totalGuests: 0, newOrders: 0, occupancyRate: 0, chartData: [] };
      return await api.get(`/manage/reports/dashboard?period=${period}`);
    },
  });
};

export const useGetRecentTransactions = () => {
  return useQuery({
    queryKey: ["restaurant-recent-transactions"],
    queryFn: async () => {
      if (isMock) return [];
      return await api.get("/manage/reports/recent-transactions");
    },
    refetchInterval: 10000, // Real-time cập nhật mỗi 10 giây giống màn hình KOT
  });
};


// ===================== SETTINGS NHÀ HÀNG =====================
export const useGetRestaurantSettings = () => {
  return useQuery({
    queryKey: ["restaurant-settings"],
    queryFn: async (): Promise<any> => {
      if (isMock) {
        return {
          name: "Yume Sushi",
          phone: "0901234567",
          address: "123 Lê Lợi, Quận 1, TP.HCM",
          description: "Nhà hàng Nhật Bản cao cấp với phong cách hiện đại.",
          logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
          coverUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
          depositAmount: 100000,
          maxPax: 20,
          commissionRate: 15,
          amenityIds: [1, 2],
          operatingHours: "[]"
        };
      }
      return await api.get("/manage/settings");
    },
  });
};

export const useUpdateRestaurantInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (isMock) return null;
      return await api.put("/manage/settings/info", data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] })
  });
};

export const useUpdateBookingConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (isMock) return null;
      return await api.put("/manage/settings/booking-config", data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] })
  });
};

export const useUpdateOperatingHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hoursJson: string) => {
      if (isMock) return null;
      return await api.put("/manage/settings/operating-hours", { operatingHours: hoursJson });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] })
  });
};

export const useUpdateRestaurantImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ logo, cover }: { logo: File | null; cover: File | null }) => {
      if (isMock) return null;
      const formData = new FormData();
      if (logo) formData.append("logo", logo);
      if (cover) formData.append("cover", cover);
      return await api.post("/manage/settings/images", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] })
  });
};
