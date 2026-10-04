import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  isTyping?: boolean;
}

interface ChatState {
  isOpen: boolean;
  messages: Message[];
  setIsOpen: (isOpen: boolean) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  clearChat: () => void;
}

const initialMessage: Message = {
  id: "welcome-1",
  sender: "bot",
  text: "Xin chào! Mình là trợ lý ảo Dine-Ease AI ✨\nMình có thể giúp bạn tìm nhà hàng, tra cứu thực đơn hoặc hỗ trợ đặt bàn nhanh chóng. Bạn cần mình giúp gì nào?",
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [initialMessage],
      setIsOpen: (isOpen) => set({ isOpen }),
      setMessages: (updater) => set((state) => ({ messages: updater(state.messages) })),
      clearChat: () => set({ messages: [initialMessage] }), // Xóa hết, chỉ chừa lại câu chào
    }),
    {
      name: "dineease-chat-storage", // Tên key lưu trong localStorage
    }
  )
);
