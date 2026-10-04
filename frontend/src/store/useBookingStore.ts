import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookingState {
  restaurantId: number;
  restaurantName: string;
  depositAmount: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm:ss
  guestCount: number;
  notes: string;
  
  // Hàm cập nhật
  setBookingInfo: (data: Partial<BookingState>) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      restaurantId: 0,
      restaurantName: "",
      depositAmount: 0,
      reservationDate: "",
      reservationTime: "",
      guestCount: 2,
      notes: "",

      setBookingInfo: (data) => set((state) => ({ ...state, ...data })),
      clearBooking: () => set({
        restaurantId: 0, restaurantName: "", depositAmount: 0,
        reservationDate: "", reservationTime: "", guestCount: 2, notes: ""
      }),
    }),
    {
      name: "dineease-booking-storage",
    }
  )
);
