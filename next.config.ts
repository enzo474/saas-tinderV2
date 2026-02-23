import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '64mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'tempfile.aiquickdraw.com',
      },
      {
        protocol: 'https',
        hostname: '**.aiquickdraw.com',
      },
      {
        protocol: 'https',
        hostname: '**.nanobananaapi.ai',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
// cache-bust Sat Feb 21 10:30:40 CET 2026