"use client";

import { useEffect, useRef } from "react";
import { BLOCKS, BLOCK_COLOURS, BLOCK_TEXT, K, LOGO_H, LOGO_W, UNDERLINE, para, type Pt, type Quad } from "@/lib/blocks";
import { PHOTO } from "@/lib/photos";
import { StrategyProcess } from "@/components/home/StrategyProcess";
import { BrandBlock } from "@/components/brand/AngledPhoto";
import { Descriptor } from "@/components/brand/Descriptor";
import { CTA, OPERATING_PHILOSOPHY, SITE } from "@/lib/site";

/**
 * Opening prototype — storyboard v2.
 *
 * Frame 1 (the mark) plays on arrival; scrolling then drives frames 2–6 on a single,
 * reversible timeline. Everything is DOM + CSS clip-paths (no WebGL): the logo's three
 * blocks are real layers drawn with the artwork's exact geometry and colours, so they can
 * leave the wordmark and become the three portals.
 */

/* ------------------------------------------------------------- geometry */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const lerpQuad = (a: Quad, b: Quad, t: number): Quad => [lerpPt(a[0], b[0], t), lerpPt(a[1], b[1], t), lerpPt(a[2], b[2], t), lerpPt(a[3], b[3], t)];

interface LogoBox {
  left: number;
  top: number;
  width: number;
}
const logoQuad = (box: LogoBox, q: Quad): Quad => {
  const s = box.width / LOGO_W;
  return q.map(([x, y]) => [box.left + x * s, box.top + y * s]) as Quad;
};

/** Positions an element on a quad's bounding box and clips it to the quad. */
function placeQuad(el: HTMLElement | null, q: Quad) {
  if (!el) return;
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const w = Math.max(1, Math.max(...xs) - x0);
  const h = Math.max(1, Math.max(...ys) - y0);
  el.style.transform = `translate3d(${x0}px, ${y0}px, 0)`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.clipPath = `polygon(${q.map(([x, y]) => `${(x - x0).toFixed(1)}px ${(y - y0).toFixed(1)}px`).join(",")})`;
}

const show = (el: HTMLElement | null, o: number, dy = 0) => {
  if (!el) return;
  el.style.opacity = o.toFixed(3);
  el.style.transform = dy ? `translate3d(0, ${dy.toFixed(1)}px, 0)` : "";
  el.style.visibility = o < 0.005 ? "hidden" : "visible";
};

/* --------------------------------------------------------------- copy */

const { x0: UL_X0, x1: UL_X1, y: UL_Y } = UNDERLINE;
/** When each block activates in the intro. The green block is joined to the underline, so it never
 *  moves: it materialises in place as the underline's light reaches it (the light arrives at 0.56).
 *  Cyan, then sapphire, slide in along their own diagonal. */
const BLOCK_IN = [0.52, 0.64, 0.72];
/** Length of the intro, in ms of rendered frames (not wall-clock time; see `frame`). */
const INTRO_MS = 2600;

/** The operating philosophy: four connected steps (a real sequence, so the numbering is information). */
const SLICES = [
  { key: "identify", photo: PHOTO.sliceStrategy, label: "Identify", line: OPERATING_PHILOSOPHY[0] },
  { key: "connect", photo: PHOTO.sliceIntelligence, label: "Connect", line: OPERATING_PHILOSOPHY[1] },
  { key: "engineer", photo: PHOTO.sliceEngineering, label: "Engineer", line: OPERATING_PHILOSOPHY[2] },
  { key: "create", photo: PHOTO.sliceGrowth, label: "Create value", line: OPERATING_PHILOSOPHY[3] },
];
/**
 * The wordmark's four layers, each a full-width horizontal band cut losslessly from the artwork
 * (rows y0–y1 of the 1397×473 logo); stacked, they reproduce it exactly. Bands rather than full
 * canvases keep each file small and let the first layer to appear be the largest paint.
 */
const WM_LAYERS = [
  { k: "wmText", file: "text", y0: 0, y1: 216 },
  { k: "wmUnderline", file: "underline", y0: 216, y1: 262 },
  { k: "wmStrategies", file: "strategies", y0: 262, y1: 362 },
  { k: "wmDescriptor", file: "descriptor", y0: 362, y1: 473 },
] as const;
const LAYER_Y = Object.fromEntries(WM_LAYERS.map((l) => [l.k, l.y0])) as Record<string, number>;
const PORTALS = [
  { photo: PHOTO.portalStrategy, label: "Business Development", line: "Discover the opportunity." },
  { photo: PHOTO.portalEngineering, label: "AI Engineering", line: "Engineer the advantage." },
  { photo: PHOTO.portalGrowth, label: "Market Growth", line: "Expand what’s possible." },
];

