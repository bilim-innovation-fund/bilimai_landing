"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { AnimateIn, BlurWords } from "./AnimateIn";

const localeSuffix: Record<string, string> = { en: "", kk: "-kz", ru: "-ru" };

const iconFeatures = [
  {
    titleKey: "feature1Title",
    descKey: "feature1Desc",
    icon: "/images/home/how-it-works/icon-interactive.svg",
  },
  {
    titleKey: "feature2Title",
    descKey: "feature2Desc",
    icon: "/images/home/how-it-works/icon-marketplace.svg",
  },
  {
    titleKey: "feature3Title",
    descKey: "feature3Desc",
    icon: "/images/home/how-it-works/icon-government.svg",
  },
] as const;

export function HowItWorks() {
  const t = useTranslations("howItWorks");
  const locale = useLocale();
  const suffix = localeSuffix[locale] ?? "";

  return (
    <section
      id="lesson-generator"
      className="howitworks-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        marginTop: 80,
        scrollMarginTop: 88,
        backgroundColor: "#f9f8f4",
        borderTop: "1px solid rgba(96, 98, 102, 0.05)",
        borderBottom: "1px solid rgba(96, 98, 102, 0.05)",
      }}
    >
      {/* Section Bg — rounded container */}
      <div
        style={{
          borderRadius: 30,
          padding: "60px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: 1350,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {/* Container */}
        <div
          className="howitworks-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 56,
            width: "100%",
            maxWidth: 1350,
            padding: "0 30px",
          }}
        >
          {/* Section Title */}
          <BlurWords
            text={t("title")}
            className="howitworks-title"
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: "1.1em",
              color: "#101011",
              textAlign: "center",
              maxWidth: 600,
            }}
          />

          {/* 2-Column Grid */}
          <div
            className="howitworks-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(50px, 1fr))",
              gap: 30,
              width: "100%",
            }}
          >
            {/* Card 1 — Start With Any Topic */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 30,
                padding: 6,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 30px rgba(45, 30, 133, 0.1)",
                overflow: "hidden",
                alignSelf: "start",
              }}
            >
              <div
                style={{
                  borderRadius: 25,
                  overflow: "hidden",
                  width: "100%",
                  backgroundColor: "#f0f2f6",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/home/how-it-works/step1${suffix}.png`}
                  alt={t("step1Title")}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: 30,
                }}
              >
                <h6
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.4em",
                    color: "#101011",
                  }}
                >
                  {t("step1Title")}
                </h6>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.4em",
                    color: "#606266",
                  }}
                >
                  {t("step1Desc")}
                </p>
              </div>
            </div>

            {/* Card 2 — AI Builds the Lesson Content + Icon Features */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 30,
                padding: 6,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 30px rgba(45, 30, 133, 0.1)",
                overflow: "hidden",
                alignSelf: "start",
              }}
            >
              <div
                style={{
                  borderRadius: 25,
                  overflow: "hidden",
                  width: "100%",
                  backgroundColor: "#f0f2f6",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/home/how-it-works/step2${suffix}.png`}
                  alt={t("step2Title")}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: 30,
                }}
              >
                <h6
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.4em",
                    color: "#101011",
                  }}
                >
                  {t("step2Title")}
                </h6>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.4em",
                    color: "#606266",
                  }}
                >
                  {t("step2Desc")}
                </p>
              </div>

            </div>
          </div>

          {/* Icon Feature Grid — full width below cards */}
          <div
            className="howitworks-icons"
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 50,
              width: "100%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            {iconFeatures.map((feature, i) => (
              <AnimateIn
                key={feature.titleKey}
                delay={i * 0.15}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 17,
                  flex: 1,
                }}
              >
                {/* Icon Box */}
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 10,
                    backgroundColor: "#2b2b2c",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={feature.icon}
                    alt=""
                    width={22}
                    height={22}
                  />
                </div>
                {/* Icon Content */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <h6
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      lineHeight: "1.4em",
                      color: "#101011",
                    }}
                  >
                    {t(feature.titleKey)}
                  </h6>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      letterSpacing: "-0.02em",
                      lineHeight: "1.4em",
                      color: "#606266",
                    }}
                  >
                    {t(feature.descKey)}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
