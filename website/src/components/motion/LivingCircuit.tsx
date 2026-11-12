"use client";

import { useEffect, useRef, useState } from "react";
import { K, LOGO_H, LOGO_W, UNDERLINE as UL } from "@/lib/blocks";
import { buildGrid, chamfer, lengthAtDepth, pointAt, route, snapFree, track, type P, type Rect, type Track } from "@/lib/route";

/** Content the signal must never cross. */
const OBSTACLES = "h1,h2,h3,h4,p,a,button,img,figure,svg,ol,ul,input,textarea,select,label,blockquote,[data-photo],[data-obstacle],.demo-panel";
/** Underline start in the artwork: where the signal enters the mark. */
const UNDERLINE = { x: UL.x0 / LOGO_W, y: UL.y / LOGO_H };
/**
 * The light. Diffuse lamps reveal the photographed board along the signal's recent path (the head
 * brightest, older positions fading); a tighter highlight lamp adds the glints on metal — pins,
 * pads, solder — that only appear close to a real light source.
 */
const LAMPS = [
  { back: 0, a: 0.78, r: 1 },
  { back: 170, a: 0.44, r: 0.84 },
  { back: 360, a: 0.22, r: 0.72 },
  { back: 600, a: 0.09, r: 0.6 },
];
/** The board photographs (natural size). Phones get the centre of the board at full resolution. */
const BOARD = {
  desktop: { src: "/photos/pcb.webp", spec: "/photos/pcb-spec.webp", w: 1920, h: 1280 },
  mobile: { src: "/photos/pcb-m.webp", spec: "/photos/pcb-spec-m.webp", w: 960, h: 1280 },
};

interface Geo {
  w: number;
  h: number;
  d: string;
  t: Track | null;
  nodes: { x: number; y: number; l: number }[];
  mobile: boolean;
}

const EMPTY: Geo = { w: 0, h: 0, d: "", t: null, nodes: [], mobile: false };

function rel(r: DOMRect, box: DOMRect): Rect {
  return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
}

/** Nearest length on the track to a point (coarse scan, then refined). */
function lengthNear(t: Track, p: P): number {
  let best = 0;
  let bd = Infinity;
  for (let l = 0; l <= t.total; l += 8) {
    const q = pointAt(t, l);
    const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
    if (d < bd) {
      bd = d;
      best = l;
    }
  }
  return best;
}

/**
 * The Living Circuit. A jade signal routed through the page's negative space — down the gutters,
 * across the open bands between content groups, around every block of copy, image and control —
 * with turns cut on the logo's slant. Underneath lies a real macro photograph of a circuit board,
 * almost invisible on the navy; only the light travelling with the signal reveals the traces near
 * it, and that light fades as the signal moves on. Scroll-linked and reversible; the route is
 * recomputed for every layout. Reduced motion: the full route drawn quietly, no moving light.
 */
