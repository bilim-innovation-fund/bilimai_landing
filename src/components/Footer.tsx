"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { AnimateIn } from "./AnimateIn";

const footerLinks = [
  { labelKey: "features" as const, href: "#features" },
  { labelKey: "lessonGenerator" as const, href: "#lesson-generator" },
  { labelKey: "faq" as const, href: "#faq" },
];

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer
      className="footer-section"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#101011",
        padding: "100px 0 40px",
        overflow: "hidden",
      }}
    >
      {/* Container */}
      <div
        className="footer-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          width: "100%",
          maxWidth: 1350,
          padding: "0 30px",
        }}
      >
        {/* Footer Grid */}
        <div
          className="footer-grid"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 80,
            width: "100%",
          }}
        >
          {/* Footer About — left column */}
          <AnimateIn
            className="footer-about"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              alignSelf: "stretch",
            }}
          >
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "block", lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-white.svg"
                alt="BilimAI"
                width={140}
                height={40}
                style={{ display: "block", width: 140, height: 40, objectFit: "contain" }}
              />
            </Link>

            {/* Social */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: "1.4em",
                  color: "#a7a7a7",
                }}
              >
                {t("followUs")}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/home/footer/facebook.svg"
                    alt="Facebook"
                    width={10}
                    height={18}
                    style={{ objectFit: "contain" }}
                  />
                </a>
                {/* Divider */}
                <div
                  style={{
                    width: 1,
                    height: 28,
                    backgroundColor: "#2b2b2c",
                  }}
                />
                <a
                  href="https://www.linkedin.com/company/bilim-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/home/footer/linkedin.svg"
                    alt="LinkedIn"
                    width={18}
                    height={18}
                    style={{ objectFit: "contain" }}
                  />
                </a>
              </div>
            </div>
          </AnimateIn>

          {/* Footer Menu — right column */}
          <AnimateIn
            delay={0.15}
            className="footer-menu"
            style={{
              flex: 0.5,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(50px, 1fr))",
              gap: 30,
            }}
          >
            {/* Quick Links */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              <h6
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: "1.1em",
                  color: "#ffffff",
                }}
              >
                {t("quickLinks")}
              </h6>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                {footerLinks.map((link) => (
                  <a
                    key={link.labelKey}
                    href={link.href}
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      lineHeight: "1.4em",
                      color: "#a7a7a7",
                      textDecoration: "none",
                    }}
                  >
                    {tNav(link.labelKey)}
                  </a>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#2b2b2c",
          }}
        />

        {/* Copyright */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: "1.4em",
            color: "#a7a7a7",
            textAlign: "center",
          }}
        >
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
