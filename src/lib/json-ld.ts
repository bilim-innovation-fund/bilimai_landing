import type { Locale } from "@/i18n/config";
import type { LocaleMeta } from "@/i18n/meta";
import type { Translate } from "@/i18n/translate";
import { ABOUT_CAPSULE, FAQ_ITEMS } from "@/content/landing";
import { SITE } from "@/lib/site";

// Общие @id сущностей: на них ссылаются и лендинг, и блог. SITE.root уже
// оканчивается на "/", строку не собирать заново.
export const ORG_ID = `${SITE.root}#organization`;
export const WEBSITE_ID = `${SITE.root}#website`;
export const APP_ID = `${SITE.root}#app`;

export function organizationNode(description?: string) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.brand,
    alternateName: SITE.alternateNames,
    url: SITE.root,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.origin}${SITE.logo.url}`,
      width: SITE.logo.width,
      height: SITE.logo.height,
    },
    description,
    sameAs: SITE.sameAs,
    knowsLanguage: SITE.languages,
    areaServed: { "@type": "Country", name: "Kazakhstan" },
    legalName: SITE.legalName,
    email: SITE.email,
    telephone: SITE.telephone,
    foundingDate: SITE.foundingDate,
    address: SITE.address && { "@type": "PostalAddress", addressCountry: "KZ", ...SITE.address },
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.root,
    name: SITE.brand,
    alternateName: SITE.alternateNames,
    inLanguage: SITE.languages,
    publisher: { "@id": ORG_ID },
  };
}

// Граф главной страницы. Тексты FAQ идут через тот же t(), что и разметка,
// поэтому совпадают с видимыми <details>.
export function buildHomeGraph({
  lang,
  t,
  meta,
}: {
  lang: Locale;
  t: Translate;
  meta: LocaleMeta;
}) {
  const url = `${SITE.origin}/${lang}`;
  const pageId = `${url}#webpage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(t(ABOUT_CAPSULE)),
      websiteNode(),
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": APP_ID,
        name: SITE.brand,
        url: SITE.appOrigin,
        description: meta.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: SITE.languages,
        audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KZT",
          // Регистрация закрыта: работают пилотные школы, остальные —
          // в списке ожидания.
          availability: "https://schema.org/LimitedAvailability",
          description: "Early access: pilot schools now, waitlist for other teachers",
        },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: lang,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": APP_ID },
        dateModified: SITE.contentUpdatedAt,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#faq`,
        inLanguage: lang,
        isPartOf: { "@id": pageId },
        mainEntity: FAQ_ITEMS.map(([question, answer]) => ({
          "@type": "Question",
          name: t(question),
          acceptedAnswer: { "@type": "Answer", text: t(answer) },
        })),
      },
    ],
  };
}
