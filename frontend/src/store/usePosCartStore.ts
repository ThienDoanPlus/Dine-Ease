import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid"; // Dùng UUID để tạo ID duy nhất cho mỗi dòng Order

export interface CartOption {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // <-- THÊM MỚI: Phân biệt các món giống nhau nhưng khác Topping
  id: number;         // ID của Món ăn gốc
  name: string;
  price: number;      // Giá đã cộng dồn Topping
  qty: number;
  note: string;
  options: CartOption[]; // <-- THÊM MỚI: Mảng chứa Topping
}

interface PosCartState {
  carts: Record<string, CartItem[]>;
  // Đã sửa lại tham số truyền vào
  addToCart: (tableId: string, dish: any, options: CartOption[], finalPrice: number) => void;
  updateQty: (tableId: string, cartItemId: string, delta: number) => void;
  updateNote: (tableId: string, cartItemId: string, note: string) => void;
  removeCartItem: (tableId: string, cartItemId: string) => void;
  clearCart: (tableId: string) => void;
}

export const usePosCartStore = create<PosCartState>()(
  persist(
    (set) => ({
      carts: {},

      addToCart: (tableId, dish, options, finalPrice) => set((state) => {
        const currentCart = state.carts[tableId] || [];
        
        // Sinh ID ngẫu nhiên cho dòng Order này
        const newCartItem: CartItem = {
          cartItemId: uuidv4(),
          id: dish.id,
          name: dish.name,
          price: finalPrice,
          qty: 1,
          note: "",
          options: options
        };

        return {
          carts: {
            ...state.carts,
            [tableId]: [...currentCart, newCartItem]
          }
        };
      }),

      // Chú ý: Dùng cartItemId thay vì dishId
      updateQty: (tableId, cartItemId, delta) => set((state) => {
        const currentCart = state.carts[tableId] || [];
        return {
          carts: {
            ...state.carts,
            [tableId]: currentCart.map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : item;
              }
              return item;
            })
          }
        };
      }),

      updateNote: (tableId, cartItemId, note) => set((state) => {
        const currentCart = state.carts[tableId] || [];
        return {
          carts: {
            ...state.carts,
            [tableId]: currentCart.map((item) => 
              item.cartItemId === cartItemId ? { ...item, note } : item
            )
          }
        };
      }),

      removeCartItem: (tableId, cartItemId) => set((state) => {
        const currentCart = state.carts[tableId] || [];
        return {
          carts: {
            ...state.carts,
            [tableId]: currentCart.filter((item) => item.cartItemId !== cartItemId)
          }
        };
      }),

      clearCart: (tableId) => set((state) => {
        const newCarts = { ...state.carts };
        delete newCarts[tableId];
        return { carts: newCarts };
      }),
    }),
    { name: "dineease-pos-cart" }
  )
);
