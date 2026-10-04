import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/PostParts";
import { JsonLd } from "@/components/seo/JsonLd";
import { OG_LOCALE } from "@/i18n/config";
import { buildBlogIndexGraph } from "@/lib/blog/jsonld";
import { blogPath, getPosts } from "@/lib/blog/posts";
import { BLOG_LOCALES, isBlogLocale } from "@/lib/blog/types";
import { BLOG_UI } from "@/lib/blog/ui";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isBlogLocale(lang)) notFound();
  const ui = BLOG_UI[lang];
  return {
    title: { absolute: ui.title },
    description: ui.description,
    alternates: {
      canonical: blogPath(lang),
      languages: {
        ...Object.fromEntries(BLOG_LOCALES.map((l) => [l, blogPath(l)])),
        "x-default": blogPath("ru"),
      },
      types: { "application/rss+xml": `/${lang}/feed.xml` },
    },
    // Метаданные сегментов сливаются поверхностно: openGraph без images
    // убрал бы картинку [lang]/opengraph-image, поэтому она задана явно.
    openGraph: {
      type: "website",
      siteName: SITE.brand,
      url: blogPath(lang),
      title: ui.title,
      description: ui.description,
      locale: OG_LOCALE[lang],
      images: [{ url: `/${lang}/opengraph-image`, width: 1200, height: 630, alt: SITE.brand }],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: [`/${lang}/opengraph-image`],
    },
  };
}

export default async function BlogIndex({ params }: Props) {
  const { lang } = await params;
  if (!isBlogLocale(lang)) notFound();
  const ui = BLOG_UI[lang];
  const posts = getPosts(lang);

  return (
    <>
      <JsonLd data={buildBlogIndexGraph(lang, posts)} />
      <header className="blog-hero">
        <h1>{ui.heading}</h1>
        <p>{ui.description}</p>
      </header>
      {posts.length ? (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard post={post} key={post.slug} />
          ))}
        </div>
      ) : (
        <p className="blog-empty">{ui.empty}</p>
      )}
    </>
  );
}
