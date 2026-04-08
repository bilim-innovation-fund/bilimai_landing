"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Navigation() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setVisible(y < 50 || y < lastScrollY.current);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locales = [
    { code: "en", label: "EN", flag: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1ec-1f1e7.svg" },
    { code: "kk", label: "KZ", flag: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1f0-1f1ff.svg" },
    { code: "ru", label: "RU", flag: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1f7-1f1fa.svg" },
  ];

  const currentLocale = locales.find((l) => l.code === locale) ?? locales[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#f9f8f4",
        padding: "16px 0",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
      }}
    >
      <nav
        className="nav-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 1350,
          padding: "0 30px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "block", lineHeight: 0, height: 40, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="BilimAI Logo"
            width={116}
            height={40}
            style={{ display: "block", width: 116, height: 40, objectFit: "contain" }}
          />
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Language Switcher */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                height: 40,
                padding: "0 18px",
                borderRadius: 99,
                backgroundColor: "white",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentLocale.flag}
                alt={currentLocale.label}
                style={{ width: 18, height: 18, objectFit: "contain" }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  lineHeight: 1,
                  color: "#2b2b2c",
                }}
              >
                {currentLocale.label}
              </span>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  zIndex: 100,
                  backgroundColor: "white",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  minWidth: 120,
                }}
              >
                {locales.map((l) => (
                  <Link
                    key={l.code}
                    href="/"
                    locale={l.code}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 18px",
                      border: "none",
                      background: l.code === locale ? "#f0f2f6" : "none",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#2b2b2c",
                      textDecoration: "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.flag}
                      alt={l.label}
                      style={{ width: 18, height: 18, objectFit: "contain" }}
                    />
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact Us Button */}
          <a
            href="mailto:it@bil.edu.kz"
            target="_blank"
            rel="noopener"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 99,
              border: "1px solid #101011",
              backgroundColor: "#141415",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.4,
              color: "white",
              textDecoration: "none",
            }}
          >
            {t("contactUs")}
          </a>
        </div>
      </nav>
    </header>
  );
}
