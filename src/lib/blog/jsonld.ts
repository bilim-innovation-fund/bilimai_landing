import { BLOG_CATEGORIES, type BlogLocale } from "@/lib/blog/types";
import { blogPath, isoDateTime, type Post, postPath } from "@/lib/blog/posts";
import { BLOG_UI } from "@/lib/blog/ui";
import { ORG_ID, organizationNode, WEBSITE_ID, websiteNode } from "@/lib/json-ld";
import { SITE } from "@/lib/site";

// Автор и издатель — организация (тот же @id, что на лендинге). Без
// Person, рецензента и полей проверки: подпись на сайте — только команда.

function breadcrumb(lang: BlogLocale, url: string, post?: Post) {
  const ui = BLOG_UI[lang];
  const items = [
    { name: ui.home, item: `${SITE.origin}/${lang}` },
    { name: ui.blog, item: `${SITE.origin}${blogPath(lang)}` },
    ...(post ? [{ name: post.title, item: url }] : []),
  ];
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function coverUrl(post: Post): string {
  return `${SITE.origin}${post.cover}`;
}

export function buildPostGraph(post: Post) {
  const url = `${SITE.origin}${postPath(post.lang, post.slug)}`;
  const pageId = `${url}#webpage`;
  const image = {
    "@type": "ImageObject",
    url: coverUrl(post),
    width: 1200,
    height: 630,
    caption: post.coverAlt || undefined,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      websiteNode(),
      {
        "@type": "WebPage",
        "@id": pageId,
        url,
        name: post.title,
        description: post.description,
        inLanguage: post.lang,
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: image,
        datePublished: isoDateTime(post.date),
        dateModified: isoDateTime(post.updated),
      },
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: isoDateTime(post.date),
        dateModified: isoDateTime(post.updated),
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: { "@id": pageId },
        image,
        inLanguage: post.lang,
        articleSection: BLOG_CATEGORIES[post.category][post.lang],
        keywords: post.tags.length ? post.tags : undefined,
        wordCount: post.wordCount,
        isAccessibleForFree: true,
      },
      breadcrumb(post.lang, url, post),
    ],
  };
}

export function buildBlogIndexGraph(lang: BlogLocale, posts: Post[]) {
  const url = `${SITE.origin}${blogPath(lang)}`;
  const ui = BLOG_UI[lang];
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      websiteNode(),
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: ui.title,
        description: ui.description,
        inLanguage: lang,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORG_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE.origin}${postPath(post.lang, post.slug)}`,
            name: post.title,
          })),
        },
      },
      breadcrumb(lang, url),
    ],
  };
}
