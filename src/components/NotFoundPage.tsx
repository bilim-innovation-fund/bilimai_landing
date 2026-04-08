"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <>
      <Navigation />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 72px - 300px)",
          padding: "80px 30px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#101011",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: "1.2em",
            color: "#101011",
            marginTop: 16,
          }}
        >
          {t("title")}
        </h2>
        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: "1.4em",
            color: "#606266",
            marginTop: 12,
            maxWidth: 460,
          }}
        >
          {t("description")}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 32,
            padding: "12px 32px",
            borderRadius: 99,
            background: "linear-gradient(180deg, #ffeba8 0%, #ffd54a 100%)",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#101011",
            textDecoration: "none",
          }}
        >
          {t("backHome")}
        </Link>
      </main>
      <Footer />
    </>
  );
}
