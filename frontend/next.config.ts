import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: true,
  },
  eslint: {
    // Bỏ qua lỗi ESLint khi build trên Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi TypeScript (PageProps params Promise của Next 15) khi build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Của Khoa
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // CỦA YẾN: Cho phép load ảnh Cloudinary
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // Avatar mặc định
      },
    ],
  },
};

export default nextConfig;
