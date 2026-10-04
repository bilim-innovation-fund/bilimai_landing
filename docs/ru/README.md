# Документация лендинга bilimai.kz

Этот каталог описывает текущее устройство маркетингового сайта https://bilimai.kz (Next.js 16, App Router, деплой на Vercel по push в `main`) и правила его изменения.

## Документы

1. [SEO.md](./SEO.md) — языковые версии и маршруты, метаданные, JSON-LD, OG-картинки, robots/sitemap/llms.txt, шрифты и изображения, чек-лист проверки.
2. [BLOG.md](./BLOG.md) — блог на MDX: как приходят посты из бэкенда, формат файлов, валидатор, публикация и снятие постов.

## Когда обновлять документацию

- При добавлении или удалении языка, изменении маршрутов `src/app/[lang]` или правил редиректа корня в `next.config.ts` — [SEO.md](./SEO.md).
- При изменении источников метаданных (`src/i18n/meta.ts`, `src/lib/site.ts`, `src/lib/json-ld.ts`, `src/content/landing.js`), OG-картинки, `robots.txt`, `sitemap.ts`, `manifest.ts`, `public/llms.txt` — [SEO.md](./SEO.md).
- При смене формата пакета блога на бэкенде (`FORMAT_VERSION` в `ai_platform_back/apps/blog/bundle.py`), правил валидатора (`src/lib/blog/validate.ts`), маршрутов блога или процесса публикации — [BLOG.md](./BLOG.md).
- При изменении фактов о продукте (стадия, цены, языки, название «Галерея материалов») — тексты в коде, `public/llms.txt` и [SEO.md](./SEO.md) правятся вместе.
