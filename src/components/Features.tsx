"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { StudentOrbits } from "./StudentOrbits";
import { AnimateIn, BlurWords } from "./AnimateIn";

const cards = [
  { titleKey: "card1Title", descKey: "card1Desc", image: "/images/home/features/ai-lesson-generator.png" },
  { titleKey: "card2Title", descKey: "card2Desc", image: "/images/home/features/student-ai-learning.png" },
  { titleKey: "card3Title", descKey: "card3Desc", image: "/images/home/features/learning-insights.png" },
] as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <section
      className="features-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        paddingTop: 100,
      }}
    >
      <div
        className="features-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
          width: "100%",
          maxWidth: 1350,
          padding: "0 30px",
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          <BlurWords
            text={t("title")}
            className="features-header-title"
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: "1.1em",
              color: "#101011",
            }}
          />
          <AnimateIn
            as="p"
            delay={0.2}
            className="features-header-subtitle"
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: "1.4em",
              color: "#606266",
            }}
          >
            {t("subtitle")}
          </AnimateIn>
        </div>

        {/* Feature Cards Grid */}
        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(50px, 1fr))",
            gap: 30,
            width: "100%",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.titleKey}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 30,
                padding: 6,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 30px rgba(45, 30, 133, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Card Image */}
              {card.titleKey === "card2Title" ? (
                <div style={{ width: "100%", aspectRatio: "1.17" }}>
                  <StudentOrbits />
                </div>
              ) : (
                <div
                  style={{
                    borderRadius: 25,
                    overflow: "hidden",
                    width: "100%",
                    aspectRatio: "1.17",
                    position: "relative",
                    backgroundColor: "#f0f2f6",
                  }}
                >
                  <Image
                    src={card.image}
                    alt={t(card.titleKey)}
                    fill
                    sizes="(max-width: 1350px) 33vw, 430px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Card Content */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "18px 20px 20px",
                }}
              >
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.4em",
                    color: "#101011",
                  }}
                >
                  {t(card.titleKey)}
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.4em",
                    color: "#606266",
                  }}
                >
                  {t(card.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
