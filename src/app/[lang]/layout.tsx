import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { geist } from "@/app/fonts";
import { hasLocale, LOCALES } from "@/i18n/config";
import { SITE } from "@/lib/site";

// Только kk|ru|en, всё пререндерится; любой другой первый сегмент — 404
// (global-not-found.tsx).
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  applicationName: SITE.brand,
  title: { default: SITE.brand, template: `%s | ${SITE.brand}` },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
};

// Класс js ставится до разбора остального body: без JS блоки с
// data-reveal остаются видимыми (см. globals.css), с JS — анимируются.
const JS_FLAG_SCRIPT = "document.body.classList.add('js')";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={geist.variable}>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
