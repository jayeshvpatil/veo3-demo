import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'michaelkors.scene7.com',
      },
    ],
  },
};

export default nextConfig;
