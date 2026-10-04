"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            // CỦA ĐOAN: Chỉ retry gọi lại API khi ở Production HOẶC nếu đang không dùng Mock
            retry: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_USE_MOCK !== "true" ? 1 : 0, 
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
