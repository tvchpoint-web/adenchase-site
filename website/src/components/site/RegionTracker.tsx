"use client";

import { useEffect } from "react";
import { nexusState } from "@/components/nexus/store";

/**
 * Links discipline sections to the Nexus: the section in the middle of the
 * viewport (or under the pointer / keyboard focus) highlights its region.
 */
export function RegionTracker() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-region]"));
    let hoverRegion = -1;
    let scrollRegion = -1;
    const apply = () => (nexusState.focusRegion = hoverRegion >= 0 ? hoverRegion : scrollRegion);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const r = Number((e.target as HTMLElement).dataset.region);
          if (e.isIntersecting) scrollRegion = r;
          else if (scrollRegion === r) scrollRegion = -1;
        }
        apply();
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    const cleanups = els.map((el) => {
      const r = Number(el.dataset.region);
      const enter = () => {
        hoverRegion = r;
        apply();
      };
      const leave = () => {
        hoverRegion = -1;
        apply();
      };
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      el.addEventListener("focusin", enter);
      el.addEventListener("focusout", leave);
      io.observe(el);
      return () => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        el.removeEventListener("focusin", enter);
        el.removeEventListener("focusout", leave);
      };
    });
    return () => {
      io.disconnect();
      cleanups.forEach((c) => c());
      nexusState.focusRegion = -1;
    };
  }, []);
  return null;
}
