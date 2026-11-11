"use client";

import { useEffect, useRef, useState } from "react";

interface Geo {
  d: string;
  w: number;
  h: number;
  x: number;
  nodes: number[];
  turnY: number;
  ex: number;
  ey: number;
}

const EMPTY: Geo = { d: "", w: 0, h: 0, x: 0, nodes: [], turnY: 0, ex: 0, ey: 0 };
/** Scroll distance over which the signal crosses from the spine to the mark. */
const BAND = 260;

/**
 * The Neon Jade signal that accompanies the visitor: one spine in the left margin (it never
 * crosses copy) with a node at every [data-trail-anchor] — the three disciplines, capabilities,
 * engagement. At the conclusion it turns along the final section's top edge and descends into the
 * mark ([data-trail-end]). Its head follows the reading position; nodes and anchors light as it
 * reaches them, and everything reverses when scrolling back. Reduced motion: drawn in full.
 */
export function ScrollTrail() {
  const svg = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<Geo>(EMPTY);

  useEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-trail-anchor]"));
    const end = root.querySelector<HTMLElement>("[data-trail-end]");
    const measure = () => {
      if (!anchors.length) return;
      const box = root.getBoundingClientRect();
      const mobile = window.innerWidth < 768;
      const first = anchors[0].getBoundingClientRect();
      const x = Math.max(mobile ? 9 : 16, first.left - box.left - (mobile ? 12 : 26));
      const nodes = anchors.map((a) => {
        const r = a.getBoundingClientRect();
        return r.top - box.top + r.height / 2;
      });
      let d = `M${x.toFixed(1)} 0`;
      let turnY = nodes[nodes.length - 1] + 200;
      let ex = x;
      let ey = turnY;
      if (end) {
        const r = end.getBoundingClientRect();
        const section = end.closest("section")?.getBoundingClientRect();
        turnY = (section ? section.top : r.top - 80) - box.top + 1;
        ex = r.left - box.left + r.width * 0.42;
        ey = r.top - box.top + r.height * 0.55;
        d += ` L${x.toFixed(1)} ${turnY.toFixed(1)} L${ex.toFixed(1)} ${turnY.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`;
      } else {
        d += ` L${x.toFixed(1)} ${turnY.toFixed(1)}`;
      }
      setGeo({ d, w: box.width, h: box.height, x, nodes, turnY, ex, ey });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = svg.current;
    const root = s?.parentElement;
    if (!s || !root || !geo.d) return;
    const path = s.querySelector<SVGPathElement>("[data-progress]");
    const head = s.querySelector<SVGGElement>("[data-head]");
    if (!path || !head) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = path.getTotalLength();
    const run = Math.abs(geo.ex - geo.x);
    // Reading depth → length: the spine 1:1, the closing run across a short band, then the descent.
    const lengthAt = (depth: number) => {
      if (depth <= geo.turnY) return Math.max(0, depth);
      const into = depth - geo.turnY;
      if (into <= BAND) return geo.turnY + run * (into / BAND);
      return Math.min(total, geo.turnY + run + (into - BAND));
    };
    const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-trail-anchor], [data-trail-end]"));
    const nodes = Array.from(s.querySelectorAll<SVGCircleElement>("[data-node]"));
    path.style.strokeDasharray = `${total}`;
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = root.getBoundingClientRect();
      const depth = window.innerHeight * 0.58 - box.top;
      const l = reduced ? total : lengthAt(depth);
      path.style.strokeDashoffset = `${total - l}`;
      const pt = path.getPointAtLength(l);
      head.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      head.style.opacity = !reduced && l > 2 && l < total - 2 ? "1" : "0";
      nodes.forEach((n, i) => (n.style.opacity = reduced || geo.nodes[i] <= depth + 4 ? "1" : "0"));
      anchors.forEach((a) => {
        const lit = reduced || a.getBoundingClientRect().top + a.offsetHeight / 2 - box.top <= depth + 4;
        if ((a.dataset.lit === "1") !== lit) a.dataset.lit = lit ? "1" : "";
      });
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
  }, [geo]);

  return (
    <svg ref={svg} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible" width={geo.w} height={geo.h}>
      <defs>
        <radialGradient id="trail-head">
          <stop offset="0" stopColor="#83FD80" stopOpacity="0.9" />
          <stop offset="1" stopColor="#83FD80" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={geo.d} fill="none" stroke="rgba(131,253,128,0.10)" strokeWidth="1" />
      <path data-progress d={geo.d} fill="none" stroke="#83FD80" strokeOpacity="0.75" strokeWidth="1.25" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 3px rgba(131,253,128,0.55))" }} />
      {geo.nodes.map((y, i) => (
        <g key={i} transform={`translate(${geo.x.toFixed(1)} ${y.toFixed(1)})`}>
          <circle r="5.5" fill="#00103D" stroke="rgba(131,253,128,0.35)" />
          <circle data-node={i} r="2.4" fill="#83FD80" style={{ opacity: 0, transition: "opacity 400ms" }} />
        </g>
      ))}
      <g data-head style={{ opacity: 0 }}>
        <circle r="14" fill="url(#trail-head)" />
        <circle r="2.6" fill="#E9FFE8" />
      </g>
    </svg>
  );
}
