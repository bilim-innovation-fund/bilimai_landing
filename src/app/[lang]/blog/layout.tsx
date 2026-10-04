import { notFound } from "next/navigation";
import { BlogFooter, BlogHeader } from "@/components/blog/BlogChrome";
import { isBlogLocale } from "@/lib/blog/types";

// Блог только на ru и kk. /en/blog тоже пререндерится (kk|ru|en приходят из
// корневого layout), но в рантайме его перехватывает редирект на /ru/blog
// в next.config.ts.
export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isBlogLocale(lang)) notFound();

  return (
    <>
      <BlogHeader lang={lang} />
      <main id="main" className="blog section-pad">
        {children}
      </main>
      <BlogFooter lang={lang} />
    </>
  );
}
