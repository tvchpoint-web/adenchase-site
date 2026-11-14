"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/brand/Icons";
import { K } from "@/lib/blocks";

/**
 * Connected systems: six business systems as dimensional modules around the ADEN-CHASE hub.
 *
 * A real CSS 3D scene (no WebGL, no images except the logo's own artwork):
 * - the integration deck is a plane tilted away from the viewer; its engraved rings, pads and
 *   traces (corners cut on the logo's slant) are drawn on it, so they sit in true perspective;
 * - the hub is a stepped, machined ring housing with an upright glass plaque carrying the
 *   authentic three blocks of the ADEN-CHASE mark (`/brand/aden-chase-blocks.png`, cut from the
 *   master; never redrawn or tinted). The plaque always faces the viewer, so the mark is never
 *   distorted;
 * - each system is a glass-and-metal slab built as an actual box (front, sides, top), standing on a
 *   short stem above its pad, turned slightly towards the hub so its thickness shows, with a contact
 *   shadow on the deck. One key light, from the top left, for every object.
 *
 * Motion (only while on screen): a jade signal rises into the hub and wakes it; the modules
 * acknowledge in turn; a real workflow travels CRM → ADEN-CHASE → Scheduling → ADEN-CHASE → Support
 * along the deck; then an occasional flow. Desktop: the pointer turns the deck a few degrees and
 * hovering a module lifts it and lights its pathways. Touch: a slow drift instead. Reduced motion: a
 * composed still with the workflow lit. The figure is decorative; the card caption carries meaning.
 */

type Id = "crm" | "finance" | "operations" | "scheduling" | "support" | "inventory";

const SYSTEMS: { id: Id; label: string; icon: IconName }[] = [
  { id: "crm", label: "CRM", icon: "customer" },
  { id: "finance", label: "Finance", icon: "revenue" },
  { id: "operations", label: "Operations", icon: "efficiency" },
  { id: "scheduling", label: "Scheduling", icon: "calendar" },
  { id: "support", label: "Support", icon: "assistant" },
  { id: "inventory", label: "Inventory", icon: "inventory" },
];

/** Workflow relationships shown on hover. */
const PARTNERS: Record<Id, Id[]> = {
  crm: ["scheduling"],
  scheduling: ["crm", "support"],
  support: ["scheduling", "crm"],
  finance: ["inventory", "operations"],
  inventory: ["finance"],
  operations: ["finance"],
};

const FLOWS: { from: Id; to: Id; text: string }[] = [
  { from: "crm", to: "scheduling", text: "CRM → Scheduling: a new service request becomes a booked appointment." },
  { from: "scheduling", to: "support", text: "Scheduling → Support: the customer is confirmed and the team is briefed." },
  { from: "finance", to: "inventory", text: "Finance → Inventory: an approved order reserves stock." },
  { from: "operations", to: "finance", text: "Operations → Finance: completed work is ready to invoice." },
  { from: "support", to: "crm", text: "Support → CRM: the customer record updates after every conversation." },
];

const IDLE = "Existing systems. Intelligent connections. Better operations.";
const STILL = "CRM → Scheduling → Support: a request is booked, confirmed, and shared with the team.";

/* --------------------------------------------------------------- layouts */

interface Layout {
  /** Design size of the scene (px before scaling) and the deck's centre within it. */
  w: number;
  h: number;
  cx: number;
  cy: number;
  tilt: number; // deck tilt, degrees
  persp: number;
  maxScale: number;
  mod: { w: number; h: number; d: number; label: number; icon: number };
  plaque: { w: number; h: number; d: number; z: number };
  rings: number[]; // radii of the housing, bottom → top
  /** Deck position (x right, y towards the viewer), stem height and turn of each module. */
  pos: Record<Id, { x: number; y: number; z: number; turn: number }>;
}

/** Three depth layers, asymmetric: Finance and Inventory behind, CRM and Scheduling either side of
 *  the hub, Operations and Support in front, so the workflow sweeps towards the viewer. */
