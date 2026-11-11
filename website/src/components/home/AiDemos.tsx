"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/brand/Icons";
import { InView } from "@/components/motion/InView";

const CYAN = "#00F6FE";

/** Runs a step counter only while the element is on screen (and not at all under reduced motion). */
function useTicker(steps: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Browser-only preference read after hydration; under reduced motion the demos show their final state.
    setReduced(r);
    if (r) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = setInterval(() => setStep((s) => (s + 1) % steps), ms);
      if (!e.isIntersecting && timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [steps, ms]);
  return { ref, step, reduced };
}

function Panel({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <figure className="demo-panel group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(165deg,rgba(9,30,82,0.75),rgba(0,10,40,0.85))] p-5 shadow-[0_30px_60px_-36px_rgba(0,0,0,0.9)] transition-[border-color] duration-300 hover:border-[#00F6FE]/30 sm:p-6">
      <div className="relative flex-1">{children}</div>
      <figcaption className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-[1rem] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[0.86rem] leading-relaxed text-mist">{caption}</p>
      </figcaption>
    </figure>
  );
}

/* --------------------------------------------- 1 · disconnected → connected */
const NODES = [
  { x: 40, y: 34, label: "CRM" },
  { x: 220, y: 34, label: "Finance" },
  { x: 40, y: 146, label: "Operations" },
  { x: 220, y: 146, label: "Support" },
];

function ConnectedSystems() {
  const { ref, step, reduced } = useTicker(2, 3200);
  const connected = reduced || step === 1;
  return (
    <div ref={ref}>
      <svg viewBox="0 0 260 180" className="w-full" aria-hidden>
        <defs>
          <radialGradient id="hubglow">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.35" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="130" cy="90" r="46" fill="url(#hubglow)" style={{ opacity: connected ? 1 : 0, transition: "opacity 600ms" }} />
        {NODES.map((n, i) => {
          const d = `M${n.x} ${n.y} L130 90`;
          return (
            <g key={n.label}>
              <path d={d} stroke={CYAN} strokeOpacity={connected ? 0.7 : 0.18} strokeWidth="1.2" strokeDasharray={connected ? "0" : "3 5"} style={{ transition: "stroke-opacity 600ms" }} />
              {connected && !reduced && (
                <circle r="2.6" fill="#83FD80">
                  <animateMotion dur={`${1.6 + i * 0.25}s`} repeatCount="indefinite" path={i % 2 ? `M130 90 L${n.x} ${n.y}` : d} />
                </circle>
              )}
            </g>
          );
        })}
        <g style={{ opacity: connected ? 1 : 0.25, transition: "opacity 600ms" }}>
          <rect x="108" y="72" width="44" height="36" rx="10" fill="#03163f" stroke={CYAN} strokeWidth="1.2" />
          <text x="130" y="94" textAnchor="middle" fontSize="10" fontWeight="600" fill={CYAN} fontFamily="inherit">
            AI
          </text>
        </g>
        {NODES.map((n) => (
          <g key={n.label}>
            <rect x={n.x - 30} y={n.y - 13} width="60" height="26" rx="8" fill="#061b4a" stroke="rgba(180,196,224,0.35)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fill="#dfe8fb" fontFamily="inherit">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center text-[0.72rem] uppercase tracking-[0.2em] text-haze" aria-hidden>
        {connected ? "Connected" : "Disconnected"}
      </p>
    </div>
  );
}

/* --------------------------------------------- 2 · manual steps → automated workflow */
const STEPS = ["Request received", "Details checked", "Draft prepared", "Records updated", "Person reviews & approves"];

function AutomatedWorkflow() {
  const { ref, step, reduced } = useTicker(STEPS.length + 2, 900);
  const done = reduced ? STEPS.length : Math.min(step, STEPS.length);
  return (
    <div ref={ref}>
      <ol className="space-y-2" aria-hidden>
        {STEPS.map((s, i) => {
          const isDone = i < done;
          const human = i === STEPS.length - 1;
          return (
            <li key={s} className="flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-500" style={{ borderColor: isDone ? `${human ? "#83FD80" : CYAN}55` : "rgba(255,255,255,0.06)", background: isDone ? "rgba(0,246,254,0.05)" : "transparent" }}>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition-colors duration-500" style={{ borderColor: isDone ? (human ? "#83FD80" : CYAN) : "rgba(180,196,224,0.35)", color: human ? "#83FD80" : CYAN, background: isDone ? "rgba(0,16,61,0.9)" : "transparent" }}>
                {isDone ? "✓" : ""}
              </span>
              <span className={`text-[0.85rem] transition-colors duration-500 ${isDone ? "text-ink" : "text-haze"}`}>{s}</span>
              <span className="ml-auto text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: human ? "#83FD80" : CYAN, opacity: isDone ? 0.85 : 0.35 }}>
                {human ? "Human" : "Auto"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* --------------------------------------------- 3 · an assistant supporting the team */
function Assistant() {
  const { ref, step, reduced } = useTicker(4, 1400);
  const s = reduced ? 3 : step;
  return (
    <div ref={ref} aria-hidden className="space-y-3">
      <div className="ml-auto w-[85%] rounded-2xl rounded-br-md border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[0.84rem] text-ink">Summarise this week’s open orders by region.</div>
      <div className="flex gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#00F6FE]/40 text-[#00F6FE]">
          <Icon name="assistant" className="h-4 w-4" />
        </span>
        <div className="w-full rounded-2xl rounded-tl-md border border-[#00F6FE]/25 bg-[#00F6FE]/[0.05] px-3.5 py-3">
          {s === 0 ? (
            <span className="flex gap-1 py-1.5">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F6FE]" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </span>
          ) : (
            <div className="space-y-2">
              {["North", "Central", "South"].map((r, i) => (
                <div key={r} className="flex items-center gap-2 transition-opacity duration-500" style={{ opacity: s >= 1 + Math.min(i, 1) ? 1 : 0 }}>
                  <span className="w-14 text-[0.72rem] text-mist">{r}</span>
                  <span className="h-1.5 rounded-full bg-[linear-gradient(90deg,#00F6FE,#005FFE)]" style={{ width: `${[72, 48, 30][i]}%` }} />
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1 transition-opacity duration-500" style={{ opacity: s >= 3 ? 1 : 0 }}>
                {["Source: ERP", "Source: CRM"].map((c) => (
                  <span key={c} className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] text-haze">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiDemos() {
  return (
    <InView className="demos grid gap-4 md:grid-cols-3">
      <div className="demo-in" style={{ "--i": 0 } as React.CSSProperties}>
        <Panel title="Connected systems" caption="Disconnected tools linked through one intelligent layer — information flows instead of being re-keyed.">
          <ConnectedSystems />
        </Panel>
      </div>
      <div className="demo-in" style={{ "--i": 1 } as React.CSSProperties}>
        <Panel title="Automated workflows" caption="Repetitive steps handled automatically, with a person reviewing what matters.">
          <AutomatedWorkflow />
        </Panel>
      </div>
      <div className="demo-in" style={{ "--i": 2 } as React.CSSProperties}>
        <Panel title="Intelligent assistants" caption="Answers drawn from the business’s own systems, where the work happens.">
          <Assistant />
        </Panel>
      </div>
    </InView>
  );
}
