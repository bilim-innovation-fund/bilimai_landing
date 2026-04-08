"use client";

import { useRef, useEffect, useState, type CSSProperties, type ReactNode } from "react";

function useScrollVisible(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

type AnimateInProps = {
  children?: ReactNode;
  delay?: number;
  blur?: boolean;
  style?: CSSProperties;
  className?: string;
  as?: string;
};

export function AnimateIn({
  children,
  delay = 0,
  blur = false,
  style,
  className,
  as = "div",
}: AnimateInProps) {
  const { ref, visible } = useScrollVisible();
  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(20px)",
        filter: blur ? (visible ? "blur(0px)" : "blur(8px)") : undefined,
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s${blur ? `, filter 0.6s ease ${delay}s` : ""}`,
        willChange: "opacity, transform" + (blur ? ", filter" : ""),
      }}
    >
      {children}
    </Tag>
  );
}

type BlurWordsProps = {
  text: string;
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
  className?: string;
  as?: string;
};

export function BlurWords({
  text,
  delay = 0,
  stagger = 0.08,
  style,
  className,
  as = "h2",
}: BlurWordsProps) {
  const { ref, visible } = useScrollVisible();
  const Tag = as as "h2";
  const words = text.split(" ");

  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement>} className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(8px)",
            transform: visible ? "none" : "translateY(20px)",
            transition: `opacity 0.5s ease ${delay + i * stagger}s, filter 0.5s ease ${delay + i * stagger}s, transform 0.5s ease ${delay + i * stagger}s`,
            willChange: "opacity, filter, transform",
            backfaceVisibility: "hidden",
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
