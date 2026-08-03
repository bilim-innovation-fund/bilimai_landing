import "@/app/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Bilim AI — сабақтар, тесттер және сыныптар бір кеңістікте",
  description:
    "Bilim AI — сабақтар, оқу бағдарламалары, тесттер мен сыныптарды бір ортада біріктіретін ЖИ платформасы.",
  icons: {
    icon: "/images/landing/bilimai-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f6f4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
