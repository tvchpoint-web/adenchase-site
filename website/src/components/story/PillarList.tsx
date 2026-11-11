"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nexusState } from "@/components/nexus/store";
import { DISCIPLINES } from "@/lib/site";

/**
 * The three service pillars. Hover or keyboard focus highlights the matching
 * region of the Nexus while the rest of the system stays visible. On touch
 * devices (no hover) the pillar nearest the centre of the screen is highlighted.
 */
export function PillarList({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLOListElement>(null);
  const focus = (region: number) => {
    setActive(region);
    nexusState.focusRegion = region;
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list || !window.matchMedia("(hover: none)").matches) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-region]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) focus(Number((e.target as HTMLElement).dataset.region));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      nexusState.focusRegion = -1;
    };
  }, []);

  useEffect(() => () => void (nexusState.focusRegion = -1), []);

  return (
    <ol ref={listRef} className="border-t border-line" onMouseLeave={() => focus(-1)}>
      {DISCIPLINES.map((d) => {
        const on = active === d.region;
        return (
          <li key={d.id} data-region={d.region} className="border-b border-line">
            <Link
              href={`/expertise#${d.id}`}
              onMouseEnter={() => focus(d.region)}
              onFocus={() => focus(d.region)}
              onBlur={() => focus(-1)}
              className={`group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 transition-colors duration-200 ${compact ? "py-4" : "py-5 lg:py-6"}`}
            >
              <span className={`type-label transition-colors duration-200 ${on ? "text-jade" : "text-haze"}`}>{d.index}</span>
              <span>
                <span className={`block text-[1.25rem] font-medium tracking-[-0.015em] transition-colors duration-200 lg:text-[1.5rem] ${on ? "text-ink" : "text-ink/85"}`}>
                  {d.title}
                </span>
                <span className="mt-1.5 block max-w-md text-[0.9375rem] leading-relaxed text-mist">{d.line}</span>
              </span>
              <span aria-hidden className={`text-lg transition-all duration-300 ease-brand ${on ? "translate-x-0 text-jade opacity-100" : "-translate-x-1 text-haze opacity-60"}`}>
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
