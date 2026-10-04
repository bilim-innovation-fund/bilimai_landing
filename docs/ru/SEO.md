# SEO и GEO лендинга

## Назначение

Лендинг отдаётся поисковикам (Google, Яндекс) и ИИ-краулерам (GPTBot, ClaudeBot, PerplexityBot — они не исполняют JS) как статический HTML на трёх языках. Инварианты:

- один URL на язык: `/kk`, `/ru`, `/en`; весь текст страницы есть в SSR-HTML;
- все страницы пререндерятся при сборке; единственный динамический маршрут — `ƒ /api/waitlist`;
- факты о продукте одинаковы в тексте, JSON-LD и `public/llms.txt`;
- продовые адреса зашиты в код: доступа к env-переменным Vercel у команды нет.

---

## Языки и маршруты

| Путь | Что отдаёт |
|---|---|
| `/` | 307 на язык: cookie `bilim-lang` → первый тег `Accept-Language` (`kk`/`ru`/`en`) → `/kk`. Правила — `redirects()` в `next.config.ts` |
| `/kk`, `/ru`, `/en` | главная; корневой layout `src/app/[lang]/layout.tsx` (`generateStaticParams`, `dynamicParams = false`, `<html lang>`) |
| `/kk/`, `/ru/` … | 308 на путь без слэша (поведение Next по умолчанию) |
| любой другой путь | 404 с `noindex` из `src/app/global-not-found.tsx` (флаг `experimental.globalNotFound`), текст на трёх языках |
| `/{ru,kk}/blog…` | блог, см. [BLOG.md](./BLOG.md); `/en/blog*` → 307 на `/ru/blog*` |

Конфигурация языков — `src/i18n/config.ts`: `LOCALES`, `DEFAULT_LOCALE = "kk"`, `LOCALE_COOKIE = "bilim-lang"`, `LANGUAGE_OPTIONS`, `OG_LOCALE`. Модуль импортирует и `next.config.ts`, поэтому в нём нет path-алиасов.

**Переключатель языков** (`LanguageSwitcher` в `src/components/landing/Landing.jsx`):

- пункты — обычные ссылки `<a href="/ru" hrefLang lang aria-current>` с полной загрузкой документа (новый `<html lang>` и метаданные);
- меню всегда есть в разметке и закрыто атрибутом `hidden`, поэтому ссылки на языковые версии видны краулерам. Правило `.language-switcher__menu[hidden] { display: none }` обязательно: `display: flex` перебивает стиль `[hidden]` браузера;
- cookie `bilim-lang` пишется только при явном выборе; простой просмотр страницы её не трогает;
- на экранах ≤ 960 px меню стоит в потоке внутри бургер-панели (у панели `overflow: hidden`).

**Словари**: `src/i18n/messages.js` (`kk`, `ru`, `en`); ключ — исходная русская строка, без перевода показывается ключ. В клиент уходит только словарь текущего языка: `[lang]/page.tsx` передаёт его в `Landing` пропсом `messages`. Серверный доступ — `src/i18n/dictionaries.ts` (`server-only`: `getDictionary`, `getTranslator`, `getMeta`).

**Статический рендер.** Под `src/app/[lang]` и в `src/lib` нельзя использовать `headers()`, `cookies()`, `searchParams`, `connection()` и некэшируемый `fetch` — иначе страницы перестанут пререндериться. Пререндеренные страницы не стримят metadata, поэтому `htmlLimitedBots` не задаётся.

---

## Источники истины

| Что | Где |
|---|---|
| title, description, keywords, тексты OG-картинки по языкам | `src/i18n/meta.ts` (`META`) |
| факты о сайте: адреса, бренд, `alternateNames`, `sameAs`, логотип, `contentUpdatedAt`, юридические поля | `src/lib/site.ts` (`SITE`) |
| FAQ, капсула «Что такое Bilim AI?», eyebrow над h1 | `src/content/landing.js` (`FAQ_ITEMS`, `ABOUT_TITLE`, `ABOUT_CAPSULE`, `HERO_EYEBROW`); переводы — в `messages.js` |
| граф JSON-LD главной | `src/lib/json-ld.ts` (`buildHomeGraph`) |
| OG-картинка | `src/app/[lang]/opengraph-image.tsx` |
| sitemap | `src/app/sitemap.ts` |
| robots.txt | `src/app/robots.txt` (статический файл) |
| manifest | `src/app/manifest.ts` |
| текст для LLM | `public/llms.txt` (отдаётся с `X-Robots-Tag: noindex`, `next.config.ts` → `headers()`) |

