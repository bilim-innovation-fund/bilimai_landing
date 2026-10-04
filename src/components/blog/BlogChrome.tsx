import { BLOG_LOCALES, type BlogLocale } from "@/lib/blog/types";
import { blogPath, type Post, postPath } from "@/lib/blog/posts";
import { BLOG_UI } from "@/lib/blog/ui";
import { SITE } from "@/lib/site";

// Шапка и подвал блога — серверные, на классах лендинга (.nav-shell,
// .brand, .footer). Без клиентского JS: блог — статический текст. Их
// рендерит страница, а не layout: только она знает, куда вести языковые
// ссылки (у поста — на его перевод).

const LANGUAGE_LABEL: Record<BlogLocale, { long: string; short: string }> = {
  ru: { long: "Русский", short: "RU" },
  kk: { long: "Қазақша", short: "ҚАЗ" },
};
const LOGO = "/images/landing/new-bilimai-logo.svg";

export type LanguageLink = { lang: BlogLocale; href: string; current: boolean };

// Языковые версии индекса блога.
export function indexLanguages(lang: BlogLocale): LanguageLink[] {
  return BLOG_LOCALES.map((code) => ({ lang: code, href: blogPath(code), current: code === lang }));
}

// Языковые версии поста: перевод, если он есть, иначе индекс блога.
export function postLanguages(post: Post, translations: Post[]): LanguageLink[] {
  return BLOG_LOCALES.map((code) => {
    const other = translations.find((t) => t.lang === code);
    return {
      lang: code,
      href: other ? postPath(other.lang, other.slug) : blogPath(code),
      current: code === post.lang,
    };
  });
}

function LanguageLinks({ languages, compact }: { languages: LanguageLink[]; compact?: boolean }) {
  return (
    <>
      {languages.map(({ lang, href, current }) => (
        <a
          key={lang}
          href={href}
          hrefLang={lang}
          lang={lang}
          aria-current={current ? "page" : undefined}
          aria-label={compact ? LANGUAGE_LABEL[lang].long : undefined}
        >
          {compact ? (
            <>
              <span className="blog-lang__long">{LANGUAGE_LABEL[lang].long}</span>
              <span className="blog-lang__short">{LANGUAGE_LABEL[lang].short}</span>
            </>
          ) : (
            LANGUAGE_LABEL[lang].long
          )}
        </a>
      ))}
    </>
  );
}

export function BlogHeader({
  lang,
  languages,
  isIndex,
}: {
  lang: BlogLocale;
  languages: LanguageLink[];
  isIndex: boolean;
}) {
  const ui = BLOG_UI[lang];
  return (
    <header className="site-header" id="top">
      <nav className="nav-shell blog-nav" aria-label={ui.mainNav}>
        <a className="brand" href={`/${lang}`} aria-label={`Bilim AI — ${ui.home}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Bilim AI" />
        </a>
        <div className="blog-nav__links">
          <a href={`/${lang}`}>{ui.home}</a>
          <a href={blogPath(lang)} aria-current={isIndex ? "page" : undefined}>
            {ui.blog}
          </a>
          <a href={`${SITE.appOrigin}/marketplace`}>{ui.gallery}</a>
        </div>
        <div className="blog-nav__aside">
          <span className="blog-nav__languages" role="group" aria-label={ui.language}>
            <LanguageLinks languages={languages} compact />
          </span>
          <a className="nav-login" href={`${SITE.appOrigin}/login`}>
            {ui.login}
          </a>
        </div>
      </nav>
    </header>
  );
}

export function BlogFooter({ lang, languages }: { lang: BlogLocale; languages: LanguageLink[] }) {
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
            <LanguageLinks languages={languages} />
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Bilim AI</span>
      </div>
    </footer>
  );
}
