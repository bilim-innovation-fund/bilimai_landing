import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryLabel, PostCard, PostMeta } from "@/components/blog/PostParts";
import { JsonLd } from "@/components/seo/JsonLd";
import { AUTHORS } from "@/content/authors";
import { OG_LOCALE } from "@/i18n/config";
import { buildPostGraph, coverUrl } from "@/lib/blog/jsonld";
import {
  blogPath,
  getAllPosts,
  getPost,
  getRelated,
  getTranslations,
  isoDateTime,
  postPath,
} from "@/lib/blog/posts";
import { type BlogLocale, isBlogLocale } from "@/lib/blog/types";
import { BLOG_UI } from "@/lib/blog/ui";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Только выгруженные посты; любой другой slug — 404.
export const dynamicParams = false;

// Возвращаем полные {lang, slug} всех постов, не глядя на params родителя.
// Next вызывает функцию для каждого lang из корневого layout и сливает
// результат поверх него. Если для какого-то lang (en, или язык без постов)
// вернуть [], Next пропустит дальше {lang} без slug, сочтёт набор неполным
// и не пререндерит ни одного поста (next/dist/build/static-paths/app.js).
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ lang: post.lang, slug: post.slug }));
}

// Turbopack собирает контекст import() по шаблону пути на сборке, и пустой
// контекст — ошибка сборки. Поэтому один шаблон на все языки, а
// src/content/blog/_template/post.mdx (его не читают ни posts.ts, ни
// валидатор) держит контекст непустым, даже когда постов нет.
async function loadBody(lang: BlogLocale, slug: string) {
  return (await import(`@/content/blog/${lang}/${slug}.mdx`)).default;
}

async function resolvePost(params: Props["params"]) {
  const { lang, slug } = await params;
  if (!isBlogLocale(lang)) notFound();
  const post = getPost(lang, slug);
  if (!post) notFound();
  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await resolvePost(params);
  const translations = getTranslations(post.group);
  const languages = Object.fromEntries(
    translations.map((other) => [other.lang, postPath(other.lang, other.slug)]),
  );
  const fallback = translations.find((other) => other.lang === "ru") ?? post;
  const image = { url: coverUrl(post), width: 1200, height: 630, alt: post.coverAlt || undefined };
  const author = AUTHORS[post.author as keyof typeof AUTHORS];

  return {
    title: { absolute: post.title },
    description: post.description,
    alternates: {
      canonical: postPath(post.lang, post.slug),
      languages: { ...languages, "x-default": postPath(fallback.lang, fallback.slug) },
      types: { "application/rss+xml": `/${post.lang}/feed.xml` },
    },
    openGraph: {
      type: "article",
      siteName: SITE.brand,
      url: postPath(post.lang, post.slug),
      title: post.title,
      description: post.description,
      locale: OG_LOCALE[post.lang],
      publishedTime: isoDateTime(post.date),
      // article:modified_time — только если пост правили после публикации.
      modifiedTime: post.updated > post.date ? isoDateTime(post.updated) : undefined,
      authors: author ? [author.name[post.lang]] : undefined,
      tags: post.tags,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image.url],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await resolvePost(params);
  const Body = await loadBody(post.lang, post.slug);
  const ui = BLOG_UI[post.lang];
  const related = getRelated(post);

  return (
    <>
      <JsonLd data={buildPostGraph(post)} />
      <article className="post">
        <nav className="post-breadcrumb" aria-label={ui.blog}>
          <a href={`/${post.lang}`}>{ui.home}</a>
          <span aria-hidden="true">/</span>
          <a href={blogPath(post.lang)}>{ui.blog}</a>
        </nav>
        <header className="post-header">
          <CategoryLabel post={post} />
          <h1>{post.title}</h1>
          <p className="post-lead">{post.description}</p>
          <PostMeta post={post} />
        </header>
        {/* LCP-кандидат: eager + fetchPriority, без preload/priority. */}
        <div className="post-cover">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            width={1200}
            height={630}
            sizes="(max-width: 760px) 100vw, 720px"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="prose">
          <Body />
        </div>
      </article>
      {related.length ? (
        <section className="post-related" aria-labelledby="related-title">
          <h2 id="related-title">{ui.related}</h2>
          <div className="post-grid">
            {related.map((other) => (
              <PostCard post={other} heading="h3" key={other.slug} />
            ))}
          </div>
        </section>
      ) : null}
      <p className="post-back">
        <a href={blogPath(post.lang)}>← {ui.allPosts}</a>
      </p>
    </>
  );
}
