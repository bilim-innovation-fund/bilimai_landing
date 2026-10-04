import "server-only";

import type { Locale } from "@/i18n/config";
import { META, type LocaleMeta } from "@/i18n/meta";
import { kk, ru, en } from "@/i18n/messages";
import { createTranslator, type Messages, type Translate } from "@/i18n/translate";

const DICTIONARIES: Record<Locale, Messages> = { kk, ru, en };

export function getDictionary(lang: Locale): Messages {
  return DICTIONARIES[lang];
}

export function getTranslator(lang: Locale): Translate {
  return createTranslator(DICTIONARIES[lang]);
}

export function getMeta(lang: Locale): LocaleMeta {
  return META[lang];
}
