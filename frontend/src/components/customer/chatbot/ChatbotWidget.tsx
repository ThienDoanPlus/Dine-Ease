"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { MessageSquare, X, Send, Bot, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatbot, useClearChatMemory } from "@/hooks/useCustomer"; 
import { useBookingStore } from "@/store/useBookingStore"; 
import { useChatStore, Message } from "@/store/useChatStore";
import { toast } from "sonner";

// 1. IMPORT THƯ VIỆN MARKDOWN
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatbotWidget() {
  const [inputText, setInputText] = useState("");
  const [isHydrated, setIsHydrated] = useState(false); 
  
  const { mutateAsync: sendChatMessage, isPending } = useChatbot();
  const { mutate: clearBackendMemory } = useClearChatMemory();

  const router = useRouter();
  const setBookingInfo = useBookingStore((state) => state.setBookingInfo);

  const { isOpen, setIsOpen, messages, setMessages, clearChat } = useChatStore();

  const handleClearConversation = () => {
    clearChat(); // Xóa UI (Zustand)
    clearBackendMemory(); // Xóa Context (Spring AI)
    toast.success("Đã làm mới bộ nhớ của AI!");
  };

  const pathname = usePathname();
  const params = useParams();

  let currentResId: number | undefined = undefined;
  if (pathname?.startsWith("/restaurant/") && params?.id) {
    const parsedId = Number(params.id);
    if (!isNaN(parsedId)) {
      currentResId = parsedId;
    }
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || isPending) return;
    setInputText("");

    const userMsgId = Date.now().toString();
    const typingMsgId = "typing-" + userMsgId;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: text },
      { id: typingMsgId, sender: "bot", text: "", isTyping: true },
    ]);

    try {
      const response = await sendChatMessage({ 
        message: text,
        currentRestaurantId: currentResId 
      });

      setMessages((prev) => {
        const filteredMessages = prev.filter((m) => m.id !== typingMsgId);
        
        if (response.type === "TEXT") {
          return [...filteredMessages, { id: Date.now().toString(), sender: "bot", text: response.content || "" }];
        } 
        else if (response.type === "ACTION") {
          const aiData = response.actionData?.data;
          if (aiData) {
            const botMessage: Message = { 
              id: Date.now().toString(), 
              sender: "bot", 
              text: "Thông tin hợp lệ! Mình đang chuyển bạn đến trang Xác nhận đặt bàn nhé 🚀" 
            };

            setTimeout(() => {
              setBookingInfo({
                restaurantId: aiData.restaurantId,
                restaurantName: aiData.restaurantName,
                depositAmount: 100000, 
                reservationDate: aiData.date, 
                reservationTime: `${aiData.time}:00`, 
                guestCount: aiData.guestCount,
                notes: aiData.notes || "Khách đặt bàn qua Chatbot AI",
              });
              router.push("/user/checkout/new/step2");
              setIsOpen(false);
            }, 1500);

            return [...filteredMessages, botMessage];
          }
        }
        return filteredMessages;
      });
    } catch (error) {
      setMessages((prev) => {
        const filteredMessages = prev.filter((m) => m.id !== typingMsgId);
        return [...filteredMessages, { id: Date.now().toString(), sender: "bot", text: "Xin lỗi, hệ thống AI đang bận hoặc mất kết nối. Vui lòng thử lại sau nhé! 😥" }];
      });
    }
  };

  if (!isHydrated) return null;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className={cn("fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95", isOpen && "scale-0 opacity-0 pointer-events-none")}>
        <MessageSquare className="h-6 w-6" />
      </button>

      <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-stone-100 transition-all duration-300 transform origin-bottom-right w-[90vw] sm:w-[380px] h-[550px] max-h-[85vh]", isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none")}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-[#2D2318] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 shadow-sm"><Bot className="h-6 w-6 text-white" /></div>
            <div>
              <h3 className="font-bold tracking-tight flex items-center gap-1">Dine-Ease AI <Sparkles className="h-3 w-3 text-amber-400" /></h3>
              <p className="text-[10px] text-stone-300 font-medium flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearConversation}
              title="Xóa hội thoại"
              className="rounded-full p-2 text-stone-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-stone-300 hover:bg-white/10 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {/* BODY CHAT */}
        <div className="custom-scrollbar flex-1 overflow-y-auto bg-stone-50 p-4 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={msg.id} className={cn("flex w-full", isBot ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isBot
                      ? "bg-white text-stone-700 border border-stone-200 shadow-sm rounded-tl-sm space-y-2"
                      : "bg-amber-500 text-white shadow-md rounded-tr-sm font-medium"
                  )}
                >
                  {msg.isTyping ? (
                    <div className="flex items-center gap-1 h-5 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"></span>
                    </div>
                  ) : (
                    // 2. RENDER MARKDOWN BẰNG THƯ VIỆN
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom lại các thẻ HTML để nó đẹp hơn với Tailwind
                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="ml-4 list-disc space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="ml-4 list-decimal space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-black" {...props} />,
                        a: ({ node, ...props }) => <a className="text-amber-600 underline underline-offset-2 hover:text-amber-700" target="_blank" rel="noopener noreferrer" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="font-bold text-base mt-2 mb-1" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT CHAT */}
        <div className="bg-white p-3 border-t border-stone-100">
          <form onSubmit={handleSendMessage} className={cn("flex items-center gap-2 rounded-2xl p-1.5 border transition-colors", isPending ? "bg-stone-50 border-stone-100" : "bg-stone-100 border-stone-200 focus-within:border-amber-400 focus-within:bg-white")}>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={isPending} placeholder={isPending ? "Đang suy nghĩ..." : "Nhập câu hỏi của bạn..."} className="flex-1 bg-transparent px-3 py-2 text-sm text-stone-700 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed" />
            <button type="submit" disabled={!inputText.trim() || isPending} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"><Send className="h-4 w-4 ml-0.5" /></button>
          </form>
        </div>
      </div>
    </>
  );
}
