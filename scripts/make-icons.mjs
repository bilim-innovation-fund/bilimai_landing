// Однократная генерация иконок из знака бренда:
//   node scripts/make-icons.mjs
// Результат коммитится; при смене знака запустить заново.
// sharp берём из зависимостей next (отдельно не ставим).
import { createRequire } from "node:module";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const sharp = createRequire(import.meta.resolve("next/package.json"))("sharp");

const MARK = "public/images/landing/bilimai-mark.svg";
const PAPER = "#f5f6f4";

const svg = await readFile(MARK);

// Знак рисуется в 20×20, растеризуем с запасом и уменьшаем.
async function mark(size) {
  return sharp(svg, { density: 3000 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Знак размером share·size по центру квадрата size×size.
async function icon(size, share, background) {
  const inner = Math.round(size * share);
  const png = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: await mark(inner), gravity: "center" }])
    .png()
    .toBuffer();
  // С фоном иконка непрозрачная: альфа-канал не нужен (apple-touch-icon).
  const out = background ? sharp(png).removeAlpha() : sharp(png);
  return out.png({ compressionLevel: 9 }).toBuffer();
}

// sharp не пишет .ico: собираем контейнер с PNG-кадрами сами.
function ico(frames) {
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...frames.map((frame) => frame.png)]);
}

await mkdir("public/icons", { recursive: true });

await copyFile(MARK, "src/app/icon.svg");
await writeFile("src/app/apple-icon.png", await icon(180, 0.72, PAPER));
await writeFile(
  "src/app/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await icon(size, 1) })))),
);
await writeFile("public/icons/icon-192.png", await icon(192, 0.84));
await writeFile("public/icons/icon-512.png", await icon(512, 0.84));
// maskable: всё значимое — внутри безопасной зоны (круг 80 %), знак 60 %.
await writeFile("public/icons/maskable-512.png", await icon(512, 0.6, PAPER));

console.log("icons written");
