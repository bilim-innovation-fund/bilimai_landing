import { notFound } from "next/navigation";
import { isBlogLocale } from "@/lib/blog/types";

// Блог только на ru и kk. /en/blog тоже пререндерится (kk|ru|en приходят из
// корневого layout), но в рантайме его перехватывает редирект на /ru/blog
// в next.config.ts. Шапку и подвал рендерят страницы: языковые ссылки у
// поста ведут на его перевод, а layout не знает slug.
export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isBlogLocale(lang)) notFound();

  return children;
}