Неизвестные юридические факты (`legalName`, `email`, `telephone`, `address`, `foundingDate`) остаются `undefined`: `JSON.stringify` их выбрасывает, и в JSON-LD не попадает ни «TODO», ни пустая строка.

**`contentUpdatedAt`** — дата последней содержательной правки текстов лендинга. Она идёт в `dateModified` графа и в `lastModified` sitemap; при правке текстов её нужно обновить.

**Факты о продукте** (решение от 05.10.2026):

- стадия — ранний доступ: работают пилотные школы, остальные — в списке ожидания; регистрация закрыта;
- раздел с уроками называется «Галерея материалов» / «Материалдар галереясы» / «Materials gallery», URL `https://app.bilimai.kz/marketplace`;
- цены и тарифы не называются.

Тексты FAQ, eyebrow, `llms.txt` и `Offer` в JSON-LD меняются вместе.

---

## Метаданные страницы

`src/app/[lang]/page.tsx` → `generateMetadata`:

- `title.absolute`;
- `canonical` = `/<lang>`;
- `alternates.languages` = kk, ru, en и `x-default` → корень `https://bilimai.kz` (Next пишет его без слэша — это тот же URL);
- `alternates.types` — RSS: для `en` — `/ru/feed.xml`;
- `openGraph`: `type`, `locale`, `alternateLocale`, `url`;
- `twitter`: `summary_large_image`.

`metadataBase`, `robots` и `viewport` заданы в `src/app/[lang]/layout.tsx`.

> **Примечание:** на главной `openGraph.images` не задаётся никогда. Картинку подставляет файловая конвенция `opengraph-image.tsx`, а явный `images` её отключает. Индекс блога и посты — исключение: там `images` задан явно (см. [BLOG.md](./BLOG.md)).

---

## JSON-LD

Граф одного `<script type="application/ld+json">` на главной (`src/components/seo/JsonLd.tsx` экранирует `<`; `next/script` не используется). Вторая копия строки в HTML — это RSC-payload, так и должно быть.

| Узел | `@id` | Суть |
|---|---|---|
| `Organization` | `https://bilimai.kz/#organization` (`ORG_ID`) | name, alternateName, url, logo `/icons/icon-512.png`, description = капсула, sameAs, knowsLanguage, areaServed KZ |
| `WebSite` | `https://bilimai.kz/#website` (`WEBSITE_ID`) | name, alternateName (Google site names), inLanguage, publisher |
| `WebApplication` + `SoftwareApplication` | `https://bilimai.kz/#app` (`APP_ID`) | `EducationalApplication`, url приложения, `offers`: price `0` KZT, `availability` = `LimitedAvailability`; без `aggregateRating` |
| `WebPage` | `https://bilimai.kz/<lang>#webpage` | inLanguage, isPartOf, about, `dateModified` = `contentUpdatedAt` |
| `FAQPage` | `https://bilimai.kz/<lang>#faq` | вопросы и ответы из `FAQ_ITEMS` через тот же `t()`, что и видимые `<details>` |

Блог переиспользует `ORG_ID` и `WEBSITE_ID` из `src/lib/json-ld.ts` и не собирает эти строки заново.

---

## OG-картинка

`src/app/[lang]/opengraph-image.tsx`:

- 1200×630 PNG через `next/og`, пререндерится при сборке;
- `generateStaticParams` объявлен в самом файле: image-маршруты не наследуют параметры сегмента;
- PNG ≈ 65 КБ при лимите WhatsApp 300 КБ.

