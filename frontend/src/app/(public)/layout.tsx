import React from "react";
import { PublicHeader } from "@/components/customer/layouts/PublicHeader";
import { PublicFooter } from "@/components/customer/layouts/PublicFooter";
// CHÈN CHATBOT CỦA BẠN VÀO ĐÂY
import { ChatbotWidget } from "@/components/customer/chatbot/ChatbotWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-800 font-sans antialiased">
      <PublicHeader />
      <main className="flex-1 pt-20">{children}</main>
      <PublicFooter variant="full" />
      
      {/* RENDER CHATBOT */}
      <ChatbotWidget />
    </div>
  );
}
