import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Landing from "@/components/landing/Landing";
import { JsonLd } from "@/components/seo/JsonLd";
import { hasLocale, LOCALES, OG_LOCALE } from "@/i18n/config";
import { getDictionary, getMeta, getTranslator } from "@/i18n/dictionaries";
import { BLOG_ENABLED } from "@/lib/blog/types";
import { buildHomeGraph } from "@/lib/json-ld";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const meta = getMeta(lang);

  return {
    title: { absolute: meta.title },
    description: meta.description,
    keywords: meta.keywords,
    category: "education",
    alternates: {
      canonical: `/${lang}`,
      languages: {
        kk: "/kk",
        ru: "/ru",
        en: "/en",
        "x-default": SITE.root,
      },
      // Блог только на ru и kk: английская главная ссылается на русскую ленту.
      ...(BLOG_ENABLED
        ? { types: { "application/rss+xml": `/${lang === "en" ? "ru" : lang}/feed.xml` } }
        : {}),
    },
    // images не задаём: их подставляет opengraph-image.tsx, а явный
    // openGraph.images отключил бы файловую конвенцию.
    openGraph: {
      type: "website",
      siteName: SITE.brand,
      url: `/${lang}`,
      title: meta.title,
      description: meta.description,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <>
      <JsonLd
        data={buildHomeGraph({
          lang,
          t: getTranslator(lang),
          meta: getMeta(lang),
        })}
      />
      <Landing lang={lang} messages={getDictionary(lang)} />
    </>
  );
}
