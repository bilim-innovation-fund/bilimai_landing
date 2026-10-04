import { BLOG_LOCALES, type BlogLocale } from "@/lib/blog/types";
import { blogPath } from "@/lib/blog/posts";
import { BLOG_UI } from "@/lib/blog/ui";
import { SITE } from "@/lib/site";

// Шапка и подвал блога — серверные, на классах лендинга (.nav-shell,
// .brand, .footer). Без клиентского JS: блог — статический текст.

const LANGUAGE_LABEL: Record<BlogLocale, string> = { ru: "Русский", kk: "Қазақша" };
const LOGO = "/images/landing/new-bilimai-logo.svg";

function LanguageLinks({ lang }: { lang: BlogLocale }) {
  return (
    <>
      {BLOG_LOCALES.map((code) => (
        <a
          key={code}
          href={blogPath(code)}
          hrefLang={code}
          lang={code}
          aria-current={code === lang ? "page" : undefined}
        >
          {LANGUAGE_LABEL[code]}
        </a>
      ))}
    </>
  );
}

export function BlogHeader({ lang }: { lang: BlogLocale }) {
  const ui = BLOG_UI[lang];
  return (
    <header className="site-header" id="top">
      <nav className="nav-shell blog-nav" aria-label={ui.blog}>
        <a className="brand" href={`/${lang}`} aria-label={`Bilim AI — ${ui.home}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Bilim AI" />
        </a>
        <div className="blog-nav__links">
          <a href={`/${lang}`}>{ui.home}</a>
          <a href={blogPath(lang)} aria-current="page">
            {ui.blog}
          </a>
          <a href={`${SITE.appOrigin}/marketplace`}>{ui.gallery}</a>
        </div>
        <div className="blog-nav__aside">
          <span className="blog-nav__languages" aria-label={ui.language}>
            <LanguageLinks lang={lang} />
          </span>
          <a className="nav-login" href={`${SITE.appOrigin}/login`}>
            {ui.login}
          </a>
        </div>
      </nav>
    </header>
  );
}

export function BlogFooter({ lang }: { lang: BlogLocale }) {
  const ui = BLOG_UI[lang];
  return (
    <footer className="footer section-pad blog-footer">
      <div className="footer__top">
        <div className="footer__brand">
          <a className="brand" href={`/${lang}`} aria-label={`Bilim AI — ${ui.home}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Bilim AI" />
          </a>
          <p>{ui.footer}</p>
        </div>
        <div className="footer__links">
          <div>
            <strong>Bilim AI</strong>
            <a href={`/${lang}`}>{ui.home}</a>
            <a href={blogPath(lang)}>{ui.blog}</a>
            <a href={`${SITE.appOrigin}/marketplace`}>{ui.gallery}</a>
            <a href={`/${lang}/feed.xml`} type="application/rss+xml">
              {ui.rss}
            </a>
          </div>
          <div>
            <strong>{ui.language}</strong>
            <LanguageLinks lang={lang} />
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Bilim AI</span>
      </div>
    </footer>
  );
}
