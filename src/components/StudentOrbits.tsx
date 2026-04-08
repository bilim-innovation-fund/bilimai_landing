"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Orbit radii in px (relative to center), matched to the image's concentric rings
// Ring 1 (inner): ~70px, Ring 2 (mid): ~105px, Ring 3 (outer): ~140px at ~400px container height
// Angles: 0°=right, 90°=down, 180°=left, 270°=up
// Ring fractions of Math.min(w,h)/2, mapped to the 4 concentric rings in the background image
const students = [
  { src: "/images/home/features/students/1.avif", ring: 0.62, startAngle: 260 },  // top, slightly left
  { src: "/images/home/features/students/2.avif", ring: 0.55, startAngle: 320 },  // upper right
  { src: "/images/home/features/students/3.avif", ring: 0.88, startAngle: 180 },  // far left
  { src: "/images/home/features/students/4.avif", ring: 0.68, startAngle: 130 },  // lower left
  { src: "/images/home/features/students/5.avif", ring: 0.88, startAngle: 40 },   // lower right
];

export function StudentOrbits() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
    };

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const p = Math.max(
        0,
        Math.min(1, (windowH - rect.top) / (windowH + rect.height))
      );
      setProgress(p);
    };

    updateSize();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Use the shorter dimension so orbits are always circular
  const radius = Math.min(size.w, size.h) / 2;
  const cx = size.w / 2;
  const cy = size.h / 2;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 25,
        overflow: "hidden",
      }}
    >
      {/* Background image with orbits and sphere */}
      <Image
        src="/images/home/features/student-ai-learning.png"
        alt="Student AI Learning"
        fill
        sizes="(max-width: 1350px) 33vw, 430px"
        style={{ objectFit: "cover" }}
      />

      {/* Student avatars orbiting on scroll */}
      {students.map((student, i) => {
        const angle = student.startAngle + progress * 120;
        const rad = (angle * Math.PI) / 180;
        const r = radius * student.ring;
        const x = cx + Math.cos(rad) * r - 18;
        const y = cy + Math.sin(rad) * r - 18;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 36,
              height: 36,
              borderRadius: "50%",
              overflow: "hidden",
              zIndex: 3,
              transition: "left 0.15s linear, top 0.15s linear",
            }}
          >
            <img
              src={student.src}
              alt={`Student ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
