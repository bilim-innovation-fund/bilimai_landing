import type { NextConfig } from "next";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./src/i18n/config";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Корневой layout живёт под [lang]: 404 для чужих путей отдаёт
    // src/app/global-not-found.tsx.
    globalNotFound: true,
  },
  // "/" — всегда 307: цель зависит от cookie и заголовка, кэшировать её
  // навсегда нельзя. Порядок: явный выбор в переключателе (cookie), затем
  // первый язык браузера, затем казахский. Правила выполняются до
  // файловой системы, proxy.ts не нужен.
  async redirects() {
    return [
      ...LOCALES.map((lang) => ({
        source: "/",
        has: [{ type: "cookie" as const, key: LOCALE_COOKIE, value: `^${lang}$` }],
        destination: `/${lang}`,
        permanent: false,
      })),
      ...LOCALES.map((lang) => ({
        source: "/",
        has: [
          {
            type: "header" as const,
            key: "accept-language",
            value: `^${lang}(?:[-;,].*)?$`,
          },
        ],
        destination: `/${lang}`,
        permanent: false,
      })),
      { source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false },
    ];
  },
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
