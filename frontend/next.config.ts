import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: true,
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
