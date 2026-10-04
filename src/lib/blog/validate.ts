// Валидатор постов блога — зеркало ОШИБОК apps/blog/lint.py
// (lint_body / lint_meta / lint_post): что там error, здесь роняет
// `next build` сообщением `file[:line]: …`. Предупреждения печатаются, но
// сборку не роняют. Запускается из next.config.ts до компиляции MDX:
// иначе сырой «{» уронил бы сборку непонятной ошибкой компилятора MDX.
//
// lint проверяет сырое тело до подстановки {{feature:…}} и экранирования,
// а лендинг видит выгрузку (bundle.render_body). Поэтому тело сначала
// разэкранируется, а токены к этому моменту уже стали [Название](url).
// Известные расхождения с lint (доля казахских букв у порога, число слов)
// описаны в docs/ru/BLOG.md.
//
// Без path-алиасов: модуль импортирует next.config.ts.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { AUTHORS } from "../../content/authors";
import { BlogFileError, parseFile, toFrontmatter } from "./frontmatter";
import {
  ALLOWED_HOSTS,
  BLOG_LOCALES,
  type BlogFrontmatter,
  type BlogLocale,
  BODY_WORDS_MAX,
  BODY_WORDS_MIN,
  COVER_MAX_BYTES,
  COVER_SIZE,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  KK_LENGTH_RATIO,
  KK_MIN_DENSITY,
  KK_SECTION_MIN_LETTERS,
  SUMMARY_HEADINGS,
  TITLE_MAX,
} from "./types";

export const CONTENT_DIR = "src/content/blog";
export const PUBLIC_DIR = "public";
export const COVER_DIR = "public/images/blog";
// Как Django SlugField (apps/blog/models.py): slug можно поправить в админке.
export const SLUG_RE = /^[A-Za-z0-9_-]+$/;

export type Issue = {
  level: "error" | "warning";
  file: string;
  line?: number;
  message: string;
};

// ── Регулярки lint.py ─────────────────────────────────────────────────
// \w в Python юникодный, в JS — только ASCII: \p{L}\p{N}_. Lookbehind и
// \p{…} собираются через new RegExp: TypeScript с target ES2017 не
// пропускает их в литералах.
const W = String.raw`[\p{L}\p{N}_]`;
const NOT_W_BEFORE = String.raw`(?<![\p{L}\p{N}_])`;
const NOT_W_AFTER = String.raw`(?![\p{L}\p{N}_])`;

