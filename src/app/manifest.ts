import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bilim AI",
    short_name: "Bilim AI",
    description:
      "ҚМЖ, ОМЖ, КТЖ жоспарлары, сабақтар мен слайдтар, БЖБ/ТЖБ тесттері және қағаз жұмыстарын фото арқылы тексеру — Bilim AI, Қазақстан мұғалімдеріне арналған ЖИ.",
    lang: "kk",
    dir: "ltr",
    // Корень, а не /kk: он редиректит на язык из cookie или браузера.
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#f5f6f4",
    theme_color: "#f5f6f4",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
