"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nexusState } from "@/components/nexus/store";

gsap.registerPlugin(ScrollTrigger);

const SCENES = [
  { id: "arrival", label: "Arrival" },
  { id: "discovery", label: "Discovery" },
  { id: "engineering", label: "Engineering" },
  { id: "growth", label: "Growth" },
  { id: "begin", label: "Private Engagement" },
] as const;

/**
 * Maps native scroll position to the Nexus story (0–4). Scene i is fully
 * reached when its section's centre crosses the viewport centre; between
 * sections the value is continuous, so scrolling backward retraces exactly
 * the same states. Nothing here hijacks or snaps the browser's scrolling.
 */
export function StoryController() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = SCENES.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    let bounds: { top: number; height: number }[] = [];
    const measure = () => {
      bounds = sections.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, height: r.height };
      });
    };
    const update = () => {
      if (!bounds.length) measure();
      const center = window.scrollY + window.innerHeight / 2;
      let story = 0;
      for (let i = 0; i < bounds.length; i++) {
        const b = bounds[i];
        const local = (center - b.top) / b.height; // 0 at section top, 1 at bottom
        if (center >= b.top) story = i + local - 0.5;
      }
      story = Math.min(Math.max(story, 0), sections.length - 1);
      nexusState.storyTarget = story;
      setActive(Math.round(story));
    };
    const st = ScrollTrigger.create({
      trigger: sections[0].parentElement ?? sections[0],
      start: "top top",
      end: "bottom bottom",
      onUpdate: update,
      onRefresh: () => {
        measure();
        update();
      },
    });
    measure();
    update();
    return () => st.kill();
  }, []);

  return (
    <nav aria-label="Story chapters" className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 xl:right-10 lg:block">
      <ol className="flex flex-col items-end gap-3">
        {SCENES.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === i ? "step" : undefined}
              className="group flex items-center gap-3 py-1 text-[0.6875rem] uppercase tracking-[0.22em]"
            >
              <span className={`rounded bg-navy-deep/60 px-1.5 py-0.5 backdrop-blur-sm transition-opacity duration-300 ${active === i ? "text-ink opacity-100" : "text-haze opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>
                {s.label}
              </span>
              <span
                aria-hidden
                className={`block h-px transition-all duration-500 ease-brand ${active === i ? "w-10 bg-jade" : "w-5 bg-haze/60 group-hover:w-7 group-hover:bg-ocean"}`}
              />
              <span className="sr-only">{`Chapter ${i + 1}`}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
