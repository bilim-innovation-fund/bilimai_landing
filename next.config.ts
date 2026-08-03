import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const apiProxyTarget = (
      process.env.API_PROXY_TARGET || "https://api.dev.bilimai.kz"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
