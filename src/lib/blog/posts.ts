import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";

import { parseFile, toFrontmatter } from "@/lib/blog/frontmatter";
import {
  BLOG_LOCALES,
  type BlogFrontmatter,
  type BlogLocale,
} from "@/lib/blog/types";
import { CONTENT_DIR, unescapeMdx, wordCount } from "@/lib/blog/validate";

export type Post = BlogFrontmatter & {
  lang: BlogLocale;
  slug: string;
  // Нормализовано один раз: updated ?? date.
  updated: string;
  wordCount: number;
  readingMinutes: number;
};

// Видимый текст для подсчёта слов: без кода и без адресов ссылок.
function visibleText(body: string): string {
  return unescapeMdx(body)
    .replace(/^```[\s\S]*?^```[ \t]*$/gm, "")
    .replace(/`[^`\n]+`/g, "")
    .replace(/\]\([^)]*\)/g, "]");
}

function readPost(lang: BlogLocale, name: string): Post {
  const file = `${CONTENT_DIR}/${lang}/${name}`;
  // Путь литералом от подпапки: иначе Turbopack трассирует в серверный
  // бандл весь проект.
  const parsed = parseFile(
    file,
    readFileSync(join(process.cwd(), "src/content/blog", lang, name), "utf8"),
  );
  const fm = toFrontmatter(file, parsed);
  const words = wordCount(visibleText(parsed.body));
  return {
    ...fm,
    lang,
    slug: name.slice(0, -".mdx".length),
    updated: fm.updated ?? fm.date,
    wordCount: words,
    readingMinutes: fm.readingMinutes ?? Math.max(1, Math.round(words / 180)),
  };
}

// (date desc, slug asc): одна выгрузка может принести несколько постов с
// одной датой (blog-bundle-<date>.zip).
function byDate(a: Post, b: Post): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

// Черновики видны только в `next dev`.
export const getAllPosts = cache((): Post[] => {
  const posts: Post[] = [];
  for (const lang of BLOG_LOCALES) {
    const dir = join(process.cwd(), "src/content/blog", lang);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (name.endsWith(".mdx")) posts.push(readPost(lang, name));
    }
  }
  const showDrafts = process.env.NODE_ENV === "development";
  return posts.filter((post) => showDrafts || !post.draft).sort(byDate);
});

export function getPosts(lang: BlogLocale): Post[] {
  return getAllPosts().filter((post) => post.lang === lang);
}

export function getPost(lang: BlogLocale, slug: string): Post | undefined {
  return getAllPosts().find((post) => post.lang === lang && post.slug === slug);
}

// Все языковые версии поста (включая сам пост).
export function getTranslations(group: string): Post[] {
  return getAllPosts().filter((post) => post.group === group);
}

// Похожие: тот же язык, общие теги или рубрика; по числу совпадений.
export function getRelated(post: Post, limit = 3): Post[] {
  const score = (other: Post) =>
    other.tags.filter((tag) => post.tags.includes(tag)).length +
    (other.category === post.category ? 1 : 0);
  return getPosts(post.lang)
    .filter((other) => other.slug !== post.slug && score(other) > 0)
    .sort((a, b) => score(b) - score(a) || byDate(a, b))
    .slice(0, limit);
}

export function postPath(lang: BlogLocale, slug: string): string {
  return `/${lang}/blog/${slug}`;
}

export function blogPath(lang: BlogLocale): string {
  return `/${lang}/blog`;
}

// Дата поста — день по Asia/Almaty (UTC+5).
export function isoDateTime(date: string): string {
  return `${date}T00:00:00+05:00`;
}
