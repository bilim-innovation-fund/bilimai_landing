import { statSync } from "node:fs";
import { join } from "node:path";
import { BLOG_CATEGORIES, BLOG_LOCALES, isBlogLocale } from "@/lib/blog/types";
import { blogPath, getPosts, isoDateTime, postPath } from "@/lib/blog/posts";
import { BLOG_UI } from "@/lib/blog/ui";
import { SITE } from "@/lib/site";

// RSS 2.0 на язык блога: /ru/feed.xml, /kk/feed.xml. Пререндерится при
// сборке. Route handler не наследует параметры [lang] — свои.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_LOCALES.map((lang) => ({ lang }));
}

const xml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const coverBytes = (cover: string) => statSync(join(process.cwd(), "public", cover)).size;

const rfc822 = (date: string) => new Date(isoDateTime(date)).toUTCString();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  if (!isBlogLocale(lang)) return new Response(null, { status: 404 });

  const ui = BLOG_UI[lang];
  const posts = getPosts(lang);
  const lastUpdated = posts.reduce(
    (latest, post) => (post.updated > latest ? post.updated : latest),
    posts.length ? posts[0].updated : SITE.contentUpdatedAt,
  );
  const self = `${SITE.origin}/${lang}/feed.xml`;

  const items = posts
    .map((post) => {
      const url = `${SITE.origin}${postPath(post.lang, post.slug)}`;
      return [
        "    <item>",
        `      <title>${xml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        `      <description>${xml(post.description)}</description>`,
        `      <category>${xml(BLOG_CATEGORIES[post.category][post.lang])}</category>`,
        `      <enclosure url="${SITE.origin}${post.cover}" type="image/jpeg" length="${coverBytes(post.cover)}"/>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(ui.title)}</title>`,
    `    <link>${SITE.origin}${blogPath(lang)}</link>`,
    `    <description>${xml(ui.description)}</description>`,
    `    <language>${lang}</language>`,
    `    <lastBuildDate>${rfc822(lastUpdated)}</lastBuildDate>`,
    `    <atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
