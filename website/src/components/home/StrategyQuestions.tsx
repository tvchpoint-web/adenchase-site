"use client";

import { useId, useState } from "react";
import { InView } from "@/components/motion/InView";

const QUESTIONS = [
  {
    q: "Where is the most valuable opportunity we are not yet pursuing?",
    a: "We look across demand, adjacent markets, partnerships and existing strengths to find the opportunity that would matter most — and what it would take to pursue it.",
  },
  {
    q: "What should we stop doing to move faster on what matters?",
    a: "Focus is a strategic decision. We identify the activity, spend and complexity that no longer serve the direction, so effort concentrates where it counts.",
  },
  {
    q: "Which partnerships would change our position in the market?",
    a: "We assess the partners, channels and alliances that could open markets or capabilities the business could not reach alone.",
  },
];

/** The three strategic questions as a connected decision framework: staggered rows that expand into an insight. */
export function StrategyQuestions() {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <InView className="decision relative">
      <span aria-hidden className="decision-rail absolute bottom-6 left-[1.05rem] top-6 w-px origin-top bg-[linear-gradient(180deg,#6EFA2E,rgba(110,250,46,0.15))]" />
      <ol className="space-y-3">
        {QUESTIONS.map((item, i) => {
          const on = open === i;
          return (
            <li key={item.q} className="decision-row relative pl-12" style={{ "--i": i } as React.CSSProperties}>
              <span
                aria-hidden
                className={`absolute left-[0.6rem] top-[1.15rem] grid h-[0.95rem] w-[0.95rem] place-items-center rounded-full border transition-all duration-300 ${on ? "border-[#6EFA2E] bg-[#6EFA2E] shadow-[0_0_14px_2px_rgba(110,250,46,0.45)]" : "border-[#6EFA2E]/60 bg-navy-deep"}`}
              />
              <div className={`rounded-2xl border transition-[background-color,border-color] duration-300 ${on ? "border-[#6EFA2E]/30 bg-[#6EFA2E]/[0.045]" : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]"}`}>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`${id}-${i}`}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                >
                  <span>
                    <span className="type-label block text-[10px] text-[#6EFA2E]/80">Question 0{i + 1}</span>
                    <span className="mt-1.5 block text-[1.02rem] font-medium leading-snug text-ink">{item.q}</span>
                  </span>
                  <span aria-hidden className={`mt-5 shrink-0 text-[#6EFA2E] transition-transform duration-300 ${on ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div id={`${id}-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-brand ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden px-5 text-[0.93rem] leading-relaxed text-mist">
                    <span className="block pb-5">{item.a}</span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </InView>
  );
}
