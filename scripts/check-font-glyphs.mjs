// Проверка TTF/OTF перед подключением в next/og (opengraph-image.tsx):
// есть ли в шрифте все казахские буквы и знаки, которые встречаются в
// текстах OG-картинки. Свой шрифт в ImageResponse заменяет встроенный
// Geist целиком, и недостающие глифы молча станут «тофу».
//
//   node scripts/check-font-glyphs.mjs src/assets/fonts/Geist-SemiBold.ttf
import { readFileSync } from "node:fs";

const REQUIRED = "ӘәҒғҚқҢңӨөҰұҮүҺһІі—·№";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/check-font-glyphs.mjs <font.ttf>");
  process.exit(2);
}
const font = readFileSync(file);

// Таблица cmap: форматы 4 (BMP) и 12 (полный Unicode).
function codepoints(buffer) {
  const tables = buffer.readUInt16BE(4);
  let cmap = -1;
  for (let i = 0; i < tables; i += 1) {
    const record = 12 + i * 16;
    if (buffer.toString("ascii", record, record + 4) === "cmap") cmap = buffer.readUInt32BE(record + 8);
  }
  if (cmap < 0) throw new Error("в шрифте нет таблицы cmap");
  const points = new Set();
  const subtables = buffer.readUInt16BE(cmap + 2);
  for (let i = 0; i < subtables; i += 1) {
    const sub = cmap + buffer.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = buffer.readUInt16BE(sub);
    if (format === 4) {
      const segments = buffer.readUInt16BE(sub + 6) / 2;
      const ends = sub + 14;
      const starts = ends + segments * 2 + 2;
      for (let j = 0; j < segments; j += 1) {
        const end = buffer.readUInt16BE(ends + j * 2);
        const start = buffer.readUInt16BE(starts + j * 2);
        for (let cp = start; cp <= end && cp !== 0xffff; cp += 1) points.add(cp);
      }
    } else if (format === 12) {
      const groups = buffer.readUInt32BE(sub + 12);
      for (let j = 0; j < groups; j += 1) {
        const group = sub + 16 + j * 12;
        const start = buffer.readUInt32BE(group);
        const end = buffer.readUInt32BE(group + 4);
        for (let cp = start; cp <= end; cp += 1) points.add(cp);
      }
    }
  }
  return points;
}

const points = codepoints(font);
const missing = [...REQUIRED].filter((ch) => !points.has(ch.codePointAt(0)));
const variable = font.includes(Buffer.from("fvar"));
if (missing.length) {
  console.log(`НЕ ХВАТАЕТ: ${missing.join(" ")}`);
  process.exitCode = 1;
} else {
  console.log("Все казахские буквы на месте.");
}
if (variable) console.log("Внимание: вариативный шрифт (fvar) — next/og ждёт статические начертания.");
