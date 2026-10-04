# Bilim AI Landing

Маркетинговый сайт https://bilimai.kz на Next.js 16 (App Router, Turbopack): лендинг на казахском, русском и английском (`/kk`, `/ru`, `/en`) и блог для учителей (`/ru/blog`, `/kk/blog`). Деплой — Vercel по push в `main`.

## Разработка

`pnpm` ставится через corepack. Lockfile собран pnpm 10 (`lockfileVersion 9.0`, им же собирает Vercel), поэтому версия указывается явно:

```bash
corepack pnpm@10.34.6 install
corepack pnpm@10.34.6 dev
```

Сайт откроется на `http://localhost:3000` и редиректнет на `/kk`, `/ru` или `/en` по языку браузера.

Сборка и проверки:

```bash
corepack pnpm@10.34.6 build        # заодно валидирует посты блога
corepack pnpm@10.34.6 start
corepack pnpm@10.34.6 lint
corepack pnpm@10.34.6 exec tsc --noEmit
```

## Окружение

Доступа к env-переменным Vercel у команды нет, поэтому продовые адреса зашиты в код (`https://bilimai.kz`, `https://app.bilimai.kz`, `https://api.app.bilimai.kz` — `src/lib/site.ts` и фолбэки в `src/components/landing/Landing.jsx`). `.env.local` нужен только для dev-стенда (см. `.env.example`): переменные `NEXT_PUBLIC_*` перебивают прод-фолбэки. Прод-сборку с ними не делайте.

## Документация

- [docs/ru/README.md](docs/ru/README.md) — индекс.
- [docs/ru/SEO.md](docs/ru/SEO.md) — языки, метаданные, JSON-LD, OG-картинки, robots/sitemap/llms.txt, чек-лист проверки.
- [docs/ru/BLOG.md](docs/ru/BLOG.md) — как публиковать посты из бэкенда, формат файлов и валидатор.