export function LivingCircuit() {
  const host = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo>(EMPTY);

  useEffect(() => {
    const el = host.current;
    const root = el?.parentElement;
    if (!el || !root) return;
    let timer = 0;
    const measure = () => {
      const box = root.getBoundingClientRect();
      const W = box.width;
      const H = box.height;
      const vw = window.innerWidth;
      const mobile = vw < 768;
      const tablet = !mobile && vw < 1100;
      const cell = mobile ? 5 : tablet ? 6 : 10;
      const inflate = mobile ? 7 : tablet ? 9 : 22;
      const end = root.querySelector<HTMLElement>("[data-trail-end]");
      const obstacles: Rect[] = [];
      root.querySelectorAll<HTMLElement>(OBSTACLES).forEach((n) => {
        if (el.contains(n) || end?.contains(n) || n.closest("[aria-hidden='true'].absolute")) return;
        const r = n.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.width > W * 0.92 && r.height > 260) return; // full-bleed backdrops are not content
        obstacles.push(rel(r, box));
      });
      // Keep the signal off the very edge of the viewport.
      // (Rects are inflated by the grid, so these are offset to block exactly `edge` px.)
      const edge = mobile ? 3 : 8;
      obstacles.push({ x: -2 * inflate - 4, y: 0, w: inflate + edge + 4, h: H }, { x: W - edge + inflate, y: 0, w: inflate + 4, h: H });
      const g = buildGrid(W, H, cell, obstacles, inflate);

      const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-trail-anchor]"));
      const sections = Array.from(root.querySelectorAll<HTMLElement>(":scope > section"));
      const first = anchors[0]?.getBoundingClientRect();
      const gutterL = Math.max(mobile ? 8 : 14, (first ? first.left - box.left : 40) - (mobile ? 11 : 26));
      const gutterR = W - gutterL;

      // Waypoints: each section is entered at its discipline marker on the left; inside it the signal
      // crosses to the far side through the widest open band; it returns at the next section.
      const way: P[] = [{ x: gutterL, y: 0 }];
      const rowFree = (y: number) => {
        const r = Math.floor(y / cell);
        if (r < 0 || r >= g.rows) return false;
        const c0 = Math.ceil(gutterL / cell);
        const c1 = Math.floor(gutterR / cell);
        for (let c = c0; c <= c1; c++) if (g.blocked[r * g.cols + c]) return false;
        return true;
      };
      sections.forEach((s, i) => {
        const r = rel(s.getBoundingClientRect(), box);
        if (s.contains(end)) return;
        const a = anchors.find((n) => s.contains(n));
        let top = r.y;
        if (a) {
          const ar = rel(a.getBoundingClientRect(), box);
          top = ar.y + ar.h / 2;
          way.push({ x: gutterL, y: top });
        }
        // Open bands (full-width free rows) inside the section, below the marker.
        const bands: { y0: number; y1: number }[] = [];
        let start = -1;
        for (let y = top + 40; y < r.y + r.h - 20; y += cell) {
          const free = rowFree(y);
          if (free && start < 0) start = y;
          if ((!free || y + cell >= r.y + r.h - 20) && start >= 0) {
            if (y - start >= cell * 3) bands.push({ y0: start, y1: y });
            start = -1;
          }
        }
        if (bands.length) {
          const mid = r.y + r.h * 0.5;
          bands.sort((p, q) => Math.abs((p.y0 + p.y1) / 2 - mid) - Math.abs((q.y0 + q.y1) / 2 - mid));
          const b = bands[0];
          // Alternate the far side between the right gutter and the centre of the page.
          const x = i % 2 === 0 || mobile ? gutterR : W * 0.5;
          way.push({ x, y: (b.y0 + b.y1) / 2 });
        }
      });
      let endPt: P | null = null;
      if (end) {
        const r = rel(end.getBoundingClientRect(), box);
        endPt = { x: r.x + r.w * UNDERLINE.x, y: r.y + r.h * UNDERLINE.y };
        way.push({ x: Math.max(gutterL, endPt.x - (mobile ? 18 : 40)), y: endPt.y });
      } else {
        way.push({ x: gutterL, y: H - 40 });
      }

      let poly: P[] = [];
      const snapped = way.map((p, i) => (i === 0 ? p : snapFree(g, p)));
      for (let i = 1; i < snapped.length; i++) {
        const seg = route(g, snapped[i - 1], snapped[i], mobile ? 14 : 26);
        poly = poly.concat(i === 1 ? seg : seg.slice(1));
      }
      if (!poly.length) return;
      poly[0] = { x: poly[0].x, y: 0 };
      if (endPt) poly.push({ x: poly[poly.length - 1].x, y: endPt.y }, endPt);
      // Clean: remove zero-length steps and merge collinear points.
      const clean: P[] = [];
      for (const p of poly) {
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
        const q = clean[clean.length - 1];
        if (q && Math.abs(q.x - p.x) < 0.5 && Math.abs(q.y - p.y) < 0.5) continue;
        clean.push(p);
      }
      const pts = chamfer(clean.filter((p, i, arr) => {
        if (i === 0 || i === arr.length - 1) return true;
        const a = arr[i - 1];
        const c = arr[i + 1];
        return !((Math.abs(a.x - p.x) < 0.5 && Math.abs(p.x - c.x) < 0.5) || (Math.abs(a.y - p.y) < 0.5 && Math.abs(p.y - c.y) < 0.5));
      }), mobile ? 10 : 22, K);
      const t = track(pts, mobile ? 110 : 220);
      const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
      const nodes = anchors.map((a) => {
        const ar = rel(a.getBoundingClientRect(), box);
        const p = { x: gutterL, y: ar.y + ar.h / 2 };
        const l = lengthNear(t, p);
        const q = pointAt(t, l);
        return { x: q.x, y: q.y, l };
      });
      setGeo({ w: W, h: H, d, t, nodes, mobile });
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 180);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    window.addEventListener("resize", schedule);
    // Images and reveals settle after load; measure again then.
    window.addEventListener("load", schedule);
    schedule();
    // Text reflows when the web font arrives, without necessarily changing the container's size.
    document.fonts?.ready.then(schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const el = host.current;
    const root = el?.parentElement;
    const t = geo.t;
    if (!el || !root || !t) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lit = el.querySelector<SVGPathElement>("[data-lit-path]");
    const tail = el.querySelector<SVGPathElement>("[data-tail]");
    const head = el.querySelector<SVGGElement>("[data-head]");
    const stage = el.querySelector<HTMLElement>("[data-stage]");
    const board = el.querySelector<HTMLElement>("[data-board]");
    const glow = el.querySelector<HTMLElement>("[data-glow]");
    const specLamp = el.querySelector<HTMLElement>("[data-spec]");
    const lamps = Array.from(el.querySelectorAll<HTMLElement>("[data-lamp]"));
    const nodeEls = Array.from(el.querySelectorAll<SVGCircleElement>("[data-node]"));
    const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-trail-anchor], [data-trail-end]"));
    if (!lit || !tail || !head || !glow || !stage || !board || !specLamp) return;
    const img = geo.mobile ? BOARD.mobile : BOARD.desktop;
    const total = t.total;
    // The light scales with the viewport so it stays in the open space around the signal.
    const vw = window.innerWidth;
    const R = Math.round(Math.min(300, Math.max(160, vw * 0.2)));
    const RS = Math.round(R * 0.55);
    const TRAVEL = geo.mobile ? 240 : 320;
    const TAIL = geo.mobile ? 260 : 520;
    lit.style.strokeDasharray = `${total} ${total}`;
    tail.style.strokeDasharray = `${TAIL} ${total + TAIL}`;
    lamps.forEach((lamp, i) => (lamp.style.width = lamp.style.height = `${(2 * R * LAMPS[i].r).toFixed(0)}px`));
    specLamp.style.width = specLamp.style.height = `${2 * RS}px`;
    let cur = -1;
    let target = 0;
    let raf = 0;
    let lastSize = "";
    let lastClip = "";
    /**
     * The board is ONE photograph on a deeper layer, held to the viewport and drifting slowly as the
     * page scrolls (parallax): no tiling, no seams, and a sense of depth beneath the surface. The
     * lamps live in the same viewport space, so the light and the board can never slip apart.
     */
    const paint = (l: number) => {
      const W = window.innerWidth;
      const Hv = window.innerHeight;
      const box = root.getBoundingClientRect();
      const visible = box.bottom > 0 && box.top < Hv;
      stage.style.visibility = visible ? "visible" : "hidden";
      if (visible) {
        const top = Math.max(0, box.top);
        const bottom = Math.max(0, Hv - box.bottom);
        const clip = top > 0 || bottom > 0 ? `inset(${top.toFixed(0)}px 0 ${bottom.toFixed(0)}px 0)` : "none";
        if (clip !== lastClip) {
          stage.style.clipPath = clip;
          lastClip = clip;
        }
      }
      const sc = Math.max(W / img.w, (Hv + TRAVEL) / img.h);
      const dw = img.w * sc;
      const dh = img.h * sc;
      const prog = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height - Hv)));
      const bx = (W - dw) / 2;
      const by = -(dh - Hv) * prog;
      const size = `${dw.toFixed(1)}px ${dh.toFixed(1)}px`;
      if (size !== lastSize) {
        board.style.width = `${dw.toFixed(1)}px`;
        board.style.height = `${dh.toFixed(1)}px`;
        lamps.forEach((lamp) => (lamp.style.backgroundSize = size));
        specLamp.style.backgroundSize = size;
        lastSize = size;
      }
      board.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;

      lit.style.strokeDashoffset = `${total - l}`;
      tail.style.strokeDashoffset = `${-(l - TAIL)}`;
      const on = l > 2 && l < total - 2;
      const p = pointAt(t, l);
      head.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      head.style.opacity = on ? "1" : "0";
      const hx = box.left + p.x;
      const hy = box.top + p.y;
      glow.style.transform = `translate3d(${(hx - 90).toFixed(1)}px, ${(hy - 90).toFixed(1)}px, 0)`;
      glow.style.opacity = on ? "1" : "0";
      // Place a lamp of radius r at a viewport point, showing the board exactly as it lies beneath.
      const place = (node: HTMLElement, x: number, y: number, r: number) => {
        node.style.transform = `translate3d(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px, 0)`;
        node.style.backgroundPosition = `${(bx - x + r).toFixed(1)}px ${(by - y + r).toFixed(1)}px`;
      };
      lamps.forEach((lamp, i) => {
        const spec = LAMPS[i];
        const ll = l - spec.back;
        const q = pointAt(t, Math.max(0, ll));
        place(lamp, box.left + q.x, box.top + q.y, R * spec.r);
        lamp.style.opacity = on && ll > 0 ? `${spec.a}` : "0";
      });
      place(specLamp, hx, hy, RS);
      specLamp.style.opacity = on ? "0.85" : "0";
      nodeEls.forEach((n, i) => (n.style.opacity = geo.nodes[i].l <= l + 4 ? "1" : "0"));
      anchors.forEach((a, i) => {
        const on2 = i < geo.nodes.length ? geo.nodes[i].l <= l + 4 : l >= total - 4;
        if ((a.dataset.lit === "1") !== on2) a.dataset.lit = on2 ? "1" : "";
      });
    };
    const frame = () => {
      raf = 0;
      cur = cur < 0 ? target : cur + (target - cur) * 0.16;
      if (Math.abs(target - cur) < 0.5) cur = target;
      paint(cur);
      if (cur !== target) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      const box = root.getBoundingClientRect();
      target = lengthAtDepth(t, window.innerHeight * 0.56 - box.top);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    if (reduced) {
      // Reduced motion: the route drawn quietly in full; no moving light and no parallax board.
      lit.style.strokeDashoffset = "0";
      tail.style.opacity = "0";
      stage.style.display = "none";
      nodeEls.forEach((n) => (n.style.opacity = "1"));
      anchors.forEach((a) => (a.dataset.lit = "1"));
      return;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [geo]);

  const img = geo.mobile ? BOARD.mobile : BOARD.desktop;
  const ready = !!geo.t;
  const boardBg = ready ? { backgroundImage: `url(${img.src})`, backgroundRepeat: "no-repeat" } : undefined;

  return (
    <div ref={host} aria-hidden className="living-circuit pointer-events-none absolute inset-0 overflow-hidden">
      {/* Viewport-space stage, clipped to this part of the page: the board beneath, and its light. */}
      <div data-stage className="lc-stage fixed inset-0 overflow-hidden" style={{ visibility: "hidden" }}>
        <div data-board className="lc-board absolute left-0 top-0" style={boardBg && { ...boardBg, backgroundSize: "100% 100%" }} />
        {LAMPS.map((_, i) => (
          <div key={i} data-lamp className="lc-lamp absolute left-0 top-0" style={{ ...boardBg, opacity: 0 }} />
        ))}
        <div data-spec className="lc-spec absolute left-0 top-0" style={ready ? { backgroundImage: `url(${img.spec})`, backgroundRepeat: "no-repeat", opacity: 0 } : { opacity: 0 }} />
        <div data-glow className="lc-glow absolute left-0 top-0 h-[180px] w-[180px]" style={{ opacity: 0 }} />
      </div>
      <svg className="absolute inset-0 z-[5] overflow-visible" width={geo.w} height={geo.h}>
        <defs>
          <radialGradient id="lc-head">
            <stop offset="0" stopColor="#83FD80" stopOpacity="0.9" />
            <stop offset="1" stopColor="#83FD80" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={geo.d} fill="none" stroke="rgba(131,253,128,0.07)" strokeWidth="1" />
        <path data-lit-path d={geo.d} fill="none" stroke="#83FD80" strokeOpacity="0.32" strokeWidth="1.1" strokeLinejoin="miter" />
        <path data-tail d={geo.d} fill="none" stroke="#83FD80" strokeOpacity="0.95" strokeWidth="1.6" strokeLinejoin="miter" style={{ filter: "drop-shadow(0 0 4px rgba(131,253,128,0.6))" }} />
        {geo.nodes.map((n, i) => (
          <g key={i} transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`}>
            <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="#00103D" stroke="rgba(131,253,128,0.4)" />
            <circle data-node={i} r="2.4" fill="#83FD80" style={{ opacity: 0, transition: "opacity 400ms" }} />
          </g>
        ))}
        <g data-head style={{ opacity: 0 }}>
          <circle r="16" fill="url(#lc-head)" />
          <circle r="2.8" fill="#EFFFF0" />
        </g>
      </svg>
    </div>
  );
}