/* ------------------------------------------------------------ component */

export function OpeningSequence() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els: Record<string, HTMLElement | null> = {};
    track.current?.querySelectorAll<HTMLElement>("[data-k]").forEach((el) => (els[el.dataset.k!] = el));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let raf = 0;
    let shown = -1; // smoothed progress (-1 until the first frame)
    // The intro is driven by rendered frame time, not wall-clock time, and starts only once the logo
    // artwork it reveals is decoded. A main-thread stall therefore pauses the intro instead of
    // skipping stages (a stall of 0.5 s during hydration used to jump it forward by a fifth), and no
    // stage can play before its layer can paint.
    let introMs = 0;
    let last = -1;
    let assetsReady = false;
    let introDone = false;
    let cssIntroDone = false;
    const art = [...WM_LAYERS.filter((l) => l.file !== "text").map((l) => `/photos/logo-${l.file}.webp`), ...BLOCKS.map((_, i) => `/photos/logo-block-${i}.png`)];
    Promise.race([
      Promise.all(
        art.map((src) => {
          const img = new Image();
          img.src = src;
          return img.decode().catch(() => undefined);
        }),
      ),
      new Promise((r) => setTimeout(r, 1500)),
    ]).then(() => (assetsReady = true));
    // Work elsewhere on the page that is heavy on the main thread (the Living Circuit's routing)
    // waits for this signal, so it never competes with the intro.
    root.dataset.openingIntro = "running";
    const finishIntro = () => {
      if (introDone) return;
      introDone = true;
      root.dataset.openingIntro = "done";
      window.dispatchEvent(new Event("opening:intro-done"));
    };
    let mobile = false;

    // Slice-caption metrics, measured once per layout (reset on resize and font load).
    let copyH: { w: number; dh: number; lH: number; gap: number; lines: number; line: number }[] = [];
    const setMobile = () => {
      // The stacked (portrait) choreography is used below the CSS 'lg' breakpoint, so the shapes'
      // geometry and the copy's CSS layout always agree (tablets previously got desktop shapes).
      mobile = window.innerWidth < 1024;
      copyH = [];
    };
    document.fonts?.ready.then(() => (copyH = []));
    setMobile();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const tr = track.current;
      if (!tr) return;
      // Side by side needs both width and a wide-enough panel for its caption (tall screens such as
      // 1280×1024 make each panel too narrow), otherwise the slices stack.
      const stackSlices = mobile || W < 1280 || sideSliceWidth(W, H) < 170;
      const rect = tr.getBoundingClientRect();
      const target = clamp01(-rect.top / Math.max(1, rect.height - H));
      const dt = last < 0 ? 0 : Math.min(now - last, 34); // a stalled frame counts as at most ~2 frames
      last = now;
      if (shown < 0) {
        // First frame. If the page opened part-way through the sequence (scroll restored on reload or
        // on Back), start there at rest: no fast-forward from the top, and no intro over a later frame.
        shown = target;
        if (target > 0.01) introMs = INTRO_MS;
      }
      // Time-based smoothing (time constant 130 ms): the same feel at 60, 120 or 144 Hz.
      shown = reduced ? target : lerp(shown, target, 1 - Math.exp(-dt / 130));
      if (Math.abs(shown - target) < 0.0002) shown = target;
      const p = shown;
      if (assetsReady || reduced) introMs += dt;
      const intro = reduced ? 1 : clamp01(introMs / INTRO_MS);
      if (intro >= 1) finishIntro();

      /* ---- logo placement: frame 1 (centre, large) and frame 4 (upper, smaller) */
      const f1w = mobile ? Math.min(W - 36, 560) : Math.min(1000, W * 0.56);
      const f4w = mobile ? Math.min(W - 64, 460) : Math.min(820, W * 0.46);
      const f1: LogoBox = { width: f1w, left: (W - f1w) / 2, top: H * (mobile ? 0.42 : 0.45) - (f1w * LOGO_H) / LOGO_W / 2 };
      const f4: LogoBox = { width: f4w, left: (W - f4w) / 2, top: H * (mobile ? 0.3 : 0.32) - (f4w * LOGO_H) / LOGO_W / 2 };
      const push = 1 + 0.02 * easeOut(intro); // slow 2% push-in on the opening
      const f1p: LogoBox = { width: f1.width * push, left: W / 2 - (f1.width * push) / 2, top: f1.top - (f1.width * (push - 1) * LOGO_H) / LOGO_W / 2 };

      /* ---- timeline (scroll progress p) */
      const sweep = ease(seg(p, 0.06, 0.18)); // F1 → F2: green band wipe
      // Copy hand-off F2 → F3: the outgoing copy has fully cleared (0.32) before any incoming copy
      // begins (0.34), so the two never overlap; the images keep their own, continuous timing.
      const f2copy = easeOut(seg(p, 0.12, 0.22)) * (1 - ease(seg(p, 0.27, 0.32)));
      const collapse = ease(seg(p, 0.5, 0.6)); // F3 → F4: slices resolve into the blocks
      const toPortals = ease(seg(p, 0.64, 0.76)); // F4 → F5
      const open = ease(seg(p, 0.8, 0.92)); // F5 → F6

      /* ---- the wordmark, in four layers cut from the official artwork (never redrawn):
         F1 entrance — ambient light, ADEN-CHASE, the underline lit left→right into the green
         block, cyan and sapphire blocks in turn, then STRATEGIES and the descriptor. F4: whole. */
      const inF1 = p < 0.4;
      const wmBox = inF1 ? f1p : f4;
      const leave = 1 - seg(p, 0.08, 0.15);
      const f4vis = seg(p, 0.54, 0.6) * (1 - seg(p, 0.64, 0.7));
      // The underline joins the green block, so in frame 4 it appears only once the blocks have landed.
      const f4underline = seg(p, 0.585, 0.6) * (1 - seg(p, 0.64, 0.7));
      // ADEN-CHASE itself enters by CSS (globals.css .opening-wm-text), so it paints before this
      // script has loaded; here it is simply present, and the rest of the intro follows from it.
      const textIn = 1;
      const underline = ease(seg(intro, 0.3, 0.56));
      const stratIn = easeOut(seg(intro, 0.74, 0.94));
      const descIn = easeOut(seg(intro, 0.8, 1));
      const layers: [string, number, number][] = [
        ["wmText", textIn, (1 - textIn) * 12],
        ["wmUnderline", underline > 0 ? 1 : 0, 0],
        ["wmStrategies", stratIn, (1 - stratIn) * 6],
        ["wmDescriptor", descIn, (1 - descIn) * 6],
      ];
      // If the visitor scrolls while the CSS entrance is still running, end it so the scroll-driven
      // fade-out applies immediately (a CSS animation would otherwise override it).
      if (!cssIntroDone && (p > 0.005 || intro >= 1)) {
        if (els.wmText) els.wmText.style.animation = "none";
        cssIntroDone = true;
      }
      layers.forEach(([k, a, dy]) => {
        const el = els[k];
        if (!el) return;
        const o = inF1 ? a * leave : k === "wmUnderline" ? f4underline : f4vis;
        el.style.width = `${wmBox.width}px`;
        const bandTop = (LAYER_Y[k] * wmBox.width) / LOGO_W;
        el.style.transform = `translate3d(${wmBox.left}px, ${wmBox.top + bandTop + (inF1 ? dy : 0)}px, 0)`;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.005 ? "hidden" : "visible";
      });
      const ul = els.wmUnderline;
      const sc = wmBox.width / LOGO_W;
      if (ul) {
        // Lit from the left edge of the underline (x 47) to where it meets the green block (≈ x 905).
        const front = UL_X0 + (UL_X1 - UL_X0) * (inF1 ? underline : 1);
        ul.style.clipPath = `inset(0 ${(100 - (front / LOGO_W) * 100).toFixed(2)}% 0 0)`;
      }
      const spark = els.spark;
      if (spark) {
        // The light at the underline's leading edge, carried into the first block.
        const into = easeOut(seg(intro, 0.54, 0.66));
        const ax = inF1 && underline < 1 ? UL_X0 + (UL_X1 - UL_X0) * underline : lerp(UL_X1, 900, into);
        const ay = inF1 && underline < 1 ? UL_Y : lerp(UL_Y, 292, into);
        const so = inF1 ? Math.min(seg(intro, 0.3, 0.34), 1 - seg(intro, 0.62, 0.7)) * leave : 0;
        spark.style.transform = `translate3d(${(f1p.left + ax * sc - 40).toFixed(1)}px, ${(f1p.top + ay * sc - 40).toFixed(1)}px, 0)`;
        spark.style.opacity = so.toFixed(3);
        spark.style.visibility = so < 0.005 ? "hidden" : "visible";
      }
      const amb = els.ambient;
      if (amb) amb.style.opacity = (0.35 + 0.65 * easeOut(seg(intro, 0, 0.4))).toFixed(3);

      /* ---- the three blocks */
      const run = K * H;
      BLOCKS.forEach((b, i) => {
        const el = els[`block${i}`];
        if (!el) return;
        let q: Quad;
        let alpha = 1;
        let photo = 0;
        if (p < 0.4) {
          // Frame 1: slide in along their own diagonal, one after another; leave with the sweep.
          const step = easeOut(seg(intro, BLOCK_IN[i], BLOCK_IN[i] + 0.12));
          const rest = logoQuad(f1p, b);
          const off = i === 0 ? 0 : (1 - step) * 26;
          q = rest.map(([x, y]) => [x - off * K * 0.5, y + off * 0.5]) as Quad;
          alpha = step * (1 - seg(p, 0.08, 0.15));
        } else if (p < 0.64) {
          // Frame 4: the slices resolve into the blocks at the logo's position.
          const rest = logoQuad(f4, b);
          const from = sliceQuad(Math.min(i, 3), W, H, stackSlices);
          q = lerpQuad(from, rest, collapse);
          alpha = seg(p, 0.5, 0.56);
        } else {
          // Frames 5–6: the blocks become portals; portal 01 opens.
          const rest = logoQuad(f4, b);
          const portal = portalQuad(i, W, H, mobile);
          const opened = openedQuad(i, W, H, mobile, run);
          q = toPortals < 1 ? lerpQuad(rest, portal, toPortals) : lerpQuad(portal, opened, open);
          photo = easeOut(seg(p, 0.68, 0.78));
        }
        placeQuad(el, q);
        const inMark = p < 0.4 || (p < 0.64 && collapse >= 0.999) || (p >= 0.64 && toPortals <= 0.001);
        const fill = inMark ? `url(/photos/logo-block-${i}.png) 0 0 / 100% 100% no-repeat` : BLOCK_COLOURS[i];
        if (el.dataset.fill !== fill) {
          el.style.background = fill;
          el.dataset.fill = fill;
        }
        // At rest in the mark the artwork crop carries its own shape; no clip edge to resample.
        if (inMark) el.style.clipPath = "none";
        el.style.opacity = alpha.toFixed(3);
        el.style.visibility = alpha < 0.005 ? "hidden" : "visible";
        const ph = els[`blockPhoto${i}`];
        if (ph) ph.style.opacity = (photo * (i === 0 ? 1 : 1 - open * 0.85)).toFixed(3);
        const inner = els[`blockInset${i}`];
        if (inner) {
          // The portal is the block opened up: its photo sits inside a 3px rim of the block's colour.
          const xs = q.map((pt) => pt[0]);
          const ys = q.map((pt) => pt[1]);
          const x0 = Math.min(...xs);
          const y0 = Math.min(...ys);
          const rx = 4;
          const ry = 3;
          const iq: Quad = [
            [q[0][0] + rx, q[0][1] + ry],
            [q[1][0] - rx, q[1][1] + ry],
            [q[2][0] - rx, q[2][1] - ry],
            [q[3][0] + rx, q[3][1] - ry],
          ];
          inner.style.clipPath = `polygon(${iq.map(([x, y]) => `${(x - x0).toFixed(1)}px ${(y - y0).toFixed(1)}px`).join(",")})`;
        }
        // Portal labels sit inside each parallelogram: the left edge is taken at the label's top,
        // and the width is reduced by the slant across the label's height, so no line crosses an edge.
        const label = els[`portalLabel${i}`];
        if (label && p >= 0.64) {
          const pq = portalQuad(i, W, H, mobile);
          const h = pq[3][1] - pq[0][1];
          const w = pq[2][0] - pq[3][0];
          const pad = mobile ? 12 : 22;
          // A fixed fitting height (not the measured one, which would feed back into the width).
          const lh = mobile ? 52 : 128;
          const bottom = h * (mobile ? 0.1 : 0.11);
          label.style.left = `${pq[3][0] + K * (bottom + lh) + pad}px`;
          label.style.top = `${pq[3][1] - bottom - lh}px`;
          label.style.width = `${Math.max(80, w - K * lh - 2 * pad)}px`;
        }
      });

      /* ---- frame 2: skyline revealed behind the green band */
      const sky = els.sky;
      const bandX = lerp(-run - 140, W + 60, sweep); // bottom-left x of the band's leading edge
      if (sky) {
        const vis = sweep > 0 ? 1 - ease(seg(p, 0.36, 0.44)) : 0;
        sky.style.clipPath = `polygon(0 0, ${bandX + run}px 0, ${bandX}px ${H}px, 0 ${H}px)`;
        sky.style.opacity = vis.toFixed(3);
        sky.style.visibility = vis < 0.005 ? "hidden" : "visible";
        const zoom = reduced ? 1 : 1.08 - 0.06 * seg(p, 0.1, 0.36);
        const img = els.skyImg;
        if (img) img.style.transform = `scale(${zoom.toFixed(4)})`;
      }
      const band = els.band;
      if (band) {
        placeQuad(band, para(bandX, H, mobile ? 34 : 64, H));
        const bv = sweep > 0 && sweep < 1 ? 1 : 0;
        band.style.opacity = String(bv);
        band.style.visibility = bv ? "visible" : "hidden";
      }
      show(els.f1tag, easeOut(seg(intro, 0.86, 1)) * (1 - seg(p, 0.05, 0.1)));
      show(els.f2, f2copy, (1 - f2copy) * 16);

      /* ---- frame 3: four slices on the logo's angle */
      // Four slices side by side need width; below 1280px they stack (as on tablets and phones).
      SLICES.forEach((_, i) => {
        const el = els[`slice${i}`];
        if (!el) return;
        const stagger = ease(seg(p, 0.3 + i * 0.025, 0.4 + i * 0.025));
        const base = sliceQuad(i, W, H, stackSlices);
        const target = lerpQuad(base, logoQuad(f4, BLOCKS[Math.min(i, 2)]), collapse);
        const lifted = target.map(([x, y]) => [x, y + (1 - stagger) * H * 0.18]) as Quad;
        placeQuad(el, lifted);
        const a = stagger * (1 - seg(p, 0.52, 0.58));
        el.style.opacity = a.toFixed(3);
        el.style.visibility = a < 0.005 ? "hidden" : "visible";
        const img = els[`sliceImg${i}`];
        if (img && !reduced) img.style.transform = `translate3d(0, ${((seg(p, 0.3, 0.55) - 0.5) * -24).toFixed(1)}px, 0) scale(1.06)`;
        const copy = els[`sliceCopy${i}`];
        if (copy) {
          // The caption is fitted to the VISIBLE parallelogram, not its bounding box. At a height y above
          // the slice's base, the shape spans [x0 + K·y, x0 + w + K·y]. The caption block (label, gap,
          // description; total height T, bottom at b) is placed at x0 + K·(b + T) + pad, so its top-left
          // corner is inside, and is w − K·T − 2·pad wide, so its bottom-right corner is inside too.
          // Label and description share one left edge. Side by side, all four labels share one line
          // (the block height is the tallest caption's); stacked, each panel fits its own.
          const h = base[3][1] - base[0][1];
          const w = base[2][0] - base[3][0];
          const label = copy.firstElementChild as HTMLElement | null;
          const desc = copy.lastElementChild as HTMLElement | null;
          if (label && desc) {
            const pad = stackSlices ? 14 : 12;
            const b = stackSlices ? 12 : h * 0.06;
            const minLines = stackSlices ? 2 : 3;
            if (!copyH[i]) copyH[i] = { w: 0, dh: 0, lH: 0, gap: 0, lines: 0, line: parseFloat(getComputedStyle(desc).lineHeight) || 22 };
            const m = copyH[i];
            // Solve once per layout: if the description wraps past its line budget, widen the budget
            // (which narrows the block) and measure again, so the fit holds for any copy length.
            for (let pass = 0; pass < 4; pass++) {
              const lines = Math.max(minLines, m.lines);
              const width = Math.round(Math.max(60, w - K * (lines * m.line + m.gap + m.lH) - 2 * pad));
              if (width === m.w) break;
              copy.style.width = `${width}px`;
              m.w = width;
              m.dh = desc.offsetHeight;
              m.lH = label.offsetHeight;
              m.gap = desc.offsetTop - (label.offsetTop + label.offsetHeight);
              m.lines = Math.round(m.dh / m.line);
            }
            const dh = stackSlices ? m.dh : Math.max(...copyH.map((c) => c?.dh ?? 0));
            const T = dh + m.gap + m.lH;
            copy.style.left = `${base[3][0] + K * (b + T) + pad}px`;
            copy.style.top = `${base[3][1] - b - T}px`;
          }
        }
        const copyIn = ease(seg(p, 0.34 + i * 0.02, 0.4 + i * 0.02));
        show(copy, copyIn * (1 - seg(p, 0.48, 0.53)), (1 - copyIn) * 18);
      });
      show(els.f3, ease(seg(p, 0.34, 0.42)) * (1 - seg(p, 0.48, 0.53)));

      /* ---- frame 4, 5, 6 copy */
      const f4c = easeOut(seg(p, 0.55, 0.61)) * (1 - seg(p, 0.65, 0.69));
      show(els.f4, f4c, (1 - f4c) * 14);
      const f5c = easeOut(seg(p, 0.7, 0.77)) * (1 - seg(p, 0.8, 0.85));
      show(els.f5, f5c, (1 - f5c) * 14);
      PORTALS.forEach((_, i) => show(els[`portalLabel${i}`], easeOut(seg(p, 0.72 + i * 0.015, 0.78 + i * 0.015)) * (1 - seg(p, 0.8, 0.84))));
      const f6c = easeOut(seg(p, 0.88, 0.96));
      show(els.f6, f6c, (1 - f6c) * 18);
      if (els.f6) els.f6.dataset.on = f6c > 0.6 ? "1" : "";
      show(els.f6shade, open);

      /* ---- header: hidden while the large mark is on screen (frames 1 and 4) */
      const hideHeader = p < 0.1 || (p > 0.52 && p < 0.67);
      if ((root.dataset.openingHideHeader === "1") !== hideHeader) root.dataset.openingHideHeader = hideHeader ? "1" : "";
      show(els.cue, easeOut(seg(intro, 0.8, 1)) * (1 - seg(p, 0.02, 0.06)));
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", setMobile);
    return () => {
      cancelAnimationFrame(raf);
      finishIntro();
      window.removeEventListener("resize", setMobile);
      delete root.dataset.openingHideHeader;
    };
  }, []);

  return (
    <div ref={track} className="relative h-[760svh]">
      {/* A solid Midnight Navy backdrop inside the pinned stage, so the official logo's darker navy field
          dissolves into it (the stage is its own stacking context for the logo's lighten blend). */}
      <div className="sticky top-0 h-svh overflow-hidden bg-navy" aria-hidden>
        <div data-k="ambient" className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_46%,rgba(0,95,254,0.2),transparent_70%)]" style={{ opacity: 0.35 }} />

        {/* Frame 2: skyline */}
        <div data-k="sky" className="absolute inset-0 overflow-hidden" style={{ visibility: "hidden" }}>
          <div data-k="skyImg" data-photo={PHOTO.skyline} className="photo absolute inset-0 bg-cover bg-[position:35%_70%] max-md:bg-[position:50%_60%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,10,48,0.9)_0%,rgba(0,10,48,0.55)_40%,transparent_66%)] max-md:bg-[linear-gradient(180deg,rgba(0,10,48,0.2)_0%,rgba(0,10,48,0.4)_40%,rgba(0,10,48,0.94)_72%)]" />
        </div>
        <div data-k="band" className="absolute left-0 top-0 bg-[#6EFA2E] will-change-transform" style={{ visibility: "hidden" }} />

        {/* Frame 3: four slices */}
        {SLICES.map((s, i) => (
          <div key={s.key} data-k={`slice${i}`} className="absolute left-0 top-0 overflow-hidden will-change-transform" style={{ visibility: "hidden" }}>
            <div data-k={`sliceImg${i}`} data-photo={s.photo} className="photo absolute -inset-[4%] bg-cover bg-center" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,10,48,0.88),rgba(0,10,48,0.15)_60%)]" />
          </div>
        ))}

        {/* The mark: the official wordmark layer plus the three blocks as separate layers */}
        {WM_LAYERS.map(({ k, file, y0, y1 }) => (
          // eslint-disable-next-line @next/next/no-img-element -- positioned every frame; must stay a plain layer
          <img
            key={k}
            data-k={k}
            src={`/photos/logo-${file}.webp`}
            width={LOGO_W}
            height={y1 - y0}
            fetchPriority={file === "text" ? "high" : undefined}
            alt=""
            className={`absolute left-0 top-0 h-auto will-change-transform select-none ${file === "text" ? "opening-wm-text" : ""}`}
            style={file === "text" ? undefined : { opacity: 0 }}
            draggable={false}
          />
        ))}
        <div data-k="spark" className="opening-spark absolute left-0 top-0 h-20 w-20" style={{ opacity: 0 }} />
        {BLOCKS.map((_, i) => (
          <div key={i} data-k={`block${i}`} className="absolute left-0 top-0 will-change-transform" style={{ background: BLOCK_COLOURS[i], opacity: 0 }}>
            <div data-k={`blockInset${i}`} className="absolute inset-0 overflow-hidden">
              <div data-k={`blockPhoto${i}`} className="absolute inset-0" style={{ opacity: 0 }}>
                <div data-photo={PORTALS[i].photo} className="photo absolute inset-0 bg-cover bg-center" />
                <div className="absolute inset-0" style={{ background: `color-mix(in oklab, ${BLOCK_COLOURS[i]} 20%, transparent)`, mixBlendMode: "color" }} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,16,61,0.15),rgba(0,10,48,0.86)_82%)]" />
              </div>
            </div>
          </div>
        ))}
        <div data-k="f6shade" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,10,48,0.75)_0%,rgba(0,10,48,0.3)_45%,transparent_70%)] max-md:bg-[linear-gradient(180deg,rgba(0,10,48,0.2)_0%,rgba(0,10,48,0.6)_38%,rgba(0,10,48,0.96)_60%)]" style={{ opacity: 0 }} />
      </div>

      {/* Copy layers (sticky with the stage) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh">
          <a data-k="cue" href="#business-development" className="type-label pointer-events-auto absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-haze" style={{ opacity: 0, visibility: "hidden" }}>
            Scroll
            <span aria-hidden className="block h-8 w-px bg-line" />
          </a>

          <div data-k="f2" className="pointer-events-auto absolute left-5 right-5 bottom-[9svh] sm:left-8 lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:w-[46%] lg:-translate-y-1/2" style={{ opacity: 0, visibility: "hidden" }}>
            <p className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              <Descriptor />
            </p>
            {/* Visual hero headline; the document's h1 (same words) is in page.tsx. */}
            <p aria-hidden className="type-display mt-6 text-ink">
              Identifying
              <br />
              Opportunity.
              <br />
              <span className="text-jade">
                Engineering
                <br />
                Growth.
              </span>
            </p>
            <p className="mt-6 max-w-[33rem] text-[0.98rem] leading-relaxed text-mist lg:type-lede">
              {SITE.support}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="/capabilities" className="btn btn-primary justify-center">
                {CTA.capabilities} <span aria-hidden className="btn-arrow">→</span>
              </a>
              <a href="/contact" className="btn btn-ghost justify-center">
                {CTA.conversation}
              </a>
            </div>
          </div>

          {SLICES.map((s, i) => (
            <div key={s.key} data-k={`sliceCopy${i}`} className="slice-copy absolute" data-i={i} style={{ opacity: 0 }}>
              <p className="type-label text-jade max-md:text-[10px]">
                <span className="block opacity-70">0{i + 1}</span>
                <span className="block whitespace-nowrap">{s.label}</span>
              </p>
              <p className="mt-2 text-[1rem] font-medium leading-snug text-ink md:text-[1.2rem] xl:mt-3 xl:text-[1.06rem] xl:tracking-[-0.01em]">{s.line}</p>
            </div>
          ))}
          <p data-k="f3" className="type-lede absolute bottom-[5svh] left-5 right-5 text-mist sm:left-8 lg:left-12 lg:max-w-[46rem]" style={{ opacity: 0 }}>
            {SITE.belief}
          </p>

          <div data-k="f4" className="absolute inset-x-5 top-[46svh] text-center lg:top-[55svh]" style={{ opacity: 0 }}>
            <p className="type-title mx-auto max-w-[52rem] text-ink">
              We see opportunities others overlook—<span className="text-jade">and engineer the solutions to realize them.</span>
            </p>
          </div>

          <div data-k="f5" className="absolute left-5 top-24 sm:left-8 lg:left-12 lg:top-[18svh] lg:w-[30%]" style={{ opacity: 0 }}>
            <p className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Choose where to begin
            </p>
            <p className="mt-5 hidden text-[4rem] font-semibold leading-[0.95] tracking-[-0.035em] text-ink lg:block">
              Choose where
              <br />
              growth <span className="text-jade">begins.</span>
            </p>
          </div>
          {PORTALS.map((pt, i) => (
            <div key={pt.label} data-k={`portalLabel${i}`} className="portal-label absolute" data-i={i} style={{ opacity: 0 }}>
              <p className="type-label flex items-center gap-2.5 max-md:text-[10px]" style={{ color: BLOCK_TEXT[i] }}>
                <BrandBlock block={i as 0 | 1 | 2} className="h-2.5 w-auto" />
                0{i + 1}
              </p>
              <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.015em] text-ink lg:mt-2 lg:text-[1.55rem]">{pt.label}</p>
              <p className="mt-2 hidden text-[0.875rem] leading-relaxed text-mist lg:block">{pt.line}</p>
            </div>
          ))}

          <div data-k="f6" className="pointer-events-auto absolute bottom-[5svh] left-5 right-5 sm:left-8 lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:w-[38%] lg:-translate-y-1/2" style={{ opacity: 0, visibility: "hidden" }}>
            <p className="type-label flex items-center gap-3" style={{ color: BLOCK_COLOURS[0] }}>
              <span aria-hidden className="h-px w-8" style={{ background: BLOCK_COLOURS[0] }} />
              01 · Business Development
            </p>
            <p className="mt-4 text-[2rem] font-semibold leading-[0.98] tracking-[-0.03em] text-ink lg:mt-5 lg:text-[4.1rem]">
              See the opportunity. <span style={{ color: BLOCK_COLOURS[0] }}>Build the advantage.</span>
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-mist lg:type-lede lg:mt-5">
              Growth is not always about doing more. Sometimes it&rsquo;s about recognizing what others have missed—and connecting capabilities, markets, and relationships to create value.
            </p>
            <StrategyProcess />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-7">
              <a href="/business-development" className="btn btn-primary justify-center">
                Explore Business Development <span aria-hidden className="btn-arrow">→</span>
              </a>
              <a href="#ai-engineering" className="btn btn-ghost justify-center max-lg:hidden">
                Next: AI Engineering
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- per-frame shape layouts */

