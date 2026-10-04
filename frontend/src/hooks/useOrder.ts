import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// 1. Hook cho Bếp (Kitchen)
export const useGetKitchenTickets = () => {
  return useQuery({
    queryKey: ["kitchen-tickets"],
    queryFn: async () => {
      if (isMock) return []; 
      return await api.get("/manage/kitchen/tickets");
    },
    // ==========================================
    // [VÁ LỖ HỔNG KOT]: BẬT REALTIME ẢO (POLLING)
    // ==========================================
    refetchInterval: 10000, 
    refetchIntervalInBackground: true, 
  });
};

export const useUpdateKitchenItemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, status }: { itemId: number; status: string }) => {
      if (!isMock) await api.patch(`/manage/kitchen/items/${itemId}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen-tickets"] }),
  });
};

// 2. Hook cho Đặt món từ Sơ đồ bàn
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (payload: { tableId: number | null; items: any[] }) => {
      if (!isMock) await api.post("/manage/orders", payload);
    }
  });
};

// 3. Hook cho POS (Thu ngân)
export const useGetTableOrder = (tableId: string | null) => {
  return useQuery({
    queryKey: ["table-order", tableId],
    queryFn: async () => {
      if (isMock || !tableId) return null;
      return await api.get(`/manage/orders/table/${tableId}`);
    },
    enabled: !!tableId, // Chỉ gọi API khi đã chọn bàn
  });
};

export const useCheckoutOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, payload }: { orderId: number; payload: any }) => {
      if (!isMock) await api.patch(`/manage/orders/${orderId}/checkout`, payload);
    },
    onSuccess: () => {
      // Làm mới lại sơ đồ bàn (để bàn chuyển về màu trắng - trống)
      queryClient.invalidateQueries({ queryKey: ["restaurant-floor-plan"] });
    },
  });
};

export const useUpdateOrderSurcharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, payload }: { orderId: number; payload: { note: string; amount: number } }) => {
      if (!isMock) await api.patch(`/manage/orders/${orderId}/surcharge`, payload);
    },
    onSuccess: () => {
      // Gọi lại API getTableOrder để cập nhật lại giao diện ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["table-order"] });
    },
  });
};

// Hook gọi API áp mã giảm giá (Zero-Trust)
export const useApplyOrderDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, payload }: { orderId: number; payload: { voucherCode: string; reason: string } }) => {
      if (!isMock) await api.patch(`/manage/orders/${orderId}/discount`, payload);
    },
    onSuccess: () => {
      // Reload lại bill ngay lập tức để thấy tiền giảm
      queryClient.invalidateQueries({ queryKey: ["table-order"] });
    },
  });
};
