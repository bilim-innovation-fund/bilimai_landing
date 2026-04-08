"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AnimateIn, BlurWords } from "./AnimateIn";

const faqKeys = ["1", "2", "3", "4", "5", "6"] as const;

export function FAQ() {
  const t = useTranslations("faq");

  return (
    <section
      id="faq"
      className="faq-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "100px 0 120px",
      }}
    >
      {/* Container */}
      <div
        className="faq-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
          width: "100%",
          maxWidth: 1360,
          padding: "0 30px",
        }}
      >
        {/* Section Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            maxWidth: 600,
          }}
        >
          <BlurWords
            text={t("title")}
            className="faq-title"
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: "1.1em",
              color: "#101011",
              textAlign: "center",
            }}
          />
          <AnimateIn
            as="p"
            delay={0.2}
            className="faq-subtitle"
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: "1.4em",
              color: "#606266",
              textAlign: "center",
            }}
          >
            {t("subtitle")}
          </AnimateIn>
        </div>

        {/* Accordion */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            width: "100%",
            maxWidth: 600,
          }}
          className="faq-accordion"
        >
          {faqKeys.map((key, i) => (
            <AnimateIn key={key} delay={i * 0.1}>
              <FAQItem
                question={t(`q${key}`)}
                answer={t(`a${key}`)}
              />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 30,
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* Question row */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "10px 10px 10px 30px",
          cursor: "pointer",
          border: "none",
          background: "none",
          textAlign: "left",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: "1.4em",
            color: "#101011",
          }}
        >
          {question}
        </span>

        {/* Plus/Minus toggle */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 50,
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Horizontal bar */}
          <div
            style={{
              position: "absolute",
              width: 16,
              height: 2,
              backgroundColor: "#101011",
              top: "calc(50% - 1px)",
              left: "calc(50% - 8px)",
            }}
          />
          {/* Vertical bar (rotates when open) */}
          <div
            style={{
              position: "absolute",
              width: 2,
              height: 16,
              backgroundColor: "#101011",
              top: "calc(50% - 8px)",
              left: "calc(50% - 1px)",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      </button>

      {/* Answer */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: "1.4em",
              color: "#606266",
              padding: "0 30px 24px",
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
