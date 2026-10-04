import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getMeta } from "@/i18n/dictionaries";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE.brand,
    short_name: SITE.brand,
    description: getMeta(DEFAULT_LOCALE).description,
    lang: DEFAULT_LOCALE,
    dir: "ltr",
    // Корень, а не /kk: он редиректит на язык из cookie или браузера.
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