const WIDE: Layout = {
  w: 440,
  h: 300,
  cx: 220,
  cy: 160,
  tilt: 50,
  persp: 1700,
  maxScale: 1.3,
  mod: { w: 94, h: 56, d: 13, label: 14.5, icon: 18 },
  plaque: { w: 118, h: 42, d: 14, z: 24 },
  rings: [48, 41, 34],
  pos: {
    finance: { x: -92, y: -150, z: 16, turn: 4 },
    inventory: { x: 104, y: -142, z: 18, turn: -4 },
    crm: { x: -152, y: -20, z: 12, turn: 5 },
    scheduling: { x: 152, y: -32, z: 14, turn: -5 },
    operations: { x: -110, y: 118, z: 8, turn: 3 },
    support: { x: 118, y: 112, z: 10, turn: -3 },
  },
};

/** Phones and narrow cards: a taller, deeper arrangement (not the wide scene shrunk). */
const COMPACT: Layout = {
  w: 300,
  h: 312,
  cx: 150,
  cy: 172,
  tilt: 48,
  persp: 1200,
  maxScale: 1.15,
  mod: { w: 84, h: 52, d: 12, label: 13.2, icon: 17 },
  plaque: { w: 90, h: 33, d: 11, z: 20 },
  rings: [40, 34, 28],
  pos: {
    finance: { x: -66, y: -160, z: 14, turn: 3 },
    inventory: { x: 70, y: -154, z: 16, turn: -3 },
    crm: { x: -104, y: 10, z: 10, turn: 4 },
    scheduling: { x: 106, y: 0, z: 10, turn: -4 },
    operations: { x: -76, y: 128, z: 8, turn: 3 },
    support: { x: 80, y: 122, z: 9, turn: -3 },
  },
};

/** The deck's drawing area (deck units). */
const DECK = { w: 540, h: 440 };

/** A trace from a module's pad to the hub ring: level, then one bend on the logo's slant. */
function trace(px: number, py: number, r: number) {
  const a = Math.atan2(py, px);
  const ex = Math.cos(a) * r;
  const ey = Math.sin(a) * r;
  const run = K * Math.abs(py - ey) * Math.sign(px - ex);
  const cx = ex + run;
  if (Math.abs(cx - ex) >= Math.abs(px - ex)) return `M${px.toFixed(1)} ${py.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
  return `M${px.toFixed(1)} ${py.toFixed(1)}H${cx.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

/* ---------------------------------------------------------------- parts */

function Deck({ L }: { L: Layout }) {
  const R = L.rings[0];
  const ticks = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2;
    const r1 = R + 10;
    const r2 = R + (i % 8 === 0 ? 16 : 13);
    return `M${(Math.cos(a) * r1).toFixed(2)} ${(Math.sin(a) * r1).toFixed(2)}L${(Math.cos(a) * r2).toFixed(2)} ${(Math.sin(a) * r2).toFixed(2)}`;
  }).join("");
  return (
    <svg className="nx3-deck" width={DECK.w} height={DECK.h} viewBox={`${-DECK.w / 2} ${-DECK.h / 2} ${DECK.w} ${DECK.h}`} aria-hidden>
      <defs>
        <radialGradient id="nx3-floor">
          <stop offset="0" stopColor="#0042AC" stopOpacity="0.42" />
          <stop offset="0.55" stopColor="#0042AC" stopOpacity="0.12" />
          <stop offset="1" stopColor="#0042AC" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nx3-core">
          <stop offset="0" stopColor="#83FD80" stopOpacity="0.5" />
          <stop offset="1" stopColor="#83FD80" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx={DECK.w * 0.5} ry={DECK.h * 0.5} fill="url(#nx3-floor)" />
      {/* Engraving: an outer orbit, the tick ring and an inner register around the housing. */}
      <circle r={R * 3.3} className="nx3-orbit" />
      <circle r={R * 2.2} className="nx3-orbit nx3-orbit-fine" />
      <path d={ticks} className="nx3-ticks" />
      <circle r={R + 7} className="nx3-register" />
      <circle r={R * 1.5} fill="url(#nx3-core)" className="nx3-core-glow" />
      {SYSTEMS.map((s) => {
        const p = L.pos[s.id];
        const d = trace(p.x, p.y, R + 7);
        return (
          <g key={s.id} data-route={s.id}>
            <path d={d} className="nx3-trace" />
            <path d={d} className="nx3-trace-glow" />
            <path d={d} className="nx3-trace-hi" />
            <path d={d} pathLength={100} className="nx3-pulse-halo" />
            <path d={d} pathLength={100} className="nx3-pulse" />
            <circle cx={p.x} cy={p.y} r="11" className="nx3-pad" />
            <circle cx={p.x} cy={p.y} r="3" className="nx3-pad-core" />
          </g>
        );
      })}
    </svg>
  );
}

