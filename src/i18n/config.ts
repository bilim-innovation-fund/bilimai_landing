// Безопасно и для сервера, и для клиента: здесь нет словарей.
export const LOCALES = ["kk", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "kk";

// Явный выбор языка в переключателе. Корень "/" редиректит по нему
// (next.config.ts), простой просмотр страницы его не пишет.
export const LOCALE_COOKIE = "bilim-lang";

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  code: Locale;
  short: string;
  label: string;
}> = [
  { code: "kk", short: "ҚАЗ", label: "Қазақша" },
  { code: "ru", short: "RU", label: "Русский" },
  { code: "en", short: "EN", label: "English" },
];

export const OG_LOCALE: Record<Locale, string> = {
  kk: "kk_KZ",
  ru: "ru_RU",
  en: "en_US",
};

export function hasLocale(value: string): value is Locale {
  return (LOCALES as ReadonlyArray<string>).includes(value);
}
