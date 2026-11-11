"use client";

import { useEffect, useRef, useState } from "react";
import { InView } from "@/components/motion/InView";
import { BLOCK_COLOURS, BLOCK_TEXT } from "@/lib/blocks";

const OUTCOMES = [
  { title: "Stronger Digital Visibility", line: "Found, and chosen, where buyers look.", art: "visibility" },
  { title: "Better Customer Experiences", line: "The moments that build trust and loyalty.", art: "customer" },
  { title: "Operational Efficiency", line: "Less manual effort, fewer hand-offs.", art: "efficiency" },
  { title: "Strategic Partnerships", line: "Alliances that open new ground.", art: "partnership" },
  { title: "New Revenue Opportunities", line: "Growth from existing strengths.", art: "revenue" },
  { title: "Market Expansion", line: "Considered entry into new markets.", art: "expansion" },
] as const;

/** A small, distinct illustration per outcome — one stroke language, animated softly on hover. */
function Art({ kind, colour }: { kind: (typeof OUTCOMES)[number]["art"]; colour: string }) {
  const common = { fill: "none", stroke: colour, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 64 64" className="outcome-art h-14 w-14" aria-hidden>
      {kind === "visibility" && (
        <g {...common}>
          <circle cx="32" cy="32" r="6" fill={colour} fillOpacity="0.9" stroke="none" />
          <circle className="art-ping" cx="32" cy="32" r="14" strokeOpacity="0.7" />
          <circle className="art-ping art-ping-2" cx="32" cy="32" r="24" strokeOpacity="0.35" />
        </g>
      )}
      {kind === "customer" && (
        <g {...common}>
          <circle className="art-left" cx="25" cy="32" r="13" strokeOpacity="0.85" />
          <circle className="art-right" cx="39" cy="32" r="13" strokeOpacity="0.85" />
          <path d="M32 22.5a13 13 0 0 1 0 19 13 13 0 0 1 0-19Z" fill={colour} fillOpacity="0.25" stroke="none" />
        </g>
      )}
      {kind === "efficiency" && (
        <g {...common}>
          <path d="M12 42a20 20 0 1 1 40 0" strokeOpacity="0.8" />
          <path d="M16 42h4M44 42h4M32 18v4" strokeOpacity="0.5" />
          <path className="art-needle" d="M32 42 42 28" strokeWidth="2" />
          <circle cx="32" cy="42" r="2.5" fill={colour} stroke="none" />
        </g>
      )}
      {kind === "partnership" && (
        <g {...common}>
          <circle className="art-left" cx="25" cy="32" r="11" strokeWidth="2" />
          <circle className="art-right" cx="39" cy="32" r="11" strokeWidth="2" strokeOpacity="0.7" />
        </g>
      )}
      {kind === "revenue" && (
        <g {...common}>
          <path d="M12 50h40" strokeOpacity="0.5" />
          <rect className="art-bar" x="16" y="38" width="7" height="12" rx="1.5" fill={colour} fillOpacity="0.35" stroke="none" />
          <rect className="art-bar" x="28.5" y="30" width="7" height="20" rx="1.5" fill={colour} fillOpacity="0.55" stroke="none" style={{ animationDelay: "80ms" }} />
          <rect className="art-bar" x="41" y="20" width="7" height="30" rx="1.5" fill={colour} fillOpacity="0.85" stroke="none" style={{ animationDelay: "160ms" }} />
          <path d="M14 34 27 24l8 4 15-14m0 0h-6m6 0v6" />
        </g>
      )}
      {kind === "expansion" && (
        <g {...common}>
          <rect x="26" y="26" width="12" height="12" rx="2.5" fill={colour} fillOpacity="0.85" stroke="none" />
          <g className="art-out">
            <path d="M22 22 12 12m0 0h7m-7 0v7M42 22l10-10m0 0h-7m7 0v7M22 42 12 52m0 0h7m-7 0v-7M42 42l10 10m0 0h-7m7 0v-7" />
          </g>
        </g>
      )}
    </svg>
  );
}

/**
 * Six outcomes as one connected system: distinct illustrated tiles, joined by a path that a
 * jade signal travels in sequence. The path is measured from the tiles, so it fits any layout.
 */
export function Outcomes() {
  const grid = useRef<HTMLOListElement>(null);
  const [path, setPath] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-tile]"));
      const pts = tiles.map((t) => {
        const r = t.getBoundingClientRect();
        return [r.left - box.left + 38, r.top - box.top + 46] as const;
      });
      // Snake through the tiles in reading order, row by row.
      const cols = Math.max(1, Math.round(box.width / (tiles[0]?.getBoundingClientRect().width || box.width)));
      const order: number[] = [];
      for (let r = 0; r * cols < pts.length; r++) {
        const row = Array.from({ length: Math.min(cols, pts.length - r * cols) }, (_, c) => r * cols + c);
        order.push(...(r % 2 ? row.reverse() : row));
      }
      setPath(order.map((i, k) => `${k ? "L" : "M"}${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`).join(" "));
      setSize({ w: box.width, h: box.height });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  return (
    <InView className="outcomes relative">
      <svg className="pointer-events-none absolute inset-0 hidden sm:block" width={size.w} height={size.h} aria-hidden>
        {path && (
          <>
            <path d={path} fill="none" stroke="rgba(131,253,128,0.16)" strokeWidth="1" strokeDasharray="2 6" />
            <circle r="3" fill="#83FD80" className="outcome-pulse">
              <animateMotion dur="9s" repeatCount="indefinite" path={path} />
            </circle>
          </>
        )}
      </svg>
      <ol ref={grid} className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OUTCOMES.map((o, i) => {
          const b = (i % 3) as 0 | 1 | 2;
          return (
            <li key={o.title} data-tile className="outcome-tile" style={{ "--i": i } as React.CSSProperties}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(10,30,80,0.8),rgba(1,11,40,0.92))] p-6 transition-[transform,border-color,box-shadow] duration-300 ease-brand hover:-translate-y-1 hover:shadow-[0_28px_50px_-30px_rgba(0,0,0,0.9)]" style={{ "--c": BLOCK_COLOURS[b] } as React.CSSProperties}>
                <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: BLOCK_COLOURS[b] }} />
                <span aria-hidden className="absolute left-0 top-0 h-[2px] w-12 -skew-x-[34deg] transition-[width] duration-500 ease-brand group-hover:w-24" style={{ background: BLOCK_COLOURS[b] }} />
                <div className="relative flex items-start justify-between">
                  <Art kind={o.art} colour={BLOCK_TEXT[b]} />
                  <span className="type-label text-[10px]" style={{ color: BLOCK_TEXT[b] }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="relative mt-5 text-[1.12rem] font-semibold tracking-[-0.01em] text-ink">{o.title}</p>
                <p className="relative mt-1.5 text-[0.9rem] leading-relaxed text-mist">{o.line}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </InView>
  );
}
