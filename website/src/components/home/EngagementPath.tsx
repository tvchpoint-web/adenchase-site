"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/brand/Icons";
import { ENGAGEMENT_STEPS } from "@/lib/site";

const ICONS: IconName[] = ["introduction", "discovery", "direction", "engineering", "expansion"];
const PURPOSE = ["Is there a fit?", "What is really there?", "What should we do?", "Build what it needs", "Measure and extend"];

/**
 * The five engagement stages as one pathway. The line fills, and each stage activates, as the
 * visitor scrolls through it (reversible). Horizontal on desktop, vertical on phones.
 */
export function EngagementPath() {
  const root = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stages = Array.from(el.querySelectorAll<HTMLElement>("[data-stage]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      el.style.setProperty("--fill", p.toFixed(3));
      stages.forEach((s, i) => (s.dataset.on = p >= (i + 0.35) / stages.length ? "1" : ""));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ol ref={root} className="engagement relative grid gap-6 lg:grid-cols-5 lg:gap-4" style={{ "--fill": 0 } as React.CSSProperties}>
      {/* Track and progress: vertical on phones, horizontal on desktop. */}
      <span aria-hidden className="absolute bottom-6 left-[1.45rem] top-6 w-px bg-white/[0.08] lg:bottom-auto lg:left-[1.75rem] lg:right-[calc(20%-1.75rem)] lg:top-[1.75rem] lg:h-px lg:w-auto" />
      <span aria-hidden className="engagement-fill absolute bottom-6 left-[1.45rem] top-6 w-px origin-top bg-[linear-gradient(180deg,#6EFA2E,#00F6FE,#005FFE)] lg:bottom-auto lg:left-[1.75rem] lg:right-[calc(20%-1.75rem)] lg:top-[1.75rem] lg:h-px lg:w-auto lg:origin-left lg:bg-[linear-gradient(90deg,#6EFA2E,#00F6FE,#005FFE)]" />
      {ENGAGEMENT_STEPS.map((s, i) => (
        <li key={s.title} data-stage className="stage relative grid grid-cols-[3rem_1fr] gap-4 lg:block">
          <span className="stage-node relative z-10 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-navy-deep text-haze transition-all duration-500 lg:h-14 lg:w-14">
            <Icon name={ICONS[i]} className="h-5 w-5 lg:h-6 lg:w-6" />
          </span>
          <div className="lg:mt-6">
            <p className="type-label text-[10px] text-haze">
              Stage 0{i + 1} · <span className="stage-purpose transition-colors duration-500">{PURPOSE[i]}</span>
            </p>
            <p className="mt-2 text-[1.08rem] font-semibold text-ink">{s.title}</p>
            <p className="mt-1.5 text-[0.9rem] leading-relaxed text-mist">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
