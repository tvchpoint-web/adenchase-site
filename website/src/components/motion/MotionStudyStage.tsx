"use client";

import { useEffect, useRef, useState } from "react";
import { SEQUENCE, type MotionStudy } from "./genomeScene";

function webgl(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Hosts the six-second Growth Genome motion study behind the hero copy.
 * Plays once on arrival, then rests; "Replay" restarts it. Reduced motion shows
 * the final composition; without WebGL a rendered still is shown instead.
 */
export function MotionStudyStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const clock = useRef({ t: 0, last: 0 });
  const [status, setStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!webgl()) {
      // Browser-only feature detection after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("fallback");
      return;
    }
    // `?t=3.2` freezes the sequence at a given second, for frame-by-frame review.
    const scrub = Number.parseFloat(new URLSearchParams(window.location.search).get("t") ?? "");
    const frozen = Number.isFinite(scrub);
    const reduced = frozen || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lite = window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    let study: MotionStudy | null = null;
    let raf = 0;
    let cancelled = false;

    import("./genomeScene").then(({ createMotionStudy }) => {
      if (cancelled) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      study = createMotionStudy(canvas, { width: w, height: h, dpr: Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2), lite });
      clock.current = { t: frozen ? scrub : reduced ? SEQUENCE : 0, last: performance.now() };
      setStatus("live");
      const frame = (now: number) => {
        const c = clock.current;
        const dt = Math.min(0.05, (now - c.last) / 1000);
        c.last = now;
        if (!reduced) c.t += dt;
        study?.render(c.t, reduced ? 0 : dt);
        (window as Window & { __motionReady?: boolean }).__motionReady = true;
        if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, c.t / SEQUENCE)})`;
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });

    const onResize = () => study?.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      study?.dispose();
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-navy" aria-hidden>
        <picture>
          <source media="(max-width: 767px)" srcSet="/motion-study/still-mobile.webp" />
          <img src="/motion-study/still.webp" alt="" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${status === "live" ? "opacity-0" : "opacity-100"}`} />
        </picture>
        <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${status === "live" ? "opacity-100" : "opacity-0"}`} />
      </div>
      {status === "live" && (
        <div className="fixed right-5 top-[5.25rem] z-20 flex items-center gap-4 sm:right-8 lg:bottom-8 lg:right-12 lg:top-auto">
          <span className="hidden text-[0.6875rem] uppercase tracking-[0.22em] text-haze sm:block">Motion study · 6s</span>
          <span aria-hidden className="relative hidden h-px w-24 overflow-hidden bg-line sm:block">
            <span ref={barRef} className="absolute inset-0 origin-left bg-jade" style={{ transform: "scaleX(0)" }} />
          </span>
          <button
            type="button"
            onClick={() => (clock.current.t = 0)}
            className="rounded-full border border-line bg-navy-deep/70 px-4 py-2 text-[0.8125rem] text-ink backdrop-blur-md transition-colors hover:border-ocean"
          >
            Replay
          </button>
        </div>
      )}
    </>
  );
}
