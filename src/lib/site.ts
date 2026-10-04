// Факты о сайте, не зависящие от языка. Env на Vercel нам недоступен,
// поэтому продовые адреса зашиты здесь.
//
// Неизвестные юридические факты оставлять undefined: JSON.stringify их
// выбрасывает, и в JSON-LD не попадает ни «TODO», ни пустая строка.
// Заполнить, когда будут известны: legalName, email, telephone, address,
// foundingDate.
export const SITE = {
  origin: "https://bilimai.kz",
  // Корень с завершающим слэшем: x-default и url сущностей.
  root: "https://bilimai.kz/",
  appOrigin: "https://app.bilimai.kz",
  apiOrigin: "https://api.app.bilimai.kz",
  brand: "Bilim AI",
  alternateNames: ["BilimAI", "Білім AI", "Билим AI"],
  sameAs: ["https://github.com/bilim-innovation-fund"],
  logo: { url: "/icons/icon-512.png", width: 512, height: 512 },
  languages: ["kk", "ru", "en"],
  themeColor: "#f5f6f4",
  // Дата последней содержательной правки текстов лендинга:
  // dateModified в JSON-LD и lastModified в sitemap.
  contentUpdatedAt: "2026-10-05",
  privacyUrl: "https://app.bilimai.kz/privacy",
  legalName: undefined as string | undefined,
  email: undefined as string | undefined,
  telephone: undefined as string | undefined,
  foundingDate: undefined as string | undefined,
  address: undefined as
    | { streetAddress: string; addressLocality: string; postalCode?: string }
    | undefined,
} as const;