- **Хеш в URL картинки считается только по этому файлу.** При правке текстов `og` в `meta.ts` обновите дату в комментарии `// og-rev: …` и константу `OG_REV` в `meta.ts` — иначе мессенджеры покажут закэшированное старое превью. Индекс блога ссылается на картинку явно (`/<lang>/opengraph-image?v=<OG_REV>`), без хеша Next, поэтому ему нужна именно `OG_REV`.
- Шрифты не передаются: встроенный в `next/og` Geist Regular покрывает казахские буквы. Свой TTF в `fonts` заменяет встроенный целиком; woff2 не поддерживается. Перед добавлением TTF проверьте глифы: `node scripts/check-font-glyphs.mjs <font.ttf>` (нужны `ӘәҒғҚқҢңӨөҰұҮүҺһІі—·№`).

---

## Шрифты, иконки, изображения

**Шрифт**: Geist через `next/font/local` (`src/app/fonts.ts`, файл `src/assets/fonts/Geist-Variable.woff2`):

- прелоад и fallback с подстройкой метрик (`adjustFontFallback: "Arial"`);
- в CSS — `var(--font-geist)`;
- `next/font/google` не используем намеренно: файл шрифта зафиксирован в репозитории, и сборка не ходит в Google Fonts. Казахские буквы у Geist из Google есть (subset `cyrillic-ext`); при переходе указать `subsets: ["latin", "cyrillic", "cyrillic-ext"]`, иначе эти начертания не попадут в preload и загрузятся с задержкой.

**Иконки**: `src/app/icon.svg`, `apple-icon.png`, `favicon.ico`, `public/icons/{icon-192,icon-512,maskable-512}.png`. Генерируются один раз командой `node scripts/make-icons.mjs` из `public/images/landing/bilimai-mark.svg` (sharp из зависимостей next). Результат коммитится.

**Изображения** (`next/image`, AVIF/WebP, `qualities: [75]`):

| Где | Источник | `sizes` | Загрузка |
|---|---|---|---|
| hero-карточки (2 шт.) | `src/assets/landing/covers/*.jpg` | `126px` | `eager` + `fetchPriority="high"` (кандидаты в LCP) |
| split-карточки урока | то же | `142px` (картинка = 43 % ширины карточки) | `lazy` |
| cover-карточки урока | то же | `330px` | `lazy` |
| логотипы партнёров | `src/assets/landing/partners/*.png` | `220px` | `lazy`; в CSS `height: auto` (атрибут `height` иначе станет CSS-высотой) |
| обложка поста | `public/images/blog/<slug>/cover-*.jpg` | `(max-width: 760px) 100vw, 720px` | `eager` + `fetchPriority="high"` |

`sizes` измерены в браузере на ширинах 390–1920; у логотипов партнёров `sizes` = их `--partner-width`.

**Кэш оптимизации.** Каждый промах кэша `/_next/image` на Vercel — платная трансформация (на Hobby при превышении квоты новые картинки отдают 402), AVIF и WebP считаются отдельно. Поэтому `images.minimumCacheTTL` = 31 день, а `/images/blog/*` отдаются с `immutable`: обложки названы по хешу содержимого. Не используйте `fill`: его инлайновые стили ломают split-раскладку. `priority`/`preload` тоже не нужны. React 19 сам прелоадит каждый `<img>` без `loading="lazy"`, поэтому в HTML ровно 3 preload картинок: логотип и две hero-обложки.

**Reveal-анимация**: блоки с `data-reveal` скрываются только под `body.js`. Класс ставит inline-скрипт первым потомком `<body>`, поэтому без JS (и для краулеров) текст виден сразу. У `.hero-copy` атрибута `data-reveal` нет: h1 не ждёт JS.

---

## robots.txt, sitemap, llms.txt

