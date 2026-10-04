import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Dine-Ease | Đặt bàn nhà hàng",
  description: "Hệ thống đặt bàn nhà hàng tiện lợi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased text-[#2b221d] bg-[#faf9f6]">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors className="no-print" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