/** The width of each slice when the four sit side by side. */
function sideSliceWidth(W: number, H: number) {
  const h = H - 110 - 150;
  return (W - 96 - K * h - 3 * 18) / 4;
}

function sliceQuad(i: number, W: number, H: number, mobile: boolean): Quad {
  if (mobile) {
    const top = 84;
    const bottom = H * 0.22;
    const gap = 8;
    const h = (H - top - bottom - 3 * gap) / 4;
    const yB = top + i * (h + gap) + h;
    return para(12, yB, W - 24 - K * h, h);
  }
  const top = 110;
  const h = H - top - 150;
  const gap = 18;
  const w = sideSliceWidth(W, H);
  return para(48 + i * (w + gap), top + h, w, h);
}

function portalQuad(i: number, W: number, H: number, mobile: boolean): Quad {
  if (mobile) {
    const top = 150;
    const h = (H - top - 60 - 24) / 3;
    const w = Math.min(W * 0.56, 480);
    // Centre the stepped stack (each portal steps 12px right) within the viewport.
    const x0 = (W - (w + K * h + 24)) / 2;
    return para(x0 + i * 12, top + i * (h + 12) + h, w, h);
  }
  const h = H * 0.6;
  const w = Math.min(340, W * 0.185);
  const gap = 26;
  const total = 3 * w + 2 * gap + K * h;
  const x0 = W - total - Math.max(48, W * 0.05);
  return para(x0 + i * (w + gap), H * 0.3 + h, w, h);
}

function openedQuad(i: number, W: number, H: number, mobile: boolean, run: number): Quad {
  if (i === 0) {
    // Portal 01 widens to fill the screen beyond a single diagonal edge.
    const edge = mobile ? -run * 0.35 : W * 0.43;
    return [
      [edge + run, 0],
      [W + run + 40, 0],
      [W + 40, H],
      [edge, H],
    ];
  }
  // Portals 02 and 03 wait as slivers at the right edge, on the same angle.
  // On the stacked (phone/tablet) layout the copy fills the lower half, so the slivers wait above it.
  const h = mobile ? H * 0.24 : H * 0.4;
  const x = W - (mobile ? 60 : 110) + (i - 1) * (mobile ? 16 : 26) - K * h;
  return para(x, mobile ? H * 0.34 : H * 0.7, mobile ? 8 : 14, h);
}
