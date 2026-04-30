import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard output for Vercel deployment with full SSR support
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
