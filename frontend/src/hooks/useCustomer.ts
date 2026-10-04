// src/hooks/useCustomer.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { 
  PageResponse, 
  RestaurantPublicResponse, 
  MenuCategoryPublicResponse, 
  ReservationRequest, 
  ReservationResponse,
  ReviewRequest,
  RestaurantDetailPublicResponse,
  ChatbotResponse,
  Cuisine,
  Amenity
} from "@/types/customer";

// ==========================================
// 1. PUBLIC API (Không cần đăng nhập)
// ==========================================

export const usePublicRestaurantDetail = (id: number) => {
  return useQuery<RestaurantDetailPublicResponse>({
    queryKey: ["public-restaurant-detail", id],
    queryFn: async () => await api.get(`/public/restaurants/${id}`),
    enabled: !!id
  });
};

export const useGetRestaurantReviews = (restaurantId: number) => {
  return useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: async () => await api.get(`/public/restaurants/${restaurantId}/reviews`),
    enabled: !!restaurantId
  });
};

export const usePublicRestaurants = (
  keyword: string = "", 
  minRating: number = 0, 
  maxPrice?: number, 
  cuisineIds?: number[],
  amenityIds?: number[], 
  page = 1, 
  size = 10
) => {
  return useQuery<PageResponse<RestaurantPublicResponse>>({
    queryKey: ["public-restaurants", keyword, minRating, maxPrice, cuisineIds, amenityIds, page, size],
    queryFn: async () => {
      const response = await api.get("/public/restaurants", {
        params: {
          page: page > 0 ? page - 1 : 0, 
          size,
          keyword: keyword && keyword !== "All" ? keyword : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          maxPrice: maxPrice || undefined,
          cuisineIds: cuisineIds && cuisineIds.length > 0 ? cuisineIds.join(",") : undefined,
          amenityIds: amenityIds && amenityIds.length > 0 ? amenityIds.join(",") : undefined,
        }
      });
      return response as unknown as PageResponse<RestaurantPublicResponse>;
    }
  });
};

export const usePublicCuisines = () => {
  return useQuery<Cuisine[]>({ 
    queryKey: ["public-cuisines"],
    queryFn: async () => await api.get("/public/cuisines")
  });
};

export const usePublicAmenities = () => {
  return useQuery<Amenity[]>({ 
    queryKey: ["public-amenities"],
    queryFn: async () => await api.get("/public/amenities")
  });
};

export const useRestaurantMenu = (restaurantId: number) => {
  return useQuery<MenuCategoryPublicResponse[]>({
    queryKey: ["restaurant-menu", restaurantId],
    queryFn: async () => await api.get(`/public/restaurants/${restaurantId}/menu`),
    enabled: !!restaurantId
  });
};

// ==========================================
// 2. RESERVATION API (Bắt buộc đăng nhập)
// ==========================================

export const useCreateReservation = () => {
  return useMutation<ReservationResponse, Error, ReservationRequest>({
    mutationFn: async (data) => await api.post("/reservations", data)
  });
};

export const useMyReservations = (page = 1, size = 10) => {
  return useQuery<PageResponse<ReservationResponse>>({
    queryKey: ["my-reservations", page, size],
    queryFn: async () => {
      const response = await api.get(`/reservations`, {
        params: { page: page - 1, size }
      });
      return response as unknown as PageResponse<ReservationResponse>;
    }
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<ReservationResponse, Error, { id: number; cancelReason: string }>({
    mutationFn: async ({ id, cancelReason }) => 
      await api.post(`/reservations/${id}/cancel`, { cancelReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    }
  });
};

// ==========================================
// 3. PAYMENT & USER PROFILE API
// ==========================================

export const useCreatePaymentUrl = () => {
  return useMutation<{ paymentUrl: string }, Error, number>({
    mutationFn: async (reservationId) => 
      await api.post(`/payments/create-url/vnpay/${reservationId}`)
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { fullName: string; phone: string; email?: string; avatarUrl?: string }) => {
      return await api.put("/customers/profile", data); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    }
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return await api.put("/customers/password", data);
    }
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, ReviewRequest>({
    mutationFn: async (data) => await api.post("/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["public-restaurant-detail"] });
    }
  });
};

// ==========================================
// 4. CHATBOT AI API - [CỦA KHOA]
// ==========================================

export const useChatbot = () => {
  return useMutation<
    ChatbotResponse, 
    Error, 
    { message: string; currentRestaurantId?: number | null }
  >({
    mutationFn: async ({ message, currentRestaurantId }) => {
      const params = new URLSearchParams({ message: message });
      if (currentRestaurantId) {
        params.append("currentRestaurantId", currentRestaurantId.toString());
      }
      return await api.get(`/chatbot/chat?${params.toString()}`);
    }
  });
};

export const useClearChatMemory = () => {
  return useMutation<void, Error, void>({
    mutationFn: async () => await api.delete("/chatbot/memory")
  });
};

// ==========================================
// 5. AUTH & CLOUDINARY UPLOAD - [CỦA YẾN MERGE VÀO]
// ==========================================

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: unknown) => await api.post("/auth/register", data)
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      // Gọi API upload Public lên Cloudinary 
      const response: unknown = await api.post("/public/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return (response as { url: string }).url; // Trả về URL ảnh từ Cloudinary
    }
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      await api.delete(`/public/upload?url=${encodeURIComponent(url)}`);
    }
  });
};

// ==========================================
// 6. NOTIFICATIONS API
// ==========================================
export const useMyNotifications = () => {
  return useQuery({
    queryKey: ["my-notifications"],
    queryFn: async () => await api.get("/my-notifications")
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await api.patch(`/my-notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] })
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await api.patch("/my-notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] })
  });
};