/** A box standing on the deck: its front faces the viewer's side of the deck. */
function Slab({ w, h, d, className, children }: { w: number; h: number; d: number; className: string; children?: React.ReactNode }) {
  return (
    <div className={`nx3-slab ${className}`} style={{ width: w, height: h, left: -w / 2, top: -h }}>
      <div className="nx3-face nx3-top" style={{ width: w, height: d, top: (h - d) / 2, transform: `rotateX(90deg) translateZ(${h / 2}px)` }} />
      <div className="nx3-face nx3-side nx3-left" style={{ width: d, height: h, left: (w - d) / 2, transform: `rotateY(-90deg) translateZ(${w / 2}px)` }} />
      <div className="nx3-face nx3-side nx3-right" style={{ width: d, height: h, left: (w - d) / 2, transform: `rotateY(90deg) translateZ(${w / 2}px)` }} />
      <div className="nx3-face nx3-front" style={{ width: w, height: h, transform: `translateZ(${d / 2}px)` }}>
        {children}
      </div>
    </div>
  );
}

function Hub({ L }: { L: Layout }) {
  const P = L.plaque;
  return (
    <>
      {/* The machined housing: three stepped rings, low contrast; the top one is the core. */}
      {L.rings.map((r, i) => (
        <div key={r} className={`nx3-ring nx3-ring-${i}`} style={{ width: r * 2, height: r * 2, left: -r, top: -r, transform: `translateZ(${i * 5 + 1}px)` }} />
      ))}
      {/* The column of light that carries the signal up into the plaque. */}
      <div className="nx3-column" style={{ height: P.z - 10, transform: `translateZ(11px) rotateX(90deg)` }}>
        <span data-column />
      </div>
      {/* A machined pedestal on the housing, with the plaque's contact shadow. */}
      <div className="nx3-plaque-shadow" style={{ width: P.w * 0.9, height: P.d * 2.2, left: -P.w * 0.45, top: -P.d * 1.1, transform: `translateZ(${(L.rings.length - 1) * 5 + 2}px)` }} />
      <div className="nx3-pedestal" style={{ transform: `translateZ(${(L.rings.length - 1) * 5 + 1}px)` }}>
        <Slab w={P.w * 0.42} h={P.z - (L.rings.length - 1) * 5 - 1} d={P.d * 1.6} className="nx3-pedestal-box" />
      </div>
      {/* The ADEN-CHASE plaque: square to the viewer (leaning back 6° so its top edge catches the
          light; the mark is never redrawn, tinted or skewed). */}
      <div data-plaque className="nx3-plaque" style={{ transform: `translateZ(${P.z}px) rotateX(${6 - L.tilt}deg)` }}>
        <div className="nx3-plaque-light" style={{ width: P.w * 1.1, height: P.h * 1.6, left: -P.w * 0.55, top: -P.h * 1.2 }} />
        <div className="nx3-slab nx3-plaque-box" style={{ width: P.w, height: P.h, left: -P.w / 2, top: -P.h }}>
          <div className="nx3-face nx3-top" style={{ width: P.w, height: P.d, top: (P.h - P.d) / 2, transform: `rotateX(90deg) translateZ(${P.h / 2}px)` }} />
          <div className="nx3-face nx3-side nx3-left" style={{ width: P.d, height: P.h, left: (P.w - P.d) / 2, transform: `rotateY(-90deg) translateZ(${P.w / 2}px)` }} />
          <div className="nx3-face nx3-side nx3-right" style={{ width: P.d, height: P.h, left: (P.w - P.d) / 2, transform: `rotateY(90deg) translateZ(${P.w / 2}px)` }} />
          <div className="nx3-face nx3-plaque-front" style={{ width: P.w, height: P.h, transform: `translateZ(${P.d / 2}px)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- authentic logo artwork, shown as-is */}
            <img src="/brand/aden-chase-blocks.png" alt="" width={497} height={112} draggable={false} className="nx3-mark" style={{ width: P.w * 0.66 }} />
          </div>
        </div>
      </div>
    </>
  );
}

function Module({ L, id, label, icon }: { L: Layout; id: Id; label: string; icon: IconName }) {
  const p = L.pos[id];
  const M = L.mod;
  return (
    <div className="nx3-at" style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0) rotateZ(${p.turn}deg)` }}>
      <div className="nx3-shadow" style={{ width: M.w * 1.15, height: M.d * 2.6, left: (-M.w * 1.15) / 2, top: (-M.d * 2.6) / 2 }} />
      <div data-route={id} className="nx3-stem" style={{ height: p.z, transform: "translateZ(1px) rotateX(90deg)" }} />
      <div data-node={id} className="nx3-mod" style={{ transform: `translateZ(${p.z}px)` }}>
        <div className="nx3-float" style={{ animationDuration: `${7 + ((p.x + 200) % 3)}s`, animationDelay: `${-((p.y + 200) % 5)}s` }}>
          <Slab w={M.w} h={M.h} d={M.d} className="nx3-module">
            <span className="nx3-icon" style={{ width: M.icon + 10, height: M.icon + 10 }}>
              <Icon name={icon} className="h-full w-full" />
            </span>
            <span className="nx3-label" style={{ fontSize: M.label }}>
              {label}
            </span>
          </Slab>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- component */

export function IntegrationNexus() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const [fit, setFit] = useState<{ L: Layout; s: number } | null>(null);

  // Layout and scale follow the card's width (container, not viewport).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const cw = e.contentRect.width;
      const L = cw >= 360 ? WIDE : COMPACT;
      const s = Math.min(L.maxScale, cw / L.w);
      setFit((f) => (f && f.L === L && Math.abs(f.s - s) < 0.002 ? f : { L, s }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = fit?.L ?? WIDE;

  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st || !fit) return;
    const Lc = fit.L;
    const q = (sel: string) => Array.from(el.querySelectorAll<HTMLElement | SVGElement>(sel));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Routes lit by the choreography; while a visitor hovers, changes are deferred to this list.
    let focused = false;
    let lit: Element[] = [];
    const setOn = (id: string, on: boolean) => {
      const els = q(`[data-route="${id}"], [data-node="${id}"]`);
      if (focused) {
        lit = on ? [...new Set([...lit, ...els])] : lit.filter((n) => !els.includes(n as HTMLElement));
        return;
      }
      els.forEach((n) => n.classList.toggle("is-on", on));
    };
    let swap = 0;
    let said = caption.current?.textContent ?? "";
    const say = (t: string) => {
      const c = caption.current;
      if (!c || said === t) return;
      said = t;
      c.classList.add("is-swapping");
      window.clearTimeout(swap);
      swap = window.setTimeout(() => {
        c.textContent = t;
        c.classList.remove("is-swapping");
      }, 200);
    };

    /* ---- camera: pointer on desktop, a slow drift on touch; time-based smoothing */
    let yaw = 0;
    let tilt = 0;
    let goalYaw = 0;
    let goalTilt = 0;
    let raf = 0;
    let last = -1;
    let inView = false;
    const pose = () => {
      st.style.transform = `rotateX(${(Lc.tilt + tilt).toFixed(2)}deg) rotateZ(${yaw.toFixed(2)}deg)`;
      // The plaque counter-turns, so the mark stays square to the viewer.
      const pl = el.querySelector<HTMLElement>("[data-plaque]");
      if (pl) pl.style.transform = `translateZ(${Lc.plaque.z}px) rotateZ(${(-yaw).toFixed(2)}deg) rotateX(${(6 - (Lc.tilt + tilt)).toFixed(2)}deg)`;
    };
    const loop = (now: number) => {
      raf = 0;
      const dt = last < 0 ? 16 : Math.min(now - last, 50);
      last = now;
      if (!fine && !reduced) goalYaw = Math.sin(now / 3200) * 2.2; // ~20 s period
      const k = 1 - Math.exp(-dt / 220);
      yaw += (goalYaw - yaw) * k;
      tilt += (goalTilt - tilt) * k;
      pose();
      const settled = Math.abs(goalYaw - yaw) < 0.01 && Math.abs(goalTilt - tilt) < 0.01;
      if (inView && (!settled || (!fine && !reduced))) raf = requestAnimationFrame(loop);
      else last = -1;
    };
    const kick = () => {
      if (!raf && inView) raf = requestAnimationFrame(loop);
    };
    pose();

    if (reduced) {
      // A composed still: the workflow route lit, the core awake, no movement.
      ["crm", "scheduling", "support"].forEach((id) => setOn(id, true));
      el.dataset.core = "on";
      if (caption.current) caption.current.textContent = STILL;
      return () => window.clearTimeout(swap);
    }

    let alive = true;
    const visible = () => inView && !document.hidden;
    let resume: (() => void) | null = null;
    const wake = () => {
      if (visible() && resume) {
        resume();
        resume = null;
      }
      if (visible()) kick();
    };
    let unfocus: (() => void) | null = null;
    const untilUnfocused = () => (focused ? new Promise<void>((r) => (unfocus = r)) : Promise.resolve());
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        wake();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", wake);
    const untilVisible = () => (visible() ? Promise.resolve() : new Promise<void>((r) => (resume = r)));
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        if (alive) fn();
      }, ms);
      timers.add(t);
    };
    const wait = async (ms: number) => {
      await new Promise((r) => later(() => r(undefined), ms));
      await untilVisible();
      await untilUnfocused();
    };
    const running = new Set<Animation>();
    const track = (a: Animation) => {
      running.add(a);
      a.finished.finally(() => running.delete(a)).catch(() => undefined);
      return a.finished.catch(() => undefined);
    };
    /** A short lit segment travelling the deck trace: into the hub ("in") or out to the module. */
    const pulse = (id: string, dir: "in" | "out", ms: number) => {
      const paths = q(`[data-route="${id}"] .nx3-pulse, [data-route="${id}"] .nx3-pulse-halo`);
      const frames = dir === "in" ? [{ strokeDashoffset: 14 }, { strokeDashoffset: -100 }] : [{ strokeDashoffset: -100 }, { strokeDashoffset: 14 }];
      return Promise.all(paths.map((p) => track(p.animate(frames, { duration: ms, easing: "cubic-bezier(0.45, 0, 0.25, 1)" }))));
    };
    /** The signal rising up the light column into the plaque. */
    const rise = (ms: number) => {
      const s = el.querySelector<HTMLElement>("[data-column]");
      if (!s) return Promise.resolve();
      return track(s.animate([{ transform: "translateY(-100%)", opacity: 1 }, { transform: "translateY(100%)", opacity: 1 }], { duration: ms, easing: "cubic-bezier(0.45, 0, 0.25, 1)" }));
    };
    const coreFlash = (ms = 420) => {
      el.dataset.core = "on";
      later(() => (el.dataset.core = ""), ms);
    };
    const flow = async (f: (typeof FLOWS)[number], { keepTo = false } = {}) => {
      say(f.text);
      setOn(f.from, true);
      await pulse(f.from, "in", 760);
      coreFlash();
      await wait(160);
      setOn(f.to, true);
      await pulse(f.to, "out", 760);
      await wait(380);
      setOn(f.from, false);
      if (!keepTo) setOn(f.to, false);
    };

    const play = async () => {
      await untilVisible();
      if (!alive) return;
      await wait(500); // a quiet beat first
      // Activation: the signal rises into the hub, which wakes.
      await rise(900);
      coreFlash(900);
      await wait(500);
      // Each module acknowledges in turn (at most two at once), front to back around the hub.
      for (const id of ["crm", "finance", "inventory", "scheduling", "support", "operations"] as Id[]) {
        if (!alive) return;
        setOn(id, true);
        later(() => setOn(id, false), 320);
        await wait(260);
      }
      await wait(700);
      // The workflow: CRM → ADEN-CHASE → Scheduling → ADEN-CHASE → Support, one continuous chain.
      await flow(FLOWS[0], { keepTo: true });
      await flow(FLOWS[1]);
      // Then, occasionally, other systems coordinate.
      let k = 2;
      while (alive) {
        await wait(1800);
        say(IDLE);
        await wait(7200 + Math.random() * 3000);
        if (!alive) return;
        await flow(FLOWS[k]);
        k = k + 1 >= FLOWS.length ? 0 : k + 1;
      }
    };
    play();

    /* ---- desktop: the pointer turns the deck; hovering a module explores its connections */
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      goalYaw = ((e.clientX - r.left) / r.width - 0.5) * 2 * 5;
      goalTilt = ((e.clientY - r.top) / r.height - 0.5) * 2 * -3;
      kick();
    };
    const out = () => {
      goalYaw = 0;
      goalTilt = 0;
      kick();
    };
    const enter = (e: Event) => {
      const id = (e.currentTarget as HTMLElement).dataset.node as Id;
      if (!focused) {
        lit = q(".is-on");
        lit.forEach((n) => n.classList.remove("is-on"));
        running.forEach((a) => a.pause());
      }
      focused = true;
      q(".is-focus").forEach((n) => n.classList.remove("is-focus"));
      el.dataset.focus = id;
      [id, ...PARTNERS[id]].forEach((p) => q(`[data-route="${p}"]`).forEach((n) => n.classList.add("is-focus")));
      q(`[data-node="${id}"]`).forEach((n) => n.classList.add("is-focus"));
    };
    const leave = () => {
      el.dataset.focus = "";
      q(".is-focus").forEach((n) => n.classList.remove("is-focus"));
      lit.forEach((n) => n.classList.add("is-on"));
      lit = [];
      running.forEach((a) => a.play());
      focused = false;
      unfocus?.();
      unfocus = null;
    };
    const nodes = q("[data-node]");
    if (fine) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", out);
      nodes.forEach((n) => {
        n.addEventListener("pointerenter", enter);
        n.addEventListener("pointerleave", leave);
      });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(swap);
      running.forEach((a) => a.cancel());
      resume?.();
      unfocus?.();
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      if (fine) {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", out);
        nodes.forEach((n) => {
          n.removeEventListener("pointerenter", enter);
          n.removeEventListener("pointerleave", leave);
        });
      }
    };
  }, [fit]);

  const s = fit?.s ?? 1;
  return (
    <div className="@container" aria-hidden>
      <div ref={root} className="nx3" data-ready={fit ? "1" : undefined}>
        <div className="nx3-view" style={{ width: L.w, height: L.h, perspective: L.persp, perspectiveOrigin: `50% ${L.cy - L.h * 0.35}px`, transform: `translateX(-50%) scale(${s.toFixed(4)})` }}>
          <div ref={stage} className="nx3-stage" style={{ left: L.cx, top: L.cy, transform: `rotateX(${L.tilt}deg)` }}>
            <Deck L={L} />
            <Hub L={L} />
            {SYSTEMS.map((m) => (
              <Module key={m.id} L={L} id={m.id} label={m.label} icon={m.icon} />
            ))}
          </div>
        </div>
      </div>
      <p ref={caption} className="nx-caption mx-auto mt-3 min-h-[2.8em] max-w-[22rem] text-center text-[0.78rem] leading-snug text-mist">
        {IDLE}
      </p>
    </div>
  );
}
