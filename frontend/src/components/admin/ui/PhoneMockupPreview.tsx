import React from "react";

interface PhoneMockupPreviewProps {
  children: React.ReactNode;
  bgGradient?: string;
}

export function PhoneMockupPreview({
  children,
  bgGradient = "from-[#8E2DE2] to-[#4A00E0]",
}: PhoneMockupPreviewProps) {
  return (
    <div className="relative mx-auto h-[580px] w-[280px] overflow-hidden rounded-[45px] border-[10px] border-black bg-black shadow-2xl ring-1 ring-stone-200/50">
      {/* Dynamic Island */}
      <div className="absolute top-2 left-1/2 z-20 h-7 w-24 -translate-x-1/2 rounded-full bg-black"></div>

      {/* Screen Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}>
        {/* Status Bar Time (Mock) */}
        <div className="mt-16 text-center text-white">
          <h1 className="text-6xl font-light tracking-tighter">9:41</h1>
          <p className="mt-1 text-sm font-medium opacity-90">Tuesday, 1 Aug</p>
        </div>

        {/* Nội dung thông báo sẽ được bọc ở đây */}
        <div className="absolute inset-x-3 top-44 transition-all duration-300">{children}</div>
      </div>
    </div>
  );
}
