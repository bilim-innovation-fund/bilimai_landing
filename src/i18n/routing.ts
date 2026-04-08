import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "kk", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
