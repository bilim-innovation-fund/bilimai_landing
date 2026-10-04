import localFont from "next/font/local";

// Локальный файл, а не next/font/google: у Geist из Google Fonts нет
// subset cyrillic-ext, и казахские Ә Қ Ң Ө Ұ Ү Һ Ғ ушли бы в fallback.
export const geist = localFont({
  src: "../assets/fonts/Geist-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  variable: "--font-geist",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
  adjustFontFallback: "Arial",
});
