"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/brand/Icons";
import { K } from "@/lib/blocks";

/**
 * The Integration Nexus: six existing business systems connected through one intelligent core.
 *
 * Built in the site's own language: the core is a silicon package (etched pins, a die, fine
 * concentric rings with micro-ticks; nothing spins or moves), the connections are PCB traces whose corners
 * are cut on the logo's slant, and light appears only where information moves. Everything is
 * quiet at rest; the motion is the message.
 *
 * Choreography (only while on screen): a jade pulse arrives from the page's signal and wakes the
 * core → each pathway acknowledges in turn → a real workflow (CRM → core → Scheduling → core →
 * Support) → occasional coordination thereafter. Desktop hover highlights a system's pathway and its
 * workflow partners. Reduced motion: a composed still of the same workflow.
 *
 * Two geometries share one component: a wide one for roomy cards and a compact portrait one for
 * narrow cards and phones (chosen by container width, not viewport). Labels are HTML so they stay
 * readable at any scale; the whole figure is decorative (the card caption carries the meaning).
 */

type Id = "crm" | "finance" | "operations" | "scheduling" | "support" | "inventory";

const SYSTEMS: { id: Id; label: string; icon: IconName; side: -1 | 1; row: 0 | 1 | 2 }[] = [
  { id: "crm", label: "CRM", icon: "customer", side: -1, row: 0 },
  { id: "finance", label: "Finance", icon: "revenue", side: -1, row: 1 },
  { id: "operations", label: "Operations", icon: "efficiency", side: -1, row: 2 },
  { id: "scheduling", label: "Scheduling", icon: "calendar", side: 1, row: 0 },
  { id: "support", label: "Support", icon: "assistant", side: 1, row: 1 },
  { id: "inventory", label: "Inventory", icon: "inventory", side: 1, row: 2 },
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

interface Geometry {
  w: number;
  h: number;
  cx: number;
  cy: number;
  chip: number; // half-size of the package
  nodeX: number; // inset of the node columns from the sides
  rows: [number, number, number];
  channel: number; // x offset of the vertical trace channel from the core
}

const WIDE: Geometry = { w: 320, h: 200, cx: 160, cy: 100, chip: 17, nodeX: 38, rows: [34, 100, 166], channel: 48 };
const NARROW: Geometry = { w: 240, h: 214, cx: 120, cy: 107, chip: 15, nodeX: 30, rows: [40, 107, 174], channel: 38 };

const pinY = (g: Geometry, row: number) => g.cy + (row - 1) * (g.chip * 0.55);

/** A trace from a system node to its pin on the core: orthogonal, corners cut on the brand slant. */
function trace(g: Geometry, side: -1 | 1, row: number) {
  const sx = side < 0 ? g.nodeX : g.w - g.nodeX;
  const sy = g.rows[row];
  const px = g.cx + side * g.chip;
  const py = pinY(g, row);
  const chx = g.cx + side * g.channel;
  if (Math.abs(py - sy) < 0.5) return `M${sx} ${sy}H${px}`;
  const dir = Math.sign(py - sy);
  const c = 7; // vertical extent of each cut; horizontal is K·c
  return `M${sx} ${sy}H${chx + side * K * c}L${chx} ${sy + dir * c}V${py - dir * c}L${chx - side * K * c} ${py}H${px}`;
}

function Figure({ g, variant }: { g: Geometry; variant: "wide" | "narrow" }) {
  const id = (s: string) => `nx-${variant}-${s}`;
  const R = g.chip * 2.05;
  // 72 micro-ticks drawn as two paths (short and long) rather than 72 elements.
  const ticks = (long: boolean) =>
    Array.from({ length: 72 }, (_, i) => i)
      .filter((i) => (i % 6 === 0) === long)
      .map((i) => {
        const a = (i / 72) * Math.PI * 2;
        const r1 = R + 1.6;
        const r2 = R + (long ? 4.2 : 2.6);
        const f = (n: number) => n.toFixed(2);
        return `M${f(g.cx + Math.cos(a) * r1)} ${f(g.cy + Math.sin(a) * r1)}L${f(g.cx + Math.cos(a) * r2)} ${f(g.cy + Math.sin(a) * r2)}`;
      })
      .join("");
  return (
    <div className={`relative ${variant === "wide" ? "hidden @[21rem]:block" : "@[21rem]:hidden"}`}>
      <svg viewBox={`0 0 ${g.w} ${g.h}`} className="block w-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id={id("glass")} cx="50%" cy="38%" r="70%">
            <stop offset="0" stopColor="#0b2b78" />
            <stop offset="1" stopColor="#020c30" />
          </radialGradient>
          <linearGradient id={id("die")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#123a8c" />
            <stop offset="1" stopColor="#051540" />
          </linearGradient>
          {/* The inlet fades in from beyond the card: the page's signal arriving, not a stub. */}
          <linearGradient id={id("inlet")} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={g.cy - g.chip}>
            <stop offset="0" stopColor="#00D3FB" stopOpacity="0" />
            <stop offset="1" stopColor="#00D3FB" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id={id("aura")}>
            <stop offset="0" stopColor="#00D3FB" stopOpacity="0.16" />
            <stop offset="1" stopColor="#00D3FB" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Atmosphere: a faint Ocean Blue field behind the core only. */}
        <circle cx={g.cx} cy={g.cy} r={R * 1.9} fill={`url(#${id("aura")})`} />

        {/* The signal arriving from the page (the global Neon Jade signal's local continuation). */}
        <g data-route="inlet">
          {/* No resting trace above the core: the inlet only exists while the signal arrives. */}
          <path d={`M${g.cx} 0V${g.cy - g.chip}`} className="nx-hi" style={{ stroke: `url(#${id("inlet")})` }} />
          <path d={`M${g.cx} 0V${g.cy - g.chip}`} pathLength={100} className="nx-pulse-halo" />
          <path d={`M${g.cx} 0V${g.cy - g.chip}`} pathLength={100} className="nx-pulse" />
        </g>

        {SYSTEMS.map((s) => {
          const d = trace(g, s.side, s.row);
          return (
            <g key={s.id} data-route={s.id}>
              <path d={d} className="nx-base" />
              <path d={d} className="nx-hi" />
              <path d={d} pathLength={100} className="nx-pulse-halo" />
              <path d={d} pathLength={100} className="nx-pulse" />
              <circle cx={g.cx + s.side * g.chip} cy={pinY(g, s.row)} r="1.4" className="nx-via" />
            </g>
          );
        })}

        {/* The core: rings with micro-etched ticks, a package with pins, a die. Nothing rotates. */}
        <g className="nx-core">
          <circle cx={g.cx} cy={g.cy} r={R} className="nx-ring" />
          <circle cx={g.cx} cy={g.cy} r={R} className="nx-ring-pulse" />
          <circle cx={g.cx} cy={g.cy} r={R * 0.8} className="nx-ring-inner" />
          <path d={ticks(false)} className="nx-tick" />
          <path d={ticks(true)} className="nx-tick nx-tick-long" />
          <rect x={g.cx - g.chip} y={g.cy - g.chip} width={g.chip * 2} height={g.chip * 2} rx="3.2" fill={`url(#${id("glass")})`} className="nx-package" />
          {[-1, 1].flatMap((side) =>
            [0, 1, 2].map((row) => <rect key={`${side}${row}`} x={side < 0 ? g.cx - g.chip - 3 : g.cx + g.chip} y={pinY(g, row) - 0.7} width="3" height="1.4" className="nx-pin" />),
          )}
          {[-1, 0, 1].map((k) => (
            <rect key={`t${k}`} x={g.cx + k * g.chip * 0.55 - 0.7} y={g.cy - g.chip - 3} width="1.4" height="3" className="nx-pin" />
          ))}
          <rect x={g.cx - g.chip * 0.5} y={g.cy - g.chip * 0.5} width={g.chip} height={g.chip} rx="1.6" fill={`url(#${id("die")})`} className="nx-die" />
          {[-0.25, 0, 0.25].map((k) => (
            <line key={k} x1={g.cx - g.chip * 0.32} x2={g.cx + g.chip * 0.32} y1={g.cy + k * g.chip * 0.8} y2={g.cy + k * g.chip * 0.8} className="nx-etch" />
          ))}
          <rect x={g.cx - g.chip * 0.5} y={g.cy - g.chip * 0.5} width={g.chip} height={g.chip} rx="1.6" className="nx-die-glow" />
        </g>
      </svg>

      {/* System nodes: compact HTML so labels stay legible at every size. */}
      {SYSTEMS.map((s) => (
        <div
          key={s.id}
          data-node={s.id}
          className="nx-node absolute flex -translate-x-1/2 -translate-y-[18px] flex-col items-center"
          style={{ left: `${((s.side < 0 ? g.nodeX : g.w - g.nodeX) / g.w) * 100}%`, top: `${(g.rows[s.row] / g.h) * 100}%` }}
        >
          <span className="nx-node-dot grid h-9 w-9 place-items-center rounded-full border">
            <Icon name={s.icon} className="h-4 w-4" />
          </span>
          <span className="nx-node-label mt-1.5 whitespace-nowrap text-[0.72rem] tracking-[0.01em]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function IntegrationNexus() {
  const root = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (sel: string) => Array.from(el.querySelectorAll<SVGElement | HTMLElement>(sel));
    /** Only the figure that is actually displayed (container queries hide the other) is animated. */
    const shown = () => Array.from(el.querySelectorAll<HTMLElement>(":scope > div")).find((d) => d.offsetParent !== null) ?? el;
    const setOn = (id: string, on: boolean) => {
      q(`[data-route="${id}"]`).forEach((n) => n.classList.toggle("is-on", on));
      q(`[data-node="${id}"]`).forEach((n) => n.classList.toggle("is-on", on));
    };
    let swap = 0;
    const say = (t: string) => {
      const c = caption.current;
      if (!c || c.textContent === t) return;
      // A short cross-fade, so the narration never jumps (or reflows) mid-read.
      c.classList.add("is-swapping");
      window.clearTimeout(swap);
      swap = window.setTimeout(() => {
        c.textContent = t;
        c.classList.remove("is-swapping");
      }, 200);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // A composed still: the workflow route lit, the core awake, no movement.
      ["crm", "scheduling", "support"].forEach((id) => setOn(id, true));
      el.dataset.core = "on";
      if (caption.current) caption.current.textContent = "CRM → Scheduling → Support: a request is booked, confirmed, and shared with the team.";
      return;
    }

    let alive = true;
    let inView = false;
    const visible = () => inView && !document.hidden;
    let resume: (() => void) | null = null;
    const wake = () => {
      if (visible() && resume) {
        resume();
        resume = null;
      }
    };
    // While a visitor is exploring a system by hover, the autonomous flows wait.
    let focused = false;
    let unfocus: (() => void) | null = null;
    const untilUnfocused = () => (focused ? new Promise<void>((r) => (unfocus = r)) : Promise.resolve());
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        wake();
      },
      { threshold: 0.4 },
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
    /** A short lit segment travelling the trace: into the core ("in") or out to the system ("out"). */
    const pulse = (id: string, dir: "in" | "out", ms: number) => {
      const fig = shown();
      const paths = Array.from(fig.querySelectorAll<SVGElement>(`[data-route="${id}"] .nx-pulse, [data-route="${id}"] .nx-pulse-halo`));
      const frames = dir === "in" ? [{ strokeDashoffset: 8 }, { strokeDashoffset: -100 }] : [{ strokeDashoffset: -100 }, { strokeDashoffset: 8 }];
      const anims = paths.map((p) => {
        const a = p.animate(frames, { duration: ms, easing: "cubic-bezier(0.45, 0, 0.25, 1)" });
        running.add(a);
        a.finished.finally(() => running.delete(a)).catch(() => undefined);
        return a;
      });
      return Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
    };
    const coreFlash = () => {
      el.dataset.core = "on";
      later(() => (el.dataset.core = ""), 400);
    };
    /** One workflow step: in to the core, a beat of processing, out to the next system. */
    const flow = async (f: (typeof FLOWS)[number], { keepTo = false } = {}) => {
      say(f.text);
      setOn(f.from, true);
      await pulse(f.from, "in", 720);
      coreFlash();
      await wait(140);
      setOn(f.to, true);
      await pulse(f.to, "out", 720);
      await wait(380);
      setOn(f.from, false);
      if (!keepTo) setOn(f.to, false);
    };

    const play = async () => {
      await untilVisible();
      if (!alive) return;
      // Stage 2 — the signal arrives and wakes the core.
      setOn("inlet", true);
      await pulse("inlet", "in", 820);
      coreFlash();
      setOn("inlet", false);
      await wait(420);
      // Stage 3 — each pathway acknowledges in turn (at most two lit at any moment).
      for (const id of ["crm", "scheduling", "finance", "support", "operations", "inventory"] as Id[]) {
        if (!alive) return;
        setOn(id, true);
        later(() => setOn(id, false), 300);
        await wait(280);
      }
      await wait(700);
      // Stage 4 — a real workflow: CRM → core → Scheduling → core → Support, one continuous chain.
      await flow(FLOWS[0], { keepTo: true });
      await flow(FLOWS[1]);
      // Stage 5 — ambient coordination, occasionally (every 9–12 s).
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

    // Desktop: hover a system to see its pathway and its workflow partners.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const enter = (e: Event) => {
      const id = (e.currentTarget as HTMLElement).dataset.node as Id;
      focused = true;
      q(".is-on").forEach((n) => n.classList.remove("is-on"));
      el.dataset.focus = id;
      [id, ...PARTNERS[id]].forEach((p) => q(`[data-route="${p}"]`).forEach((n) => n.classList.add("is-focus")));
      q(`[data-node="${id}"]`).forEach((n) => n.classList.add("is-focus"));
    };
    const leave = () => {
      el.dataset.focus = "";
      q(".is-focus").forEach((n) => n.classList.remove("is-focus"));
      focused = false;
      unfocus?.();
      unfocus = null;
    };
    const nodes = q("[data-node]");
    if (fine) {
      nodes.forEach((n) => {
        n.addEventListener("pointerenter", enter);
        n.addEventListener("pointerleave", leave);
      });
    }

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(swap);
      running.forEach((a) => a.cancel());
      resume?.();
      unfocus?.();
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      if (fine) {
        nodes.forEach((n) => {
          n.removeEventListener("pointerenter", enter);
          n.removeEventListener("pointerleave", leave);
        });
      }
    };
  }, []);

  return (
    <div ref={root} className="nexus @container relative" aria-hidden>
      <Figure g={WIDE} variant="wide" />
      <Figure g={NARROW} variant="narrow" />
      <p ref={caption} className="nx-caption mx-auto mt-4 min-h-[2.8em] max-w-[22rem] text-center text-[0.78rem] leading-snug text-mist">
        {IDLE}
      </p>
    </div>
  );
}
