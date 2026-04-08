"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { BlurWords } from "./AnimateIn";

const avatars = [
  { src: "/images/home/testimonials/avatar-1.jpg", rotation: -8 },
  { src: "/images/home/testimonials/avatar-2.jpg", rotation: 8 },
  { src: "/images/home/testimonials/avatar-3.jpg", rotation: -8 },
  { src: "/images/home/testimonials/avatar-4.jpg", rotation: 8 },
  { src: "/images/home/testimonials/avatar-5.jpg", rotation: -8 },
];

export function Testimonials() {
  const t = useTranslations("testimonials");
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const goTo = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setFade(false);
      setTimeout(() => {
        setActiveIndex(index);
        setFade(true);
      }, 300);
    },
    [activeIndex],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((activeIndex + 1) % avatars.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, goTo]);

  return (
    <section
      className="testimonials-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        paddingTop: 140,
      }}
    >
      {/* Container */}
      <div
        className="testimonials-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 1350,
          padding: "0 30px",
        }}
      >
        {/* Testimonial Grid — 2 columns */}
        <div
          className="testimonials-grid"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 84,
            width: "100%",
          }}
        >
          {/* Left — Title */}
          <div
            style={{
              flex: 0.85,
              display: "flex",
              flexDirection: "column",
              gap: 60,
            }}
          >
            <BlurWords
              text={t("title")}
              className="testimonials-title"
              style={{
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: "1.1em",
                color: "#101011",
                textAlign: "left",
              }}
            />
          </div>

          {/* Right — Testimonial Card */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            {/* Avatar Group */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              {avatars.map((avatar, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 5,
                    overflow: "hidden",
                    transform: `rotate(${avatar.rotation}deg) scale(${i === activeIndex ? 1.08 : 1})`,
                    opacity: i === activeIndex ? 1 : 0.4,
                    border:
                      i === activeIndex
                        ? "2px solid #2D8C6B"
                        : "2px solid transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                    position: "relative",
                    transition:
                      "opacity 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar.src}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Quote */}
            <p
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: "1.4em",
                color: "#2b2b2c",
                textAlign: "left",
                opacity: fade ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              &ldquo;{t("quote")}&rdquo;
            </p>

            {/* Author */}
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: "1.4em",
                color: "#101011",
                textAlign: "left",
                opacity: fade ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              {t("author")}, {t("role")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
