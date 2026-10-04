// src/types/customer.ts

// 1. Generic Page Response (Spring Boot trả về dữ liệu phân trang dạng Page<T>)
export interface PageResponse<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  empty: boolean;
}

export interface Cuisine {
  id: number;
  name: string;
  iconUrl?: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  roles: ("ADMIN" | "RESTAURANT" | "CUSTOMER")[];
  status: string;
  memberRank: string;    
  loyaltyPoints: number; 
  restaurantStatus?: string; // CỦA KHOA: Dùng cho GlobalRestaurantWarning
}

export interface RestaurantPublicResponse {
  id: number;
  name: string;
  address: string;
  imageMain: string;
  avgRating: number;
  avgPrice: number;     
  cuisineName: string;  
}

export interface MenuItemPublicResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrls: string[]; // CỦA KHOA: Mảng nhiều ảnh
  isBestseller: boolean;
}

export interface MenuCategoryPublicResponse {
  categoryId: number;
  categoryName: string;
  items: MenuItemPublicResponse[];
}

export interface ReservationRequest {
  restaurantId: number;
  reservationDate: string; // "YYYY-MM-DD"
  reservationTime: string; // "HH:mm:ss"
  guestCount: number;
  notes: string;
}

export interface ReservationResponse {
  id: number;
  restaurantId: number;
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  notes: string;
  cancelReason?: string;
  depositAmount: number;
  status: "PENDING" | "AWAITING_DEPOSIT" | "CONFIRMED" | "CHECKED_IN" | "COMPLETE" | "CANCELLED";
  isReviewed: boolean;
}

export interface ReviewRequest {
  reservationId: number;
  rating: number; 
  comment: string;
}

export interface RestaurantDetailPublicResponse {
  id: number;
  name: string;
  address: string;
  phoneContact: string;
  description: string;
  imageMain: string;
  avgRating: number;
  operatingHours?: string;
}

export interface ChatbotActionPayload {
  restaurantId: number;
  restaurantName: string;
  date: string; 
  time: string; 
  guestCount: number;
  notes?: string;
}

export interface ChatbotActionData {
  action: string; 
  data: ChatbotActionPayload;
}

export interface ChatbotResponse {
  type: "TEXT" | "ACTION";
  content?: string; 
  actionData?: ChatbotActionData; 
}
