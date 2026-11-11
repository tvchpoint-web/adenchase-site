"use client";

import { useEffect, useRef } from "react";
import { BLOCK_COLOURS, K, type Quad } from "@/lib/blocks";

const poly = (q: Quad) => `polygon(${q.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;

/**
 * A photograph framed in the logo's angled-block geometry. The frame is a parallelogram on
 * the mark's exact slant, edged in the discipline's block colour; on entering the viewport it
 * opens out from the narrow block itself, and closes again when scrolled back above it.
 */
export function AngledPhoto({
  photo,
  block = 0,
  className = "",
  position = "center",
  rim = 3,
}: {
  photo: string;
  /** 0 Business Strategy (green), 1 AI Engineering (cyan), 2 Market Growth (blue). */
  block?: 0 | 1 | 2;
  className?: string;
  position?: string;
  rim?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const edge = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let open = reduced;
    const layout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const run = Math.min(K * h, w * 0.42);
      const k = run / h;
      const shape = (x: number, width: number): Quad => [
        [x + run, 0],
        [x + width + run, 0],
        [x + width, h],
        [x, h],
      ];
      const full = shape(0, w - run);
      const closed = shape(0, Math.max(14, (w - run) * 0.1));
      const q = open ? full : closed;
      const iq: Quad = [
        [q[0][0] + rim * (1 + k), q[0][1] + rim],
        [q[1][0] - rim * (1 + k), q[1][1] + rim],
        [q[2][0] - rim * (1 + k), q[2][1] - rim],
        [q[3][0] + rim * (1 + k), q[3][1] - rim],
      ];
      if (edge.current) edge.current.style.clipPath = poly(q);
      if (inner.current) {
        inner.current.style.clipPath = poly(iq);
        inner.current.style.opacity = open ? "1" : "0.35";
      }
    };
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        const next = reduced || e.isIntersecting || e.boundingClientRect.top < 0;
        if (next !== open) {
          open = next;
          layout();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    layout();
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [rim]);

  return (
    <div ref={box} className={`relative ${className}`} aria-hidden>
      <div ref={edge} className="angled-clip absolute inset-0" style={{ background: BLOCK_COLOURS[block] }} />
      <div ref={inner} className="angled-clip absolute inset-0 overflow-hidden">
        <div className="photo absolute inset-0 bg-cover" data-photo={photo} style={{ backgroundPosition: position }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,10,48,0.55))]" />
      </div>
    </div>
  );
}

/**
 * The mark's three solid blocks, taken from the official artwork (public/brand/aden-chase-blocks.png,
 * cropped from the logo with its navy field removed) — never redrawn or outlined.
 */
export function BrandBlocks({ className = "h-4 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny decorative brand crop
  return <img src="/brand/aden-chase-blocks.png" width={497} height={112} alt="" aria-hidden className={`select-none ${className}`} draggable={false} />;
}

/** One block of the mark (0 green, 1 cyan, 2 blue), cut from the official artwork. */
export function BrandBlock({ block, className = "h-4 w-auto" }: { block: 0 | 1 | 2; className?: string }) {
  const size = [
    [198, 112],
    [198, 112],
    [215, 112],
  ][block];
  // eslint-disable-next-line @next/next/no-img-element -- tiny decorative brand crop
  return <img src={`/photos/logo-block-${block}.png`} width={size[0]} height={size[1]} alt="" aria-hidden className={`select-none ${className}`} draggable={false} />;
}
