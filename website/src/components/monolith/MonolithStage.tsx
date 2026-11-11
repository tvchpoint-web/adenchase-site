"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { monolithState, onMonolithReady } from "./state";

const MonolithCanvas = dynamic(() => import("./MonolithCanvas"), { ssr: false });

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
 * Hosts the Monolith behind the hero. Shows a still rendered from the live scene first
 * (also the permanent no-JS / no-WebGL fallback), then cross-fades to the 3D scene.
 * Scroll progress through `scrollTargetId` opens the sculpture; scrolling back closes it.
 */
export function MonolithStage({ scrollTargetId }: { scrollTargetId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [support, setSupport] = useState<"pending" | "webgl" | "none">("pending");
  const [lite, setLite] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (monolithState.reducedMotion = mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Browser-only feature detection after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLite(narrow || coarse || (navigator.hardwareConcurrency ?? 8) <= 4);
    setSupport(webgl() ? "webgl" : "none");
    const off = onMonolithReady(() => setReady(true));

    const onScroll = () => {
      const el = document.getElementById(scrollTargetId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      monolithState.scroll = Math.min(1, Math.max(0, -r.top / travel));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      off();
    };
  }, [scrollTargetId]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-navy" data-nexus-stage="monolith">
      <picture>
        <source media="(max-width: 767px)" srcSet="/monolith/still-mobile.webp" />
        <img
          src="/monolith/still.webp"
          alt=""
          aria-hidden
          decoding="async"
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover object-[66%_50%] transition-opacity duration-700 max-md:object-[50%_30%] ${ready ? "opacity-0" : "opacity-100"}`}
        />
      </picture>
      {support === "webgl" && (
        <div className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          <MonolithCanvas lite={lite} pointerTarget={ref} />
        </div>
      )}
    </div>
  );
}
