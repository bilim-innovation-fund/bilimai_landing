import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hasLocale, LOCALES } from "@/i18n/config";
import { META } from "@/i18n/meta";

// og-rev: 2026-10-05
// Хеш в URL картинки считается только по этому файлу. При правке текстов
// og в src/i18n/meta.ts менять дату выше — иначе мессенджеры покажут
// закэшированное старое превью.
//
// Шрифты не передаём: встроенный в next/og Geist Regular покрывает все
// казахские буквы. Свой TTF заменит его целиком — перед этим проверить
// cmap (docs/ru/SEO.md).

export const alt = "Bilim AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image-маршруты не наследуют generateStaticParams сегмента [lang].
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const INK = "#1c1e1d";
const MUTED = "#676d69";
const GREEN = "#00752b";
const PAPER = "#f5f6f4";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return new Response(null, { status: 404 });

  const { og } = META[lang];
  const mark = await readFile(
    join(process.cwd(), "public/images/landing/bilimai-mark.svg"),
  );
  const markSrc = `data:image/svg+xml;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: PAPER,
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={56} height={56} alt="" />
          <div style={{ display: "flex", fontSize: 40, letterSpacing: -1 }}>
            Bilim AI
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {og.headline}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: GREEN }}>
            {og.tagline}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
          {`bilimai.kz · ${og.footer}`}
        </div>
      </div>
    ),
    size,
  );
}
