import React from "react";
import { PublicHeader } from "@/components/customer/layouts/PublicHeader";
import { ChatbotWidget } from "@/components/customer/chatbot/ChatbotWidget";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] text-stone-800 font-sans antialiased">
      {/* Gọi Header */}
      <PublicHeader />
      
      <main className="flex-1 pt-20">
        {children}
      </main>

      <ChatbotWidget />
    </div>
  );
}
