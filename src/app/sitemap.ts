import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { blogPath, getAllPosts, getTranslations, postPath } from "@/lib/blog/posts";
import { BLOG_ENABLED, BLOG_LOCALES } from "@/lib/blog/types";
import { SITE } from "@/lib/site";

// Корень "/" — редирект, в sitemap его нет. Яндекс hreflang из sitemap не
// читает: основной канал — <link rel="alternate"> в <head>.
const LANGUAGE_ALTERNATES = {
  ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE.origin}/${l}`])),
  "x-default": SITE.root,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const home = LOCALES.map((lang) => ({
    url: `${SITE.origin}/${lang}`,
    lastModified: SITE.contentUpdatedAt,
    alternates: { languages: LANGUAGE_ALTERNATES },
  }));
  if (!BLOG_ENABLED) return home;

  const posts = getAllPosts();
  const latest = (lang: string) =>
    posts
      .filter((post) => post.lang === lang)
      .reduce<string>((max, post) => (post.updated > max ? post.updated : max), SITE.contentUpdatedAt);

  // Блог — только ru и kk.
  const blogAlternates = Object.fromEntries(
    BLOG_LOCALES.map((l) => [l, `${SITE.origin}${blogPath(l)}`]),
  );
  const blog = BLOG_LOCALES.map((lang) => ({
    url: `${SITE.origin}${blogPath(lang)}`,
    lastModified: latest(lang),
    alternates: { languages: blogAlternates },
  }));

  const articles = posts.map((post) => ({
    url: `${SITE.origin}${postPath(post.lang, post.slug)}`,
    lastModified: post.updated,
    alternates: {
      languages: Object.fromEntries(
        getTranslations(post.group).map((other) => [
          other.lang,
          `${SITE.origin}${postPath(other.lang, other.slug)}`,
        ]),
      ),
    },
  }));

  return [...home, ...blog, ...articles];
}
