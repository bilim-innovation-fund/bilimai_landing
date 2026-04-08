"use client";

import { useTranslations, useLocale } from "next-intl";

const heroImages: Record<string, string> = {
  en: "/images/home/hero/hero-image.png",
  kk: "/images/home/hero/hero-image-kz.png",
  ru: "/images/home/hero/hero-image-ru.png",
};

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();

  const titleWords = t("title").split(" ");
  const heroImage = heroImages[locale] ?? heroImages.en;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes blurIn {
          from {
            opacity: 0;
            filter: blur(8px);
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: none;
          }
        }
        .animate-word {
          display: inline-block;
          opacity: 0;
          filter: blur(8px);
          animation: blurIn 0.6s ease forwards;
          will-change: opacity, filter, transform;
          backface-visibility: hidden;
        }
      `}</style>
      <section
        className="hero-section flex items-center justify-center w-full gap-[5px] overflow-hidden"
        style={{ height: "calc(100vh - 72px)" }}
      >
        {/* Left: Text Content Container */}
        <div
          className="hero-text-container flex flex-col justify-center items-center flex-1 h-min"
          style={{ maxWidth: 1350, padding: "44px 30px 44px 80px" }}
        >
          <div className="hero-text-inner flex flex-col items-start gap-[30px] w-full max-w-[840px]">
            {/* Badge */}
            <div
              className="animate-fade-up"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 30,
                backgroundColor: "#ffffff",
                padding: "4px 15px 4px 4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                animationDelay: "0.1s",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 30,
                  background:
                    "linear-gradient(180deg, #ffd54a 0%, #ffeba8 100%)",
                  padding: "3px 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: "1.4em",
                  color: "#101011",
                }}
              >
                {t("badgeLabel")}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: "1.4em",
                  color: "#2b2b2c",
                  whiteSpace: "nowrap",
                }}
              >
                {t("badge")}
              </span>
            </div>

            {/* Title — word by word */}
            <h1 className="hero-title text-[90px] font-semibold leading-[1em] tracking-[-0.04em] text-dark text-left">
              {titleWords.map((word, i) => (
                <span
                  key={i}
                  className="animate-word"
                  style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                >
                  {word}
                  {i < titleWords.length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p
              className="hero-subtitle animate-fade-up text-[18px] font-medium tracking-[-0.02em] leading-[1.4] text-left max-w-[600px]"
              style={{ animationDelay: "0.7s" }}
            >
              {t.rich("subtitle", {
                muted: (chunks) => (
                  <span className="text-text-secondary">{chunks}</span>
                ),
                dark: (chunks) => (
                  <span className="text-dark">{chunks}</span>
                ),
              })}
            </p>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="hero-image relative flex-1 h-full min-w-0 rounded-tl-[20px] rounded-bl-[20px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt="BilimAI Platform Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </section>
    </>
  );
}
