"use client";

import { useEffect, useRef } from "react";
import { BLOCKS, BLOCK_COLOURS, BLOCK_TEXT, K, LOGO_H, LOGO_W, para, type Pt, type Quad } from "@/lib/blocks";

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

const SLICES = [
  { key: "strategy", label: "Strategy", line: "See the opportunity before the market does." },
  { key: "engineering", label: "AI Engineering", line: "Systems that carry strategy into operation." },
  { key: "intelligence", label: "Intelligence", line: "Better information at the moment it matters." },
  { key: "growth", label: "Market Growth", line: "Direction turned into commercial momentum." },
];
const PORTALS = [
  { photo: "towers", label: "Business Strategy", line: "Identify opportunity. Establish direction." },
  { photo: "intelligence", label: "AI Engineering", line: "Engineer intelligent systems that improve how businesses operate." },
  { photo: "earth", label: "Market Growth", line: "Turn direction into commercial momentum." },
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
    let shown = 0; // smoothed progress
    let t0 = -1;
    let mobile = false;

    const setMobile = () => (mobile = window.innerWidth < 768);
    setMobile();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const tr = track.current;
      if (!tr) return;
      const rect = tr.getBoundingClientRect();
      const target = clamp01(-rect.top / Math.max(1, rect.height - H));
      shown = reduced ? target : lerp(shown, target, 0.12);
      if (Math.abs(shown - target) < 0.0002) shown = target;
      const p = shown;
      if (t0 < 0) t0 = now;
      const intro = reduced ? 1 : clamp01((now - t0) / 1900);

      /* ---- logo placement: frame 1 (centre, large) and frame 4 (upper, smaller) */
      const f1w = mobile ? Math.min(W - 36, 420) : Math.min(1000, W * 0.56);
      const f4w = mobile ? Math.min(W - 64, 360) : Math.min(820, W * 0.46);
      const f1: LogoBox = { width: f1w, left: (W - f1w) / 2, top: H * (mobile ? 0.42 : 0.45) - (f1w * LOGO_H) / LOGO_W / 2 };
      const f4: LogoBox = { width: f4w, left: (W - f4w) / 2, top: H * (mobile ? 0.3 : 0.32) - (f4w * LOGO_H) / LOGO_W / 2 };
      const push = 1 + 0.02 * easeOut(intro); // slow 2% push-in on the opening
      const f1p: LogoBox = { width: f1.width * push, left: W / 2 - (f1.width * push) / 2, top: f1.top - (f1.width * (push - 1) * LOGO_H) / LOGO_W / 2 };

      /* ---- timeline (scroll progress p) */
      const sweep = ease(seg(p, 0.06, 0.18)); // F1 → F2: green band wipe
      const f2copy = easeOut(seg(p, 0.12, 0.22)) * (1 - ease(seg(p, 0.3, 0.36)));
      const slicesIn = ease(seg(p, 0.3, 0.42)); // F2 → F3
      const collapse = ease(seg(p, 0.5, 0.6)); // F3 → F4: slices resolve into the blocks
      const toPortals = ease(seg(p, 0.64, 0.76)); // F4 → F5
      const open = ease(seg(p, 0.8, 0.92)); // F5 → F6

      /* ---- wordmark: present in F1 (after intro) and F4 */
      const wmBox = p < 0.4 ? f1p : f4;
      const wmVisible = p < 0.4 ? easeOut(seg(intro, 0, 0.55)) * (1 - seg(p, 0.08, 0.15)) : seg(p, 0.54, 0.6) * (1 - seg(p, 0.64, 0.7));
      const wm = els.wordmark;
      if (wm) {
        wm.style.width = `${wmBox.width}px`;
        wm.style.transform = `translate3d(${wmBox.left}px, ${wmBox.top + (1 - easeOut(seg(intro, 0, 0.55))) * 14}px, 0)`;
        wm.style.opacity = wmVisible.toFixed(3);
        wm.style.visibility = wmVisible < 0.005 ? "hidden" : "visible";
      }

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
          const step = easeOut(seg(intro, 0.25 + i * 0.12, 0.62 + i * 0.12));
          const rest = logoQuad(f1p, b);
          const off = (1 - step) * 40;
          q = rest.map(([x, y]) => [x - off * K * 0.5, y + off * 0.5]) as Quad;
          alpha = step * (1 - seg(p, 0.08, 0.15));
        } else if (p < 0.64) {
          // Frame 4: the slices resolve into the blocks at the logo's position.
          const rest = logoQuad(f4, b);
          const from = sliceQuad(Math.min(i, 3), W, H, mobile);
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
        // Portal labels sit inside the lower part of each portal.
        const label = els[`portalLabel${i}`];
        if (label && p >= 0.64) {
          const pq = portalQuad(i, W, H, mobile);
          const h = pq[3][1] - pq[0][1];
          label.style.left = `${pq[3][0] + K * h * 0.14 + (mobile ? 14 : 24)}px`;
          label.style.bottom = `${H - pq[3][1] + h * 0.12}px`;
          label.style.width = `${(pq[2][0] - pq[3][0]) - (mobile ? 24 : 40)}px`;
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
      show(els.f1tag, easeOut(seg(intro, 0.55, 1)) * (1 - seg(p, 0.05, 0.1)));
      show(els.f2, f2copy, (1 - f2copy) * 16);

      /* ---- frame 3: four slices on the logo's angle */
      SLICES.forEach((_, i) => {
        const el = els[`slice${i}`];
        if (!el) return;
        const stagger = ease(seg(p, 0.3 + i * 0.025, 0.4 + i * 0.025));
        const base = sliceQuad(i, W, H, mobile);
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
          const h = base[3][1] - base[0][1];
          if (mobile) {
            copy.style.left = `${base[3][0] + K * h * 0.62 + 6}px`;
            copy.style.top = `${base[0][1] + 14}px`;
            copy.style.width = `${W * 0.55}px`;
          } else {
            copy.style.left = `${base[3][0] + K * h * 0.12 + 26}px`;
            copy.style.top = `${base[0][1] + h * 0.72}px`;
            copy.style.width = `${base[2][0] - base[3][0] - 40}px`;
          }
        }
        show(copy, stagger * (1 - seg(p, 0.48, 0.53)), (1 - stagger) * 18);
      });
      show(els.f3, slicesIn * (1 - seg(p, 0.48, 0.53)));

      /* ---- frame 4, 5, 6 copy */
      const f4c = easeOut(seg(p, 0.55, 0.61)) * (1 - seg(p, 0.65, 0.69));
      show(els.f4, f4c, (1 - f4c) * 14);
      const f5c = easeOut(seg(p, 0.7, 0.77)) * (1 - seg(p, 0.8, 0.85));
      show(els.f5, f5c, (1 - f5c) * 14);
      PORTALS.forEach((_, i) => show(els[`portalLabel${i}`], easeOut(seg(p, 0.72 + i * 0.015, 0.78 + i * 0.015)) * (1 - seg(p, 0.8, 0.84))));
      const f6c = easeOut(seg(p, 0.88, 0.96));
      show(els.f6, f6c, (1 - f6c) * 18);
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
      window.removeEventListener("resize", setMobile);
      delete root.dataset.openingHideHeader;
    };
  }, []);

  return (
    <div ref={track} className="relative h-[760svh]">
      {/* A solid Midnight Navy backdrop inside the pinned stage, so the official logo's darker navy field
          dissolves into it (the stage is its own stacking context for the logo's lighten blend). */}
      <div className="sticky top-0 h-svh overflow-hidden bg-navy" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_46%,rgba(0,95,254,0.16),transparent_70%)]" />

        {/* Frame 2: skyline */}
        <div data-k="sky" className="absolute inset-0 overflow-hidden" style={{ visibility: "hidden" }}>
          <div data-k="skyImg" data-photo="skyline" className="photo absolute inset-0 bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,10,48,0.9)_0%,rgba(0,10,48,0.55)_40%,transparent_66%)] max-md:bg-[linear-gradient(180deg,rgba(0,10,48,0.2)_0%,rgba(0,10,48,0.4)_40%,rgba(0,10,48,0.94)_72%)]" />
        </div>
        <div data-k="band" className="absolute left-0 top-0 bg-[#6EFA2E] will-change-transform" style={{ visibility: "hidden" }} />

        {/* Frame 3: four slices */}
        {SLICES.map((s, i) => (
          <div key={s.key} data-k={`slice${i}`} className="absolute left-0 top-0 overflow-hidden will-change-transform" style={{ visibility: "hidden" }}>
            <div data-k={`sliceImg${i}`} data-photo={s.key} className="photo absolute -inset-[4%] bg-cover bg-center" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,10,48,0.88),rgba(0,10,48,0.15)_60%)]" />
          </div>
        ))}

        {/* The mark: the official wordmark layer plus the three blocks as separate layers */}
        {/* eslint-disable-next-line @next/next/no-img-element -- positioned every frame; must stay a plain layer */}
        <img data-k="wordmark" src="/photos/logo-wordmark.png" alt="" className="absolute left-0 top-0 h-auto mix-blend-lighten will-change-transform select-none" style={{ opacity: 0 }} draggable={false} />
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
          <p data-k="f1tag" className="type-label absolute inset-x-0 top-[66%] text-center text-haze max-md:top-[56%] max-md:text-[10px]" style={{ opacity: 0 }}>
            Identifying Opportunity · Engineering Growth
          </p>
          <a data-k="cue" href="#business-strategy" className="type-label pointer-events-auto absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-haze" style={{ opacity: 0 }}>
            Scroll
            <span aria-hidden className="block h-8 w-px bg-line" />
          </a>

          <div data-k="f2" className="absolute left-5 right-5 bottom-[11svh] sm:left-8 lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:w-[46%] lg:-translate-y-1/2" style={{ opacity: 0 }}>
            <p className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Business Strategy · AI Engineering · Market Growth
            </p>
            <h1 className="type-display mt-6 text-ink">
              The future
              <br />
              doesn’t build
              <br />
              <span className="text-jade">itself.</span>
            </h1>
            <p className="type-lede mt-6 max-w-[30rem] text-mist">Opportunity rewards those who see it first — and build for it deliberately.</p>
          </div>

          {SLICES.map((s, i) => (
            <div key={s.key} data-k={`sliceCopy${i}`} className="slice-copy absolute" data-i={i} style={{ opacity: 0 }}>
              <p className="type-label text-jade max-md:text-[10px]">
                0{i + 1} · {s.label}
              </p>
              <p className="mt-2 text-[1.05rem] font-medium leading-snug text-ink lg:mt-3 lg:text-[1.45rem] lg:tracking-[-0.01em]">{s.line}</p>
            </div>
          ))}
          <p data-k="f3" className="type-lede absolute bottom-[5svh] left-5 right-5 text-mist sm:left-8 lg:left-12 lg:max-w-[46rem]" style={{ opacity: 0 }}>
            We identify opportunity, engineer intelligent solutions, and create new pathways for business growth.
          </p>

          <div data-k="f4" className="absolute inset-x-5 top-[46svh] text-center lg:top-[55svh]" style={{ opacity: 0 }}>
            <p className="type-headline text-ink">
              The future doesn’t build <span className="text-jade">itself.</span>
            </p>
            <p className="type-lede mx-auto mt-5 max-w-[36rem] text-mist">We identify opportunity, engineer intelligent solutions, and create new pathways for business growth.</p>
          </div>

          <div data-k="f5" className="absolute left-5 top-24 sm:left-8 lg:left-12 lg:top-[18svh] lg:w-[30%]" style={{ opacity: 0 }}>
            <p className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Three disciplines · One connected system
            </p>
            <p className="mt-5 hidden text-[4rem] font-semibold leading-[0.95] tracking-[-0.035em] text-ink lg:block">
              Choose where
              <br />
              growth <span className="text-jade">begins.</span>
            </p>
          </div>
          {PORTALS.map((pt, i) => (
            <div key={pt.label} data-k={`portalLabel${i}`} className="portal-label absolute" data-i={i} style={{ opacity: 0 }}>
              <p className="type-label max-md:text-[10px]" style={{ color: BLOCK_TEXT[i] }}>
                0{i + 1}
              </p>
              <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.015em] text-ink lg:mt-2 lg:text-[1.55rem]">{pt.label}</p>
              <p className="mt-2 hidden text-[0.875rem] leading-relaxed text-mist lg:block">{pt.line}</p>
            </div>
          ))}

          <div data-k="f6" className="pointer-events-auto absolute bottom-[5svh] left-5 right-5 sm:left-8 lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:w-[38%] lg:-translate-y-1/2" style={{ opacity: 0 }}>
            <p className="type-label flex items-center gap-3" style={{ color: BLOCK_COLOURS[0] }}>
              <span aria-hidden className="h-px w-8" style={{ background: BLOCK_COLOURS[0] }} />
              01 · Business Strategy
            </p>
            <p className="mt-4 text-[2rem] font-semibold leading-[0.98] tracking-[-0.03em] text-ink lg:mt-5 lg:text-[4.1rem]">
              See the opportunity <span style={{ color: BLOCK_COLOURS[0] }}>before the market does.</span>
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-mist lg:type-lede lg:mt-5">
              We examine the business as it actually operates — market, customers, economics and constraints — to find the opportunities worth pursuing and the direction that makes them achievable.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 lg:mt-6 lg:gap-5 lg:pt-5">
              {[
                ["Opportunity", "Where growth can realistically come from."],
                ["Position", "How to compete, and where not to."],
                ["Direction", "A prioritised plan the team can act on."],
              ].map(([t, d]) => (
                <div key={t}>
                  <p className="text-[0.9375rem] font-semibold text-ink">{t}</p>
                  <p className="mt-1 hidden text-[0.84rem] leading-relaxed text-mist lg:block">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-7">
              <a href="/engagement" className="btn btn-primary justify-center">
                Request a Strategic Introduction <span aria-hidden className="btn-arrow">→</span>
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
  const w = (W - 96 - K * h - 3 * gap) / 4;
  return para(48 + i * (w + gap), top + h, w, h);
}

function portalQuad(i: number, W: number, H: number, mobile: boolean): Quad {
  if (mobile) {
    const top = 150;
    const h = (H - top - 70 - 24) / 3;
    const w = W * 0.5;
    return para(20 + i * 14, top + i * (h + 12) + h, w, h);
  }
  const h = H * 0.58;
  const w = Math.min(300, W * 0.16);
  const gap = 30;
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
  const h = H * 0.4;
  const x = W - (mobile ? 60 : 110) + (i - 1) * (mobile ? 16 : 26) - K * h;
  return para(x, H * 0.7, mobile ? 8 : 14, h);
}