- `robots.txt` разрешает всё, кроме `/api/`, и запрещает только Bytespider. ИИ-краулеры разрешены: они источник цитирования. `Clean-param` для utm-меток — директива Яндекса. Группы для `bingbot` нет: Bing применяет только самую специфичную группу.
- `sitemap.xml`:
  - `/kk`, `/ru`, `/en` с языковыми альтернативами;
  - индексы блога `/ru/blog`, `/kk/blog`;
  - все опубликованные посты.

  Блог попадает в sitemap, только пока `BLOG_ENABLED = true`; сейчас он временно выключен (см. [BLOG.md](./BLOG.md#временное-отключение)).

  Корень `/` (редирект) в sitemap не входит. Яндекс hreflang из sitemap не читает: основной канал — `<link rel="alternate">` в `<head>`.
- `llms.txt` — краткая справка для LLM-агентов: что такое Bilim AI, типы документов, языки, стадия, ссылки. Строка `Last updated` обновляется вместе с текстом.

---

## Как добавить язык

1. Код в `LOCALES`, `LANGUAGE_OPTIONS`, `OG_LOCALE` (`src/i18n/config.ts`) и в `SITE.languages` (`src/lib/site.ts`: `knowsLanguage`/`inLanguage` в JSON-LD).
2. Словарь в `src/i18n/messages.js` и `dictionaries.ts`; строка в `META` (`src/i18n/meta.ts`).
3. hreflang в `[lang]/page.tsx` (список задан явно); `sitemap.ts` подхватит `LOCALES` сам.
4. Правило `Accept-Language` подхватится из `LOCALES` автоматически. Проверьте порядок: важен первый тег.
5. Блог на новом языке — отдельное решение: формат пакета на бэкенде знает только `ru` и `kk` (см. [BLOG.md](./BLOG.md)). Без своего блога язык ведётся в `ru`, как сейчас `en`, в трёх местах:
   - фолбэк в `blogUrl` (`Landing.jsx`) — ссылки «Блог» в навигации и футере;
   - RSS-ссылка `alternates.types` в `[lang]/page.tsx`;
   - редиректы `/<код>/blog` и `/<код>/blog/:path*` → `/ru/blog…` в `next.config.ts`.
6. Тексты 404 в `global-not-found.tsx`, `llms.txt`, этот документ.

---

## Сборка и деплой

- Пакеты: `corepack pnpm@10.34.6 install` / `… build`. Lockfile — `lockfileVersion 9.0`, им собирает Vercel. pnpm 12 (по умолчанию у corepack) переписывает lockfile и вписывает в `pnpm-workspace.yaml` заглушку `allowBuilds` — не коммитьте это.
- `.env.local` нужен только для dev-стенда. Без него используются прод-фолбэки. При сборке с `NEXT_PUBLIC_APP_URL` ссылки уйдут на dev.
- Ожидаемая таблица сборки:
  - `● /[lang]` (kk, ru, en), `● /[lang]/opengraph-image` ×3;
  - `● /[lang]/blog` (kk, ru, en — `/en/blog` пререндерится из параметров корневого layout, в рантайме его перехватывает редирект на `/ru/blog`), `● /[lang]/blog/[slug]` и `● /[lang]/feed.xml` (ru, kk);
  - `○ /sitemap.xml`, `○ /robots.txt`, `○ /manifest.webmanifest`, `○ /apple-icon.png`, `○ /icon.svg`, `○ /_not-found`;
  - единственный `ƒ /api/waitlist`.

## Чек-лист проверки

1. `corepack pnpm@10.34.6 build` проходит; таблица маршрутов как выше; `corepack pnpm@10.34.6 exec tsc --noEmit` и `lint` без ошибок.
2. `curl -sI`:
   - `/` → 307 `/kk`;
   - с `Cookie: bilim-lang=ru` → `/ru`;
   - с `Accept-Language: en-US,en;q=0.9` → `/en`;
   - `/kk/` → 308;
   - `/xx`, `/kk/x` → 404.
3. В HTML каждого языка:
   - `<html lang>`, `canonical`, 4 hreflang, `og:locale` и 2 `og:locale:alternate`;
   - абсолютный `og:image`, один `<script type="application/ld+json">`;
   - три ссылки переключателя `href="/kk|/ru|/en"`;
   - нет `body.js`.
4. [validator.schema.org](https://validator.schema.org) и Google Rich Results Test для `/kk`, `/ru`, `/en` и одного поста. Rich result для FAQ не ожидается: Google убрал его в мае 2026.
5. Превью: Facebook Sharing Debugger, Telegram `@WebpageBot`, отправка ссылки себе в WhatsApp — для каждого языка.
6. После деплоя на preview-ветке Vercel повторить п. 2: правила `has` по cookie и заголовку и 404 для непререндеренных путей — поведение платформы.

## Вне кода

- Sitemap — в Google Search Console и Яндекс Вебмастер (регион «Казахстан»), Bing Webmaster / IndexNow.
- `www.bilimai.kz` — добавить домен в проект Vercel с редиректом на apex (сейчас сертификат только на apex).
