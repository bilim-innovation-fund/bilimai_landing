import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { geist } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Bilim AI — сабақтар, тесттер және сыныптар бір кеңістікте",
  description:
    "Bilim AI — сабақтар, оқу бағдарламалары, тесттер мен сыныптарды бір ортада біріктіретін ЖИ платформасы.",
};

export const viewport: Viewport = {
  themeColor: "#f5f6f4",
};

// Класс js ставится до разбора остального body: без JS блоки с
// data-reveal остаются видимыми (см. globals.css), с JS — анимируются.
const JS_FLAG_SCRIPT = "document.body.classList.add('js')";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk" className={geist.variable}>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
