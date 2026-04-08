import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { NotFoundPage } from "@/components/NotFoundPage";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];
const locales = new Set<Locale>(routing.locales);

export default async function RootNotFound() {
  const localeHeader = (await headers()).get("X-NEXT-INTL-LOCALE");
  const locale = locales.has(localeHeader as Locale)
    ? (localeHeader as Locale)
    : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundPage />
    </NextIntlClientProvider>
  );
}
