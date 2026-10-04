import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },
  async headers() {
    return [
      {
        // llms.txt — для LLM-агентов, а не для поисковой выдачи.
        source: "/llms.txt",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
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
