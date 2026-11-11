"use client";

import { useEffect, useRef } from "react";

/* A 240px tile of circuit traces and pads, drawn in Ocean Blue and rendered barely visible. */
const TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' fill='none' stroke='%2300D3FB' stroke-width='1'><path d='M0 40h60l20 20h50M130 60h40l14-14h56M20 0v18l22 22M200 0v30l-16 16M0 150h36l24-24h40l12 12h44M156 138v36l22 22h62M60 240v-40l18-18h30M150 240v-22l-14-14H96M240 100h-36l-16 16v22M110 126V96l-14-14'/><g fill='%2300D3FB' stroke='none'><circle cx='130' cy='60' r='2.4'/><circle cx='60' cy='40' r='2.4'/><circle cx='100' cy='126' r='2.4'/><circle cx='156' cy='138' r='2.4'/><circle cx='108' cy='182' r='2.4'/><circle cx='188' cy='116' r='2.4'/><circle cx='42' cy='40' r='1.6'/><circle cx='184' cy='46' r='1.6'/></g></svg>`;

/**
 * A faint circuit-board texture behind every page, with gentle parallax (it drifts at a fraction
 * of the scroll speed). Static under reduced motion.
 */
export function CircuitBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.backgroundPosition = `0 ${(-window.scrollY * 0.06).toFixed(1)}px`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.055]"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${TILE}")`,
        backgroundSize: "240px 240px",
        maskImage: "radial-gradient(120% 90% at 60% 40%, #000 30%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(120% 90% at 60% 40%, #000 30%, transparent 85%)",
      }}
    />
  );
}
