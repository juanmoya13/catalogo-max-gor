import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Ajusta este valor ('2mb', '10mb', etc.) según tus necesidades
    },
  },
};

export default nextConfig;
