import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Gom chung background, căn giữa, padding của cả Login và Register vào đây
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-4 py-12 text-stone-800">
      <div className="w-full max-w-xl rounded-[2.5rem] border border-stone-100 bg-white p-10 shadow-xl shadow-stone-200/50">
        
        {/* Nội dung của trang Login hoặc Register sẽ được render ở đây */}
        {children}

      </div>
    </main>
  );
}
