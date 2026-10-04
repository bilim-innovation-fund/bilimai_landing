import type { JSX } from "react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/translate";

// Landing.jsx — JS без checkJs: без этого объявления TypeScript не
// проверял бы пропсы на стороне src/app/[lang]/page.tsx.
export default function Landing(props: {
  lang: Locale;
  messages: Messages;
}): JSX.Element;
