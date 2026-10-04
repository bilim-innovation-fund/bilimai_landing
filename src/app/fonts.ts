import localFont from "next/font/local";

// Локальный файл, а не next/font/google: шрифт зафиксирован в репозитории,
// и сборка не ходит в Google Fonts. (У Geist из Google subset cyrillic-ext
// есть; при переходе добавить его в subsets, иначе казахские начертания не
// попадут в preload.)
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
