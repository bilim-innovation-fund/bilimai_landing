import type { Locale } from "@/i18n/config";

export type LocaleMeta = {
  // <title> и og:title, до 60 символов.
  title: string;
  // meta description, 120–158 символов.
  description: string;
  keywords: string[];
  // Тексты OG-картинки (src/app/[lang]/opengraph-image.tsx).
  og: { headline: string; tagline: string; footer: string };
};

// Версия текстов OG-картинки. Менять вместе с комментарием og-rev в
// src/app/[lang]/opengraph-image.tsx: индекс блога ссылается на картинку
// явно (?v=OG_REV), без хеша, который Next считает по файлу картинки.
export const OG_REV = "2026-10-05";

export const META: Record<Locale, LocaleMeta> = {
  kk: {
    title: "ҚМЖ, БЖБ және ТЖБ — мұғалімдерге арналған ЖИ | Bilim AI",
    description:
      "ҚМЖ, ОМЖ, КТЖ жоспарлары, сабақтар мен слайдтар, БЖБ/ТЖБ тесттері және қағаз жұмыстарын фото арқылы тексеру — Bilim AI, Қазақстан мұғалімдеріне арналған ЖИ.",
    keywords: ["ҚМЖ", "БЖБ", "ТЖБ", "ҰМЖ", "ОМЖ", "КТЖ", "сабақ жоспары", "мұғалімге арналған жасанды интеллект"],
    og: {
      headline: "Заманауи оқыту мен оқуға арналған біртұтас кеңістік",
      tagline: "ҚМЖ, БЖБ және ТЖБ — мұғалімдерге арналған ЖИ платформасы",
      footer: "Қазақстан мұғалімдеріне арналған ЖИ",
    },
  },
  ru: {
    title: "Генератор КСП, СОР и СОЧ для учителей Казахстана | Bilim AI",
    description:
      "КСП, ССП и КТП, уроки и презентации, тесты СОР/СОЧ с проверкой работ по фото — Bilim AI, ИИ-платформа для учителей Казахстана. Казахский, русский, английский.",
    keywords: ["КСП", "СОР", "СОЧ", "КТП", "ССП", "ДСП", "генератор КСП", "ИИ для учителей"],
    og: {
      headline: "Единое пространство для современного учебного процесса",
      tagline: "КСП, СОР и СОЧ — ИИ-платформа для учителей Казахстана",
      footer: "ИИ-платформа для учителей Казахстана",
    },
  },
  en: {
    title: "AI Lesson Planning for Teachers in Kazakhstan | Bilim AI",
    description:
      "AI platform for school teachers in Kazakhstan: curriculum plans (ҚМЖ/КСП), lessons, slides and СОР/СОЧ tests with photo grading. Kazakh, Russian and English.",
    keywords: ["AI for teachers Kazakhstan", "lesson plan generator", "ҚМЖ", "КСП", "СОР СОЧ"],
    og: {
      headline: "One connected space for modern teaching and learning",
      tagline: "AI lesson planning platform for teachers in Kazakhstan",
      footer: "AI platform for teachers in Kazakhstan",
    },
  },
};
