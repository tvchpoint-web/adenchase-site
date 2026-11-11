"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { nexusState, onNexusReady, resetNexusState } from "./store";

const NexusCanvas = dynamic(() => import("./NexusCanvas"), { ssr: false });

type Support = "pending" | "webgl" | "none";

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function detectLite(): boolean {
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return narrow || (coarse && cores <= 6) || cores <= 2 || memory <= 2;
}

/**
 * Hosts the Nexus. Renders a composed still of the architecture first (which
 * is also the permanent fallback for no-JS / no-WebGL), then lazily loads the
 * live 3D scene and cross-fades to it once its first frame is drawn.
 */
export function NexusStage({
  variant,
  story,
  distance,
  className = "",
}: {
  variant: "fixed" | "contained";
  story?: number;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [support, setSupport] = useState<Support>("pending");
  const [lite, setLite] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    resetNexusState(story ?? 0);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (nexusState.reducedMotion = mq.matches);
    sync();
    mq.addEventListener("change", sync);
    // Feature detection must run in the browser after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLite(detectLite());
    setSupport(detectWebGL() ? "webgl" : "none");
    const off = onNexusReady(() => setReady(true));
    return () => {
      mq.removeEventListener("change", sync);
      off();
    };
  }, [story]);

  const positioning = variant === "fixed" ? "fixed inset-0" : "absolute inset-0";
  const still = variant === "fixed" ? "/nexus/still-home.webp" : `/nexus/still-scene-${story ?? 0}.webp`;
  const stillMobile = variant === "fixed" ? "/nexus/still-home-mobile.webp" : still;

  return (
    <div ref={ref} className={`${positioning} pointer-events-none overflow-hidden ${className}`} data-nexus-stage={variant}>
      <picture>
        <source media="(max-width: 767px)" srcSet={stillMobile} />
        <img
          src={still}
          alt=""
          aria-hidden
          decoding="async"
          fetchPriority={variant === "fixed" ? "high" : "auto"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${variant === "fixed" ? "object-[64%_50%] max-md:object-[50%_30%]" : "object-center"} ${ready ? "opacity-0" : "opacity-100"}`}
        />
      </picture>
      {support === "webgl" && (
        <div className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          <NexusCanvas pointerTarget={ref} lite={lite} story={story} distance={distance} anchor={variant === "fixed" ? "scene" : { x: 0.5, y: 0.5 }} />
        </div>
      )}
    </div>
  );
}
