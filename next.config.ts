import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {},
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
