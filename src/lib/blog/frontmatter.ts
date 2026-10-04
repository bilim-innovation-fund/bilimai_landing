// Строгий парсер фронтматтера постов. Принимает ровно то, что пишет
// apps/blog/bundle.py::render_frontmatter: плоские строки `key: value`,
// строки в двойных кавычках (внутри только \\ и \"), голые даты
// YYYY-MM-DD (это СТРОКИ), целые числа, true/false и однострочные списки
// `[a, b]` из тех же скаляров. Всё остальное — ошибка `file:line`.
//
// gray-matter и js-yaml не годятся: они превращают даты в Date, в том числе
// внутри списков. Модуль импортирует next.config.ts — без node:fs и алиасов.

import {
  type BlogFrontmatter,
  FRONTMATTER_KEYS,
  type FrontmatterKey,
  isBlogCategory,
  OPTIONAL_KEYS,
} from "./types";

export class BlogFileError extends Error {
  constructor(
    readonly file: string,
    readonly line: number | undefined,
    readonly reason: string,
  ) {
    super(`${file}${line ? `:${line}` : ""}: ${reason}`);
    this.name = "BlogFileError";
  }
}

type Scalar = string | number | boolean;
type Value = Scalar | Scalar[];

export type ParsedFile = {
  data: Partial<Record<FrontmatterKey, Value>>;
  // Строка, на которой задан ключ: для сообщений об ошибках.
  lines: Partial<Record<FrontmatterKey, number>>;
  body: string;
  // Номер строки файла, с которой начинается body (с 1).
  bodyLine: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const INT_RE = /^-?\d+$/;
const KEY_LINE_RE = /^([A-Za-z][A-Za-z0-9]*):(.*)$/;

export function isIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

// Читает строку в двойных кавычках с позиции start (на кавычке).
// Возвращает значение и позицию после закрывающей кавычки.
function readQuoted(
  text: string,
  start: number,
  fail: (reason: string) => never,
): [string, number] {
  let out = "";
  let i = start + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"') return [out, i + 1];
    if (ch === "\\") {
      const next = text[i + 1];
      if (next === "\\" || next === '"') {
        out += next;
        i += 2;
        continue;
      }
      fail(`недопустимое экранирование «\\${next ?? ""}» в строке (разрешены только \\\\ и \\")`);
    }
    out += ch;
    i += 1;
  }
  return fail("строка без закрывающей кавычки");
}

function readBareScalar(token: string, fail: (reason: string) => never): Scalar {
  if (DATE_RE.test(token)) return token;
  if (INT_RE.test(token)) return Number(token);
  if (token === "true") return true;
  if (token === "false") return false;
  if (token.startsWith("'")) return fail("одинарные кавычки не поддерживаются — только двойные");
  return fail(`значение «${token}» без кавычек: строки пишутся в двойных кавычках`);
}

function parseList(raw: string, fail: (reason: string) => never): Scalar[] {
  // raw начинается с "[" и кончается "]".
  const items: Scalar[] = [];
  let i = 1;
  const end = raw.length - 1;
  const skipSpaces = () => {
    while (i < end && (raw[i] === " " || raw[i] === "\t")) i += 1;
  };
  skipSpaces();
  if (i === end) return items;
  for (;;) {
    skipSpaces();
    if (raw[i] === "[" || raw[i] === "{") fail("вложенные списки и объекты не поддерживаются");
    if (raw[i] === '"') {
      const [value, next] = readQuoted(raw, i, fail);
      items.push(value);
      i = next;
    } else {
      let j = i;
      while (j < end && raw[j] !== ",") j += 1;
      const token = raw.slice(i, j).trim();
      if (!token) fail("пустой элемент списка");
      items.push(readBareScalar(token, fail));
      i = j;
    }
    skipSpaces();
    if (i === end) return items;
    if (raw[i] !== ",") fail("элементы списка разделяются запятой");
    i += 1;
  }
}

function parseValue(raw: string, fail: (reason: string) => never): Value {
  if (!raw) return fail("пустое значение");
  if (raw.startsWith('"')) {
    const [value, next] = readQuoted(raw, 0, fail);
    if (raw.slice(next).trim()) fail("лишний текст после закрывающей кавычки");
    return value;
  }
  if (raw.startsWith("[")) {
    if (!raw.endsWith("]")) fail("список должен быть в одну строку: [a, b]");
    return parseList(raw, fail);
  }
  if (raw.startsWith("{")) return fail("вложенные объекты не поддерживаются");
  if (raw === "|" || raw === ">" || raw.startsWith("|") || raw.startsWith(">")) {
    return fail("многострочные строки не поддерживаются");
  }
  return readBareScalar(raw, fail);
}

