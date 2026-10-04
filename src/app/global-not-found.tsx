import "@/app/globals.css";
import type { Metadata } from "next";
import { geist } from "@/app/fonts";
import { LANGUAGE_OPTIONS } from "@/i18n/config";
import { SITE } from "@/lib/site";

// 404 для любого непререндеренного пути (/xx, /kk/x, /nonsense). Корневой
// layout живёт под [lang], поэтому язык неизвестен — текст на всех трёх.
export const metadata: Metadata = {
  title: `404 | ${SITE.brand}`,
  robots: { index: false, follow: true },
};

const MESSAGES = [
  { lang: "kk", title: "Бет табылмады", text: "Мұндай бет жоқ немесе ол көшірілген." },
  { lang: "ru", title: "Страница не найдена", text: "Такой страницы нет или она переехала." },
  { lang: "en", title: "Page not found", text: "This page does not exist or has moved." },
];

export default function GlobalNotFound() {
  return (
    <html lang="kk" className={geist.variable}>
      <body>
        <main className="not-found section-pad">
          {/* Корень — редирект на язык (cookie, затем язык браузера) с другим
              корневым layout: нужна полная загрузка документа, а не Link. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="brand" href="/" aria-label={SITE.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/landing/new-bilimai-logo.svg" alt={SITE.brand} />
          </a>
          <p className="not-found__code">404</p>
          {MESSAGES.map(({ lang, title, text }, index) => (
            <section className="not-found__message" lang={lang} key={lang}>
              {index === 0 ? <h1>{title}</h1> : <h2>{title}</h2>}
              <p>{text}</p>
            </section>
          ))}
          <nav className="not-found__links" aria-label="Bilim AI">
            {LANGUAGE_OPTIONS.map((option) => (
              <a
                className="button button--primary"
                href={`/${option.code}`}
                hrefLang={option.code}
                lang={option.code}
                key={option.code}
              >
                {option.label}
              </a>
            ))}
          </nav>
        </main>
      </body>
    </html>
  );
}
