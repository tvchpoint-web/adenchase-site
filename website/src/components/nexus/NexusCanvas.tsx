"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { NexusEngine } from "./engine";
import { SCENES, lerp, sceneBlend } from "./layout";
import { markNexusReady, nexusState } from "./store";

export interface NexusCanvasProps {
  /** Fixed story position for contained (sub-page) stages; omit to follow scroll. */
  story?: number;
  lite: boolean;
  /** Where the structure sits in this canvas (fraction of width / height). */
  anchor?: { x: number; y: number } | "scene";
  /** Extra camera distance multiplier (contained stages frame the structure tighter or looser). */
  distance?: number;
  /** Element whose bounds define pointer coordinates. */
  pointerTarget: React.RefObject<HTMLElement | null>;
}

function NexusScene({ story: fixedStory, lite, anchor = "scene", distance = 1 }: Omit<NexusCanvasProps, "pointerTarget">) {
  const gl = useThree((st) => st.gl);
  const engine = useMemo(() => new NexusEngine({ lite, pixelRatio: gl.getPixelRatio() }), [lite, gl]);
  const state = useRef({
    story: fixedStory ?? nexusState.storyTarget,
    intro: 0,
    frames: 0,
    camX: 0,
    camY: 0,
    started: false,
  });
  const target = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => engine.dispose(), [engine]);

  useFrame((frame, delta) => {
    const { camera, size } = frame;
    const s = state.current;
    const dt = Math.min(delta, 0.1);
    const reduced = nexusState.reducedMotion;
    engine.setPixelRatio(gl.getPixelRatio());

    // Scroll progress is smoothed here, so fast flicks still produce a continuous, reversible camera move.
    const goal = fixedStory ?? nexusState.storyTarget;
    s.story = reduced ? goal : lerp(s.story, goal, 1 - Math.exp(-3.4 * dt));
    if (Math.abs(s.story - goal) < 1e-4) s.story = goal;
    s.intro += dt;

    /* ---- camera: blend scene cameras, fit the viewport, add parallax depth */
    const { from, to, t } = sceneBlend(s.story);
    const A = SCENES[from].camera;
    const B = SCENES[to].camera;
    const aspect = size.width / Math.max(1, size.height);
    const narrow = aspect < 1.1;
    const fit = (narrow ? Math.min(1.9, 1.08 / aspect) : aspect < 1.45 ? 1.15 : 1) * distance;
    target.set(lerp(A.target[0], B.target[0], t), lerp(A.target[1], B.target[1], t), lerp(A.target[2], B.target[2], t));
    pos.set(lerp(A.pos[0], B.pos[0], t), lerp(A.pos[1], B.pos[1], t), lerp(A.pos[2], B.pos[2], t));
    pos.sub(target).multiplyScalar(fit).add(target);
    const p = nexusState.pointer;
    const px = p.active && !reduced ? p.x : 0;
    const py = p.active && !reduced ? p.y : 0;
    s.camX = lerp(s.camX, px * 0.32, 1 - Math.exp(-6 * dt));
    s.camY = lerp(s.camY, py * 0.2, 1 - Math.exp(-6 * dt));
    camera.position.set(pos.x + s.camX, pos.y + s.camY, pos.z);
    camera.lookAt(target);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = lerp(A.fov, B.fov, t);

    // Composition: shift the projection (not the camera) so perspective stays symmetric.
    const ax = anchor === "scene" ? (narrow ? 0.5 : lerp(SCENES[from].anchorX, SCENES[to].anchorX, t)) : anchor.x;
    const ay = anchor === "scene" ? (narrow ? 0.27 : 0.5) : anchor.y;
    cam.setViewOffset(size.width, size.height, (0.5 - ax) * size.width, (0.5 - ay) * size.height, size.width, size.height);

    engine.update({
      dt,
      time: s.intro,
      intro: s.intro,
      story: s.story,
      camera,
      viewport: size,
      pointer: p,
      focusRegion: nexusState.focusRegion,
      focusPath: nexusState.focusPath,
      focusPathSerial: nexusState.focusPathSerial,
      reducedMotion: reduced,
    });

    if (++s.frames === 3) markNexusReady();
  });

  return <primitive object={engine.root} />;
}

export default function NexusCanvas({ pointerTarget, lite, ...rest }: NexusCanvasProps) {
  const maxDpr = lite ? 1.5 : 2;
  const [dpr, setDpr] = useState(() => Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, maxDpr));

  // Pointer → normalised coordinates relative to the stage. Passive, never blocks scrolling.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = pointerTarget.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      nexusState.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nexusState.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      nexusState.pointer.active = e.pointerType === "mouse" || e.pointerType === "pen" || e.buttons > 0;
    };
    const onLeave = () => (nexusState.pointer.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [pointerTarget]);

  // Pause rendering entirely when the stage is scrolled out of view.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = pointerTarget.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [pointerTarget]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={visible ? "always" : "never"}
      gl={{ antialias: !lite || dpr < 1.5, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 34, near: 0.1, far: 80, position: [0, 1, 10.5] }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d * 0.8))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d * 1.15))}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <NexusScene lite={lite} {...rest} />
    </Canvas>
  );
}