export function parseFile(file: string, source: string): ParsedFile {
  const text = source.replace(/\r\n?/g, "\n");
  const lines = text.split("\n");
  if (lines[0] !== "---") {
    throw new BlogFileError(file, 1, "файл должен начинаться с «---» (фронтматтер)");
  }

  const data: ParsedFile["data"] = {};
  const keyLines: ParsedFile["lines"] = {};
  let close = -1;
  for (let n = 1; n < lines.length; n += 1) {
    const line = lines[n];
    const lineNo = n + 1;
    const fail = (reason: string): never => {
      throw new BlogFileError(file, lineNo, reason);
    };
    if (line === "---") {
      close = n;
      break;
    }
    if (!line.trim()) continue;
    if (/^\s/.test(line)) fail("вложенный YAML не поддерживается: фронтматтер плоский");
    if (line.startsWith("#")) fail("комментарии во фронтматтере не поддерживаются");
    if (line.startsWith("-")) fail("блочные списки «- x» не поддерживаются: пишите [a, b]");
    const match = KEY_LINE_RE.exec(line);
    if (!match) fail(`строка не вида «ключ: значение»: ${line}`);
    const [, key, rest] = match as RegExpExecArray;
    if (!(FRONTMATTER_KEYS as ReadonlyArray<string>).includes(key)) {
      fail(`неизвестный ключ «${key}» (новый ключ = FORMAT_VERSION 2 на бэкенде)`);
    }
    const typedKey = key as FrontmatterKey;
    if (typedKey in data) fail(`ключ «${key}» повторяется`);
    if (rest && !rest.startsWith(" ")) fail("после «:» нужен пробел");
    data[typedKey] = parseValue(rest.trim(), fail);
    keyLines[typedKey] = lineNo;
  }
  if (close < 0) throw new BlogFileError(file, undefined, "нет закрывающей «---» фронтматтера");

  // Бандл пишет пустую строку между фронтматтером и телом.
  let bodyStart = close + 1;
  if (lines[bodyStart] === "") bodyStart += 1;
  return {
    data,
    lines: keyLines,
    body: lines.slice(bodyStart).join("\n"),
    bodyLine: bodyStart + 1,
  };
}

// Проверка типов и обязательных ключей. Пороги длины и прочие правила
// lint.py — в validate.ts.
export function toFrontmatter(file: string, parsed: ParsedFile): BlogFrontmatter {
  const { data, lines } = parsed;
  const fail = (key: FrontmatterKey | undefined, reason: string): never => {
    throw new BlogFileError(file, key ? lines[key] : 2, reason);
  };
  for (const key of FRONTMATTER_KEYS) {
    if (!(key in data) && !OPTIONAL_KEYS.has(key)) fail(undefined, `нет обязательного ключа «${key}»`);
  }
  const str = (key: FrontmatterKey): string => {
    const value = data[key];
    if (typeof value !== "string") fail(key, `«${key}» должен быть строкой в кавычках`);
    return value as string;
  };
  const date = (key: FrontmatterKey): string => {
    const value = str(key);
    if (!isIsoDate(value)) fail(key, `«${key}» должен быть датой YYYY-MM-DD, а не «${value}»`);
    return value;
  };

  const tagsValue = data.tags;
  if (!Array.isArray(tagsValue)) fail("tags", "«tags» должен быть списком [a, b] (можно [])");
  const readingMinutes = data.readingMinutes;
  if (
    readingMinutes !== undefined &&
    (typeof readingMinutes !== "number" || !Number.isInteger(readingMinutes) || readingMinutes < 1)
  ) {
    fail("readingMinutes", "«readingMinutes» должен быть целым числом ≥ 1");
  }
  if (typeof data.draft !== "boolean") fail("draft", "«draft» должен быть true или false");
  const category = str("category");
  if (!isBlogCategory(category)) fail("category", `рубрика «${category}» не из списка`);

  return {
    title: str("title"),
    description: str("description"),
    date: date("date"),
    updated: data.updated === undefined ? undefined : date("updated"),
    author: str("author"),
    group: str("group"),
    category: category as BlogFrontmatter["category"],
    // Бэкенд теги не валидирует: числа и true без кавычек приводим к строке.
    tags: (tagsValue as Scalar[]).map((tag) => String(tag)),
    cover: str("cover"),
    coverAlt: str("coverAlt"),
    generatedBy: data.generatedBy === undefined ? undefined : str("generatedBy"),
    readingMinutes: readingMinutes as number | undefined,
    draft: data.draft as boolean,
  };
}
