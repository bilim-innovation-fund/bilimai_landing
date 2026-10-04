import type { BlogLocale } from "@/lib/blog/types";

// Тексты интерфейса блога. Лендинг держит словари с ключом-ru-строкой, а у
// блога своих строк немного и только два языка — проще так.
export const BLOG_UI: Record<
  BlogLocale,
  {
    blog: string;
    home: string;
    title: string;
    heading: string;
    description: string;
    allPosts: string;
    updated: string;
    minutes: (n: number) => string;
    related: string;
    empty: string;
    rss: string;
    gallery: string;
    login: string;
    language: string;
    footer: string;
  }
> = {
  ru: {
    blog: "Блог",
    home: "Главная",
    title: "Блог Bilim AI — статьи для учителей Казахстана",
    heading: "Блог для учителей",
    description:
      "Статьи для учителей Казахстана: планирование КСП, СОР и СОЧ, идеи для уроков и ИИ в школе — от команды Bilim AI.",
    allPosts: "Все статьи",
    updated: "обновлено",
    minutes: (n) => `${n} мин`,
    related: "Читайте также",
    empty: "Первые статьи скоро появятся.",
    rss: "RSS",
    gallery: "Галерея материалов",
    login: "Войти",
    language: "Язык",
    footer: "ИИ-платформа для учителей Казахстана.",
  },
  kk: {
    blog: "Блог",
    home: "Басты бет",
    title: "Bilim AI блогы — Қазақстан мұғалімдеріне арналған мақалалар",
    heading: "Мұғалімдерге арналған блог",
    description:
      "Қазақстан мұғалімдеріне арналған мақалалар: ҚМЖ жоспарлау, БЖБ мен ТЖБ, сабақ идеялары және мектептегі ЖИ — Bilim AI командасынан.",
    allPosts: "Барлық мақалалар",
    updated: "жаңартылды",
    minutes: (n) => `${n} мин`,
    related: "Тағы оқыңыз",
    empty: "Алғашқы мақалалар жақында шығады.",
    rss: "RSS",
    gallery: "Материалдар галереясы",
    login: "Кіру",
    language: "Тіл",
    footer: "Қазақстан мұғалімдеріне арналған ЖИ платформасы.",
  },
};

const DATE_LOCALE: Record<BlogLocale, string> = { ru: "ru-RU", kk: "kk-KZ" };

// YYYY-MM-DD → «28 сентября 2026 г.» / «2026 ж. 28 қыркүйек». Дата —
// календарный день, поэтому форматируем в UTC без сдвига.
export function formatDate(date: string, lang: BlogLocale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
