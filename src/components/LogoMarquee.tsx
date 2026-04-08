"use client";

import { useRef, useCallback } from "react";
import { AnimateIn } from "./AnimateIn";

const logos = [
  { src: "/images/home/partners/bil.png", alt: "Білім-Інновация", width: 180, height: 73 },
  { src: "/images/home/partners/nurorda.png", alt: "Nurorda", width: 180, height: 36 },
  { src: "/images/home/partners/sdu.png", alt: "SDU", width: 134, height: 55 },
  { src: "/images/home/partners/bif.png", alt: "BIF", width: 114, height: 53 },
  { src: "/images/home/partners/spectrum.png", alt: "Spectrum", width: 180, height: 36 },
  { src: "/images/home/partners/sdl.png", alt: "SDL School", width: 180, height: 73 },
];

export function LogoMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const currentRate = useRef(1);
  const targetRate = useRef(1);

  const lerp = useCallback(() => {
    currentRate.current += (targetRate.current - currentRate.current) * 0.03;
    const el = trackRef.current;
    if (el) {
      const anims = el.getAnimations();
      if (anims.length > 0) {
        (anims[0] as CSSAnimation).playbackRate = currentRate.current;
      }
    }
    if (Math.abs(currentRate.current - targetRate.current) > 0.001) {
      rafRef.current = requestAnimationFrame(lerp);
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    targetRate.current = 0.1;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(lerp);
  }, [lerp]);

  const onMouseLeave = useCallback(() => {
    targetRate.current = 1;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(lerp);
  }, [lerp]);

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <AnimateIn
        as="section"
        className="marquee-section"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 100,
        }}
      >
        <div
          className="marquee-wrapper"
          style={{
            width: "100%",
            maxWidth: 1350,
            padding: "0 30px",
          }}
        >
          <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
              width: "100%",
              height: 78,
              overflow: "hidden",
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)",
            }}
          >
            <div
              ref={trackRef}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 80,
                animation: "marquee 60s linear infinite",
                width: "max-content",
              }}
            >
              {[...logos, ...logos].map((logo, i) => (
                <div
                  key={i}
                  style={{
                    width: logo.width,
                    height: logo.height,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimateIn>
    </>
  );
}
