"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/brand/Icons";
import { InView } from "@/components/motion/InView";
import { IntegrationNexus } from "@/components/home/IntegrationNexus";

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
    <figure className="demo-panel group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(165deg,rgba(9,30,82,0.75),rgba(0,10,40,0.85))] p-5 shadow-[0_30px_60px_-36px_rgba(0,0,0,0.9)] transition-[border-color] duration-300 hover:border-[#00F6FE]/30 sm:p-6">
      <span className="absolute right-4 top-4 z-10 rounded-full border border-white/10 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.16em] text-haze">Illustrative</span>
      {/* Equal-height panels in a row: each demo is centred in its space and every caption sits on the same line. */}
      <div className="relative flex flex-1 flex-col justify-center pt-5">{children}</div>
      <figcaption className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-[1rem] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[0.86rem] leading-relaxed text-mist">{caption}</p>
      </figcaption>
    </figure>
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

/**
 * Plays a sequence once, the first time it scrolls into view, then holds the final state. It
 * starts (and renders on the server) at `from`, so the panel is never shown empty.
 */
function useSequence(steps: number, ms: number, from: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(steps - 1);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setStep(from);
        timer = setInterval(() => {
          setStep((v) => {
            if (v + 1 >= steps - 1 && timer) clearInterval(timer);
            return Math.min(steps - 1, v + 1);
          });
        }, ms);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [steps, ms, from]);
  return { ref, step };
}

function Bubble({ who, children }: { who: "customer" | "assistant"; children: React.ReactNode }) {
  const mine = who === "customer";
  return (
    <div className={`chat-in flex gap-2 ${mine ? "justify-end" : ""}`}>
      {!mine && (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#00F6FE]/40 text-[#00F6FE]">
          <Icon name="assistant" className="h-3.5 w-3.5" />
        </span>
      )}
      <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-[0.8rem] leading-snug ${mine ? "rounded-br-md border border-white/[0.08] bg-white/[0.05] text-ink" : "rounded-tl-md border border-[#00F6FE]/25 bg-[#00F6FE]/[0.05] text-ink"}`}>{children}</div>
    </div>
  );
}

/* --------------------------------------------- 3 · a customer-facing assistant */
// An illustrative service enquiry, shown as a complete chat window: who is answering, the
// conversation anchored to the bottom like a real chat (fixed height, so nothing moves around
// it), and the message field. It plays through
// once when it comes into view (answer → booking → handover to a person) and then holds.
function Assistant() {
  const { ref, step: s } = useSequence(6, 1300, 1);
  return (
    <div ref={ref} aria-hidden className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[rgba(0,10,40,0.45)]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-3.5 py-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#00F6FE]/40 text-[#00F6FE]">
          <Icon name="assistant" className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.8rem] font-semibold text-ink">Service assistant</span>
          <span className="flex items-center gap-1.5 text-[0.66rem] text-haze">
            <span className="h-1.5 w-1.5 rounded-full bg-[#83FD80]" />
            Answers from your service guide
          </span>
        </span>
      </div>
      {/* Fixed height: the conversation grows from the bottom and older messages scroll off the top,
          so the panel never changes size (no layout shift) while it plays. */}
      <div className="chat-scroll flex h-[19rem] flex-col justify-end md:h-[16.5rem] gap-2.5 overflow-hidden px-3 py-3">
        <Bubble who="customer">Can someone look at my air-conditioning unit this week? It’s started rattling.</Bubble>
        <Bubble who="assistant">
          A rattle is often a loose panel or fan mount — worth checking soon. We can visit Thursday 10:00 or Friday 14:00.
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {["Thu 10:00", "Fri 14:00"].map((t, i) => (
              <span key={t} className="rounded-full border px-2 py-0.5 text-[0.66rem] transition-colors duration-500" style={{ borderColor: s >= 2 && i === 0 ? "#83FD80" : "rgba(0,246,254,0.35)", color: s >= 2 && i === 0 ? "#83FD80" : "#9fefff" }}>
                {t}
              </span>
            ))}
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] text-haze">Source: service guide</span>
          </span>
        </Bubble>
        {s >= 2 && <Bubble who="customer">Thursday, please. Is it covered by my warranty?</Bubble>}
        {s === 3 && (
          <div className="chat-in flex gap-2">
            <span className="h-6 w-6 shrink-0" />
            <span className="flex gap-1 rounded-2xl rounded-tl-md border border-[#00F6FE]/25 bg-[#00F6FE]/[0.05] px-3 py-2.5">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F6FE]" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </span>
          </div>
        )}
        {s >= 4 && <Bubble who="assistant">Booked for Thursday 10:00. Warranty questions go to the service team — I’ve passed them your details and they’ll confirm today.</Bubble>}
        {s >= 5 && (
          <div className="chat-in flex items-center gap-2 pl-8 text-[0.62rem] uppercase tracking-[0.16em] text-[#83FD80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#83FD80]" />
            Handed to a person · Service team
          </div>
        )}
      </div>
      <div className="m-2.5 mt-0 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
        <span className="flex-1 text-[0.74rem] text-haze">Message the service team…</span>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#00F6FE]/70" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8h11M9 4l4 4-4 4" />
        </svg>
      </div>
    </div>
  );
}

export function AiDemos() {
  return (
    <InView className="demos grid gap-4 md:grid-cols-3">
      <div className="demo-in" style={{ "--i": 0 } as React.CSSProperties}>
        <Panel title="Connected systems" caption="Intelligently connects your existing business systems and workflows—allowing information to move seamlessly between them without unnecessary duplication.">
          <IntegrationNexus />
        </Panel>
      </div>
      <div className="demo-in" style={{ "--i": 1 } as React.CSSProperties}>
        <Panel title="Automated workflows" caption="Repetitive steps handled automatically, with a person reviewing what matters.">
          <AutomatedWorkflow />
        </Panel>
      </div>
      <div className="demo-in" style={{ "--i": 2 } as React.CSSProperties}>
        <Panel title="Intelligent assistants" caption="Handles routine customer enquiries from the business’s own knowledge, guides bookings, and hands over to a person when it matters.">
          <Assistant />
        </Panel>
      </div>
    </InView>
  );
}
