import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./src/i18n/config";
import { assertBlogValid } from "./src/lib/blog/validate";

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
      // Блог только на ru и kk (контракт бэкенда): английский интерфейс
      // ведёт в русский блог.
      { source: "/en/blog", destination: "/ru/blog", permanent: false },
      { source: "/en/blog/:path*", destination: "/ru/blog/:path*", permanent: false },
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

// Плагины MDX — строками (Turbopack не передаёт функции в Rust). Свой
// плагин — абсолютным путём: @next/mdx резолвит строки от папки MDX-файла.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: ["rehype-slug", path.resolve("src/lib/blog/rehype-summary.mjs")],
  },
});

export default function config(phase: string): NextConfig {
  // Валидатор блога — до компиляции MDX: иначе сырой «{» в посте уронит
  // сборку непонятной ошибкой компилятора. Конфиг читается и воркерами
  // сборки — флаг в env, чтобы предупреждения не печатались повторно.
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.BILIM_BLOG_VALIDATED) {
    assertBlogValid(process.cwd());
    process.env.BILIM_BLOG_VALIDATED = "1";
  }
  return withMDX(nextConfig);
}
