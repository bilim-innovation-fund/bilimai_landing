import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { SITE } from "@/lib/site";

// Корень "/" — редирект, в sitemap его нет. Яндекс hreflang из sitemap не
// читает: основной канал — <link rel="alternate"> в <head>.
const LANGUAGE_ALTERNATES = {
  ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE.origin}/${l}`])),
  "x-default": SITE.root,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((lang) => ({
    url: `${SITE.origin}/${lang}`,
    lastModified: SITE.contentUpdatedAt,
    alternates: { languages: LANGUAGE_ALTERNATES },
  }));
}
