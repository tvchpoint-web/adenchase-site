"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __acReveal?: boolean;
  }
}

/**
 * Drives every [data-reveal] element with ScrollTrigger. Reveals play as an
 * element enters and reverse when the visitor scrolls back above it, so the
 * editorial layer stays in step with the (equally reversible) 3D story.
 * CSS owns the actual motion; this only toggles `.is-in`.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    window.__acReveal = true;
    document.documentElement.classList.remove("reveal-all");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const triggers = els.map((el) => {
      // Content that starts on screen (e.g. the hero) reveals on load, after the scene begins to assemble.
      const immediate = el.closest("[data-reveal-immediate]");
      return ScrollTrigger.create({
        trigger: el,
        start: immediate ? "top bottom" : "top 88%",
        onEnter: () => el.classList.add("is-in"),
        onLeaveBack: () => {
          if (!immediate) el.classList.remove("is-in");
        },
      });
    });
    // After fonts settle, positions can shift; re-measure once.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => triggers.forEach((t) => t.kill());
  }, [pathname]);

  return null;
}