const H1_RE = /^#\s/m;
const H2_RE = /^##\s/m;
const H2_GLOBAL_RE = /^##\s/gm;
const MDX_LINE_RE = /^\s*(<|\{|import\s|export\s)/m;
const BRACE_RE = /[{}]/;
const HTML_TAG_RE = /<\/?[a-zA-Z][^>]*>/;
const LT_RE = /<(?![ \t\r\n])/;
const CODE_RE = /(^```[\s\S]*?^```[ \t]*$|`[^`\n]+`)/m;
const UNRESOLVED_TOKEN_RE = /\{\{feature:/;
// Бывшие токены {{feature:…}}: бандл превращает их в ссылки на
// app.bilimai.kz. Lint проверяет текст без токенов — здесь их вырезаем так же.
const FORMER_TOKEN_RE = /\[[^\]\n]*\]\(\s*<?https?:\/\/app\.bilimai\.kz[^)\s]*>?\s*\)/gi;
// Как _TOKEN_IN_LINK_TEXT_RE (`\[[^\]\n]*\{\{feature:`): «[» без «]», а за ним токен.
const TOKEN_IN_LINK_TEXT_RE = /\[[^\]\n]*\[[^\]\n]*\]\(\s*<?https?:\/\/app\.bilimai\.kz/i;
const LINK_DEST_RE = /\]\(\s*<?([^)\s>]+)/g;
const REF_DEF_RE = /^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?\s*$/gm;
const BARE_URL_RE = new RegExp(
  String.raw`(?:https?://|(?<![\p{L}\p{N}_/.@])www\.)[^\s)\]>"'<]+`,
  "giu",
);
const CYR_RE = /[Ѐ-ӿ]/g;
const KAZAKH_LETTERS = new Set("ӘәҒғҚқҢңӨөҰұҮүҺһІі");
const WORD_RE = new RegExp(`${W}+`, "gu");
const STAT_RE = new RegExp(
  "(\\d+\\s?%|по данным|исследовани|согласно опрос|статистик|зерттеу|деректер бойынша|сауалнама)",
  "giu",
);
const LISTICLE_RE = new RegExp(
  [
    String.raw`${NOT_W_BEFORE}топ[- ]?\d+${NOT_W_AFTER}`,
    String.raw`${NOT_W_BEFORE}\d+\s+(?:лучших|сервисов|нейросетей|инструментов|приложений)${NOT_W_AFTER}`,
    String.raw`${NOT_W_BEFORE}үздік\s+\d+${NOT_W_AFTER}`,
    String.raw`${NOT_W_BEFORE}\d+\s+үздік${NOT_W_AFTER}`,
  ].join("|"),
  "iu",
);
const AI_PHRASES_RE = new RegExp(
  "(как языковая модель|как ии[- ]модель|я не могу|as an ai|тіл моделі ретінде|жасанды интеллект ретінде мен)",
  "iu",
);
const EMOJI_RE = new RegExp(String.raw`[\u{1F300}-\u{1FAFF}☀-➿]`, "u");
const BLOG_LINK_RE = /^https?:\/\/(?:www\.)?bilimai\.kz\/(ru|kk|en)\/blog\/([^/?#]+)\/?(?:[?#].*)?$/i;

// ── Утилиты ───────────────────────────────────────────────────────────

const codepoints = (text: string) => [...text].length;

export function wordCount(text: string): number {
  return (text.match(WORD_RE) || []).length;
}

// Части текста вне кода (fenced ``` и инлайн `…`) и сам код — как
// re.split с одной группой: чётные индексы — текст, нечётные — код.
function splitCode(text: string): string[] {
  return text.split(new RegExp(CODE_RE.source, "gm"));
}

function stripCode(text: string): string {
  return splitCode(text)
    .map((part, i) => (i % 2 ? "" : part))
    .join("");
}

// Обратное к bundle._MDX_SPECIAL_RE: перед «{», «}» или «<» без пробела
// после стоит нечётное число «\» — убираем один. Код не трогаем.
export function unescapeMdx(body: string): string {
  return splitCode(body)
    .map((part, i) =>
      i % 2
        ? part
        : part.replace(/(\\+)([{}]|<(?![ \t\r\n]))/g, (_, slashes: string, ch: string) =>
            slashes.length % 2 ? slashes.slice(1) + ch : slashes + ch,
          ),
    )
    .join("");
}

export function kazakhDensity(text: string): number {
  const cyr = text.match(CYR_RE) || [];
  if (!cyr.length) return 0;
  return cyr.filter((ch) => KAZAKH_LETTERS.has(ch)).length / cyr.length;
}

function normalizeUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.toLowerCase().startsWith("www.")) return `https://${url}`;
  return url;
}

// Разбор как urllib.parse.urlsplit (lint._link_ok), а не WHATWG URL: тот
// считает «\» разделителем и пропускает `https://bilimai.kz\@evil.com`.
function urlsplit(url: string): { scheme: string; host: string } | undefined {
  const m = /^([A-Za-z][A-Za-z0-9+.-]*):([\s\S]*)$/.exec(url.replace(/[\t\r\n]/g, ""));
  if (!m) return undefined;
  const rest = m[2];
  if (!rest.startsWith("//")) return { scheme: m[1].toLowerCase(), host: "" };
  const netloc = rest.slice(2).split(/[/?#]/, 1)[0];
  let host = netloc.slice(netloc.lastIndexOf("@") + 1);
  host = host.startsWith("[") ? host.slice(1, host.indexOf("]")) : host.split(":")[0];
  return { scheme: m[1].toLowerCase(), host: host.toLowerCase() };
}

export function linkOk(url: string): boolean {
  const parts = urlsplit(normalizeUrl(url));
  // Относительная ссылка или мусор — в контракте запрещены.
  if (!parts) return false;
  const { scheme, host } = parts;
  return (
    (scheme === "http" || scheme === "https") &&
    ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
  );
}

function matchesAll(re: RegExp, text: string): RegExpExecArray[] {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  return [...text.matchAll(new RegExp(re.source, flags))];
}

export function linkTargets(text: string): { url: string; index: number }[] {
  const seen = new Set<string>();
  const out: { url: string; index: number }[] = [];
  for (const re of [LINK_DEST_RE, REF_DEF_RE, BARE_URL_RE]) {
    for (const m of matchesAll(re, text)) {
      const url = m[1] ?? m[0];
      if (url.startsWith("#") || seen.has(url)) continue;
      seen.add(url);
      out.push({ url, index: m.index ?? 0 });
    }
  }
  return out;
}

// difflib.SequenceMatcher.quick_ratio: пересечение мультимножеств символов.
function quickRatio(a: string, b: string): number {
  const counts = new Map<string, number>();
  for (const ch of b) counts.set(ch, (counts.get(ch) || 0) + 1);
  let matches = 0;
  for (const ch of a) {
    const left = counts.get(ch) || 0;
    if (left > 0) {
      matches += 1;
      counts.set(ch, left - 1);
    }
  }
  const total = codepoints(a) + codepoints(b);
  return total ? (2 * matches) / total : 1;
}

function lastH2(text: string): string | undefined {
  const headings = text.match(/^##\s+(.+)$/gm);
  return headings?.[headings.length - 1]?.replace(/^##\s+/, "").trim();
}

// Размер JPEG по маркеру SOF (SOF0–SOF15, кроме DHT/JPG/DAC: C4, C8, CC).
export function jpegSize(bytes: Buffer): { width: number; height: number } | undefined {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return undefined;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = bytes.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    }
    i += 2 + length;
  }
  return undefined;
}

// ── Проверки ──────────────────────────────────────────────────────────

type PostFile = {
  file: string;
  lang: BlogLocale;
  slug: string;
  fm: BlogFrontmatter;
  // Тело после разэкранирования — то, что видел бы lint.
  text: string;
  bodyLine: number;
  keyLines: Partial<Record<keyof BlogFrontmatter, number>>;
};

class Report {
  readonly issues: Issue[] = [];
  error(file: string, message: string, line?: number) {
    this.issues.push({ level: "error", file, line, message });
  }
  warn(file: string, message: string, line?: number) {
    this.issues.push({ level: "warning", file, line, message });
  }
}

function lineAt(post: PostFile, index: number): number {
  return post.bodyLine + (post.text.slice(0, index).match(/\n/g) || []).length;
}

function lintBody(post: PostFile, report: Report) {
  const { file, lang } = post;
  // JS считает U+2028/U+2029 концом строки для ^ и $, Python — нет.
  const text = post.text.replace(/[\u2028\u2029]/g, " ");
  const at = (index: number) => lineAt(post, index);
  if (!text.trim()) {
    report.error(file, "пустое тело");
    return;
  }
  const h1 = H1_RE.exec(text);
  if (h1) report.error(file, "заголовок первого уровня «# » — заголовок берётся из title", at(h1.index));

  const stripped = stripCode(text).replace(FORMER_TOKEN_RE, "");
  // Индексы в stripped не совпадают с text — ищем место по фрагменту.
  const locate = (fragment: string) => {
    const i = text.indexOf(fragment);
    return i >= 0 ? at(i) : undefined;
  };
  const mdxLine = MDX_LINE_RE.exec(stripped);
  if (mdxLine) {
    report.error(
      file,
      "строка начинается с «<», «{», «import» или «export» — сломает MDX",
      locate(mdxLine[0].trim()),
    );
  }
  const brace = BRACE_RE.exec(stripped);
  if (brace) {
    const unresolved = UNRESOLVED_TOKEN_RE.exec(stripped);
    report.error(
      file,
      unresolved
        ? "неизвестный или неразрешённый токен {{feature:…}}"
        : "фигурные скобки в тексте (в выгрузке — \\{ \\}): по контракту их нет вне кода",
      locate(unresolved ? "{{feature:" : brace[0]),
    );
  }
  const html = HTML_TAG_RE.exec(stripped);
  if (html) {
    report.error(file, `HTML-теги в тексте: ${html[0].slice(0, 40)}`, locate(html[0]));
  } else {
    const lt = LT_RE.exec(stripped);
    if (lt) {
      report.error(
        file,
        "«<» без пробела после («<тема>», «x<5», «<=») — MDX прочтёт как тег",
        locate(stripped.slice(lt.index, lt.index + 3)),
      );
    }
  }
  const nested = TOKEN_IN_LINK_TEXT_RE.exec(text);
  if (nested) {
    report.error(
      file,
      "ссылка на функцию продукта внутри текста ссылки [..] — получится вложенная ссылка",
      locate(nested[0]),
    );
  }
  for (const { url } of linkTargets(stripCode(text))) {
    if (!linkOk(url)) {
      report.error(
        file,
        `ссылка вне allow-list (bilimai.kz, app.bilimai.kz) или относительная: ${url}`,
        locate(url),
      );
    }
  }
  const escapedInCode = splitCode(text).some(
    (part, i) => i % 2 === 1 && /(^|[^\\])(\\\\)*\\[{}<]/.test(part),
  );
  if (escapedInCode) {
    report.warn(
      file,
      "в коде экранированные «\\{ \\} \\<» — вероятно, тело в админке с CRLF; проверьте, как код выглядит на странице",
    );
  }
  if (!H2_RE.test(text)) report.warn(file, "нет ни одного подзаголовка «## »");

  const words = wordCount(text);
  if (words < BODY_WORDS_MIN) report.warn(file, `коротко — ${words} слов (< ${BODY_WORDS_MIN})`);
  else if (words > BODY_WORDS_MAX) report.warn(file, `длинно — ${words} слов (> ${BODY_WORDS_MAX})`);
  for (const m of matchesAll(STAT_RE, text)) {
    report.warn(file, `цифра или ссылка на исследование без источника: «${m[0]}»`, at(m.index ?? 0));
  }
  if (LISTICLE_RE.test(text)) report.warn(file, "похоже на листикл «Топ-N» сторонних сервисов");
  const ai = AI_PHRASES_RE.exec(text);
  if (ai) report.error(file, `фраза, выдающая языковую модель: «${ai[0]}»`, at(ai.index));
  if (EMOJI_RE.test(text)) report.warn(file, "эмодзи в тексте");
  if (text.includes("₸")) report.warn(file, "знак ₸ — в шрифте лендинга его нет, писать «тенге»");

  if (lang === "kk") {
    const density = kazakhDensity(text);
    if (density < KK_MIN_DENSITY) {
      report.error(
        file,
        `казахских букв ${(density * 100).toFixed(1)} % (< ${KK_MIN_DENSITY * 100} %) — похоже на русский текст`,
      );
    }
    for (const section of text.split(H2_GLOBAL_RE).slice(1)) {
      const heading = section.split("\n", 1)[0].trim();
      const letters = (section.match(CYR_RE) || []).length;
      if (letters >= KK_SECTION_MIN_LETTERS && kazakhDensity(section) < KK_MIN_DENSITY) {
        report.warn(file, `раздел «${heading.slice(0, 40)}» похоже не переведён`);
      }
    }
  }

  // Только на лендинге: последний раздел — итог для учителя.
  const last = lastH2(text);
  if (last && last !== SUMMARY_HEADINGS[lang]) {
    report.warn(file, `последний раздел «${last}», а по контракту — «${SUMMARY_HEADINGS[lang]}»`);
  }
}

function lintMeta(post: PostFile, report: Report) {
  const { file, lang, fm, keyLines } = post;
  const { title, description } = fm;
  if (!title.trim()) report.error(file, "пустой title", keyLines.title);
  else if (codepoints(title) > TITLE_MAX) {
    report.error(file, `title длиннее ${TITLE_MAX} символов (${codepoints(title)})`, keyLines.title);
  }
  const desc = description.trim();
  if (!desc) report.error(file, "пустой description", keyLines.description);
  else if (codepoints(desc) > DESCRIPTION_MAX) {
    report.error(file, `description длиннее ${DESCRIPTION_MAX} символов (${codepoints(desc)})`, keyLines.description);
  } else if (codepoints(desc) < DESCRIPTION_MIN) {
    report.error(file, `description короче ${DESCRIPTION_MIN} символов (${codepoints(desc)})`, keyLines.description);
  }
  if (lang === "kk" && title && kazakhDensity(`${title} ${desc}`) < KK_MIN_DENSITY) {
    report.warn(file, "в title/description почти нет казахских букв", keyLines.title);
  }
  if (LISTICLE_RE.test(title)) report.warn(file, "заголовок похож на листикл «Топ-N»", keyLines.title);
  for (const key of ["title", "description"] as const) {
    const value = fm[key];
    if (BRACE_RE.test(value) || HTML_TAG_RE.test(value)) {
      report.error(file, `${key} содержит фигурные скобки или HTML`, keyLines[key]);
    }
  }
  if (fm.updated && fm.updated < fm.date) {
    report.error(file, `updated (${fm.updated}) раньше date (${fm.date})`, keyLines.updated);
  }
  if (!Object.prototype.hasOwnProperty.call(AUTHORS, fm.author)) {
    report.error(file, `неизвестный author «${fm.author}» (см. src/content/authors.ts)`, keyLines.author);
  }
  if (fm.group !== post.slug) {
    report.error(file, `group «${fm.group}» не совпадает со slug из пути «${post.slug}»`, keyLines.group);
  }
  if (!fm.coverAlt.trim()) report.warn(file, "пустой coverAlt", keyLines.coverAlt);
  if (fm.draft) report.warn(file, "draft: true — пост не попадёт в прод-сборку", keyLines.draft);
}

function lintCover(root: string, post: PostFile, report: Report) {
  const { file, fm, slug, keyLines } = post;
  const prefix = `/images/blog/${slug}/`;
  if (!fm.cover.startsWith(prefix) || !fm.cover.endsWith(".jpg")) {
    report.error(file, `cover должен быть ${prefix}cover-<hash8>.jpg, а не «${fm.cover}»`, keyLines.cover);
    return;
  }
  const path = join(root, PUBLIC_DIR, fm.cover);
  if (!existsSync(path)) {
    report.error(file, `нет файла обложки ${PUBLIC_DIR}${fm.cover}`, keyLines.cover);
    return;
  }
  const bytes = readFileSync(path);
  if (bytes.length > COVER_MAX_BYTES) {
    report.error(
      file,
      `обложка ${Math.floor(bytes.length / 1024)} КБ > ${COVER_MAX_BYTES / 1024} КБ`,
      keyLines.cover,
    );
  }
  const expected = `cover-${createHash("sha1").update(bytes).digest("hex").slice(0, 8)}.jpg`;
  const name = fm.cover.slice(prefix.length);
  if (name !== expected) {
    report.warn(file, `имя обложки ${name}, а по хешу содержимого — ${expected}`, keyLines.cover);
  }
  const size = jpegSize(bytes);
  if (!size || size.width !== COVER_SIZE.width || size.height !== COVER_SIZE.height) {
    report.warn(
      file,
      `обложка ${size ? `${size.width}×${size.height}` : "не JPEG"}, ожидается ${COVER_SIZE.width}×${COVER_SIZE.height}`,
      keyLines.cover,
    );
  }
}

function lintPair(ru: PostFile, kk: PostFile, report: Report) {
  const file = `${ru.file} ↔ ${kk.file}`;
  const h2Ru = (ru.text.match(H2_GLOBAL_RE) || []).length;
  const h2Kk = (kk.text.match(H2_GLOBAL_RE) || []).length;
  if (h2Ru !== h2Kk) report.warn(file, `число подзаголовков H2 отличается (ru ${h2Ru}, kk ${h2Kk})`);
  const lenRu = codepoints(ru.text);
  const lenKk = codepoints(kk.text);
  if (lenRu && lenKk) {
    const ratio = lenKk / lenRu;
    const [lo, hi] = KK_LENGTH_RATIO;
    if (ratio < lo || ratio > hi) {
      report.warn(file, `длина kk = ${ratio.toFixed(2)} от ru (ожидается ${lo}–${hi})`);
    }
    if (ru.text.trim() === kk.text.trim() || quickRatio(ru.text, kk.text) > 0.9) {
      report.warn(file, "казахский текст почти совпадает с русским");
    }
  }
  const appLinks = (post: PostFile) =>
    linkTargets(stripCode(post.text))
      .map(({ url }) => url)
      .filter((url) => /^https?:\/\/app\.bilimai\.kz\//i.test(url))
      .sort()
      .join("\n");
  if (appLinks(ru) !== appLinks(kk)) report.warn(file, "набор ссылок на функции продукта отличается");
  if (ru.fm.title.trim() && ru.fm.title.trim() === kk.fm.title.trim()) {
    report.warn(file, "заголовки ru и kk совпадают");
  }
}

// Ссылка https://bilimai.kz/{ru,kk}/blog/<slug> на несуществующий пост.
function lintBlogLinks(post: PostFile, existing: Set<string>, report: Report) {
  for (const { url } of linkTargets(stripCode(post.text))) {
    const m = BLOG_LINK_RE.exec(url.replace(/[.,;:!?…]+$/, ""));
    if (!m) continue;
    const lang = m[1].toLowerCase() === "en" ? "ru" : m[1].toLowerCase();
    if (!existing.has(`${lang}/${m[2]}`)) {
      report.error(post.file, `ссылка на несуществующий пост: ${url}`);
    }
  }
}

function readPosts(root: string, report: Report): PostFile[] {
  const posts: PostFile[] = [];
  for (const lang of BLOG_LOCALES) {
    const dir = join(root, CONTENT_DIR, lang);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith(".mdx")) continue;
      const file = `${CONTENT_DIR}/${lang}/${name}`;
      const slug = name.slice(0, -".mdx".length);
      if (!SLUG_RE.test(slug)) {
        report.error(file, `slug «${slug}»: только латиница, цифры, «-» и «_» (как SlugField)`);
        continue;
      }
      try {
        const parsed = parseFile(file, readFileSync(join(dir, name), "utf8"));
        const fm = toFrontmatter(file, parsed);
        posts.push({
          file,
          lang,
          slug,
          fm,
          text: unescapeMdx(parsed.body),
          bodyLine: parsed.bodyLine,
          keyLines: parsed.lines as PostFile["keyLines"],
        });
      } catch (error) {
        if (!(error instanceof BlogFileError)) throw error;
        report.error(error.file, error.reason, error.line);
      }
    }
  }
  return posts;
}

// Файлы в public/images/blog/<slug>/, на которые не ссылается ни один
// пост: `unzip -o` старую обложку не удаляет.
function lintOrphans(root: string, posts: PostFile[], report: Report) {
  const dir = join(root, COVER_DIR);
  if (!existsSync(dir)) return;
  const used = new Set(posts.map((post) => `${PUBLIC_DIR}${post.fm.cover}`));
  for (const slug of readdirSync(dir)) {
    const slugDir = join(dir, slug);
    if (!statSync(slugDir).isDirectory()) continue;
    for (const name of readdirSync(slugDir)) {
      const file = `${COVER_DIR}/${slug}/${name}`;
      if (!used.has(file)) report.warn(file, "файл не используется ни одним постом — удалить");
    }
  }
}

export function validateBlog(root: string): Issue[] {
  const report = new Report();
  const posts = readPosts(root, report);
  // Черновик в прод-сборку не попадает: ссылка на него — тоже 404.
  const existing = new Set(
    posts.filter((post) => !post.fm.draft).map((post) => `${post.lang}/${post.slug}`),
  );
  for (const post of posts) {
    lintMeta(post, report);
    lintBody(post, report);
    lintCover(root, post, report);
    lintBlogLinks(post, existing, report);
  }
  const bySlug = new Map<string, Partial<Record<BlogLocale, PostFile>>>();
  for (const post of posts) {
    bySlug.set(post.slug, { ...bySlug.get(post.slug), [post.lang]: post });
  }
  for (const pair of bySlug.values()) {
    if (pair.ru && pair.kk) lintPair(pair.ru, pair.kk, report);
  }
  lintOrphans(root, posts, report);
  return report.issues;
}

export function formatIssue(issue: Issue): string {
  return `${issue.file}${issue.line ? `:${issue.line}` : ""}: ${issue.message}`;
}

// Печатает предупреждения и бросает, если есть ошибки.
export function assertBlogValid(root: string): void {
  const issues = validateBlog(root);
  const errors = issues.filter((issue) => issue.level === "error");
  const warnings = issues.filter((issue) => issue.level === "warning");
  for (const warning of warnings) console.warn(`⚠ blog: ${formatIssue(warning)}`);
  if (errors.length) {
    throw new Error(
      `Блог: ${errors.length} ошибк(и) в постах — сборка остановлена.\n` +
        errors.map((error) => `  ✖ ${formatIssue(error)}`).join("\n"),
    );
  }
}
