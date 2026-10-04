// Зеркало контракта пакета блога. Источник истины — бэкенд:
// ai_platform_back/apps/blog/bundle.py (FORMAT_VERSION = 1), правила —
// apps/blog/lint.py, текст — docs/ru/apps/BLOG.md §«Контракт пакета».
// Меняется формат на бэкенде — правится и этот каталог.
//
// Здесь нет node:fs и path-алиасов: модуль импортирует next.config.ts.

// Блог временно выключен (05.10.2026): ссылок на него нет ни на лендинге,
// ни в sitemap, ни в <head>, а /<lang>/blog* и /<lang>/feed.xml временно
// (307) ведут на главную языка. Код и посты остаются и валидируются при
// сборке. Включить: true + вернуть строку Blog в public/llms.txt
// (docs/ru/BLOG.md, «Временное отключение»).
export const BLOG_ENABLED = false;

// В файлах версия не пишется; новый ключ фронтматтера = версия 2.
export const BLOG_FORMAT_VERSION = 1;

// = bundle.LANGS. Английский интерфейс ведёт на /ru/blog.
export const BLOG_LOCALES = ["ru", "kk"] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

export function isBlogLocale(value: string): value is BlogLocale {
  return (BLOG_LOCALES as ReadonlyArray<string>).includes(value);
}

// Точная копия apps/blog/models.py::CATEGORY_LABELS.
export const BLOG_CATEGORIES = {
  "lesson-ideas": { ru: "Идеи для уроков", kk: "Сабақ идеялары" },
  planning: { ru: "Планирование (ҚМЖ)", kk: "Жоспарлау (ҚМЖ)" },
  assessment: { ru: "Оценивание (БЖБ/ТЖБ)", kk: "Бағалау (БЖБ/ТЖБ)" },
  "ai-in-school": { ru: "ИИ в школе", kk: "Мектептегі ЖИ" },
  "bilimai-news": { ru: "Новости Bilim AI", kk: "Bilim AI жаңалықтары" },
} as const;
export type BlogCategory = keyof typeof BLOG_CATEGORIES;

export function isBlogCategory(value: string): value is BlogCategory {
  return Object.prototype.hasOwnProperty.call(BLOG_CATEGORIES, value);
}

// Ровно 13 ключей в порядке бандла (порядок не проверяется).
export const FRONTMATTER_KEYS = [
  "title",
  "description",
  "date",
  "updated",
  "author",
  "group",
  "category",
  "tags",
  "cover",
  "coverAlt",
  "generatedBy",
  "readingMinutes",
  "draft",
] as const;
export type FrontmatterKey = (typeof FRONTMATTER_KEYS)[number];
export const OPTIONAL_KEYS: ReadonlySet<FrontmatterKey> = new Set([
  "updated",
  "generatedBy",
  "readingMinutes",
]);

export type BlogFrontmatter = {
  title: string;
  description: string;
  // YYYY-MM-DD, строкой: день первой выгрузки по Asia/Almaty.
  date: string;
  updated?: string;
  author: string;
  group: string;
  category: BlogCategory;
  // Нелокализованные коды; на странице не показываются.
  tags: string[];
  cover: string;
  coverAlt: string;
  // Служебная метка, нигде не выводится.
  generatedBy?: string;
  readingMinutes?: number;
  draft: boolean;
};

// Пороги apps/blog/lint.py.
export const TITLE_MAX = 70;
export const DESCRIPTION_MIN = 50;
export const DESCRIPTION_MAX = 160;
export const BODY_WORDS_MIN = 600;
export const BODY_WORDS_MAX = 1800;
export const KK_LENGTH_RATIO = [0.8, 1.25] as const;
export const COVER_MAX_BYTES = 300 * 1024;
export const KK_MIN_DENSITY = 0.03;
export const KK_SECTION_MIN_LETTERS = 40;
export const ALLOWED_HOSTS = ["app.bilimai.kz", "bilimai.kz"] as const;

// Обложка, которую пишет бэкенд: 1200×630 JPEG.
export const COVER_SIZE = { width: 1200, height: 630 } as const;

// Последний раздел поста по контракту docs/ru/apps/BLOG.md.
export const SUMMARY_HEADINGS: Record<BlogLocale, string> = {
  ru: "Итог для учителя",
  kk: "Мұғалімге қорытынды",
};
