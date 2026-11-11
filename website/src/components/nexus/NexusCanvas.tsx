"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FLOOR_Y, SHOTS, lerp, sceneBlend } from "./architecture";
import { NexusRig } from "./rig";
import { markNexusReady, nexusState } from "./store";

export interface NexusCanvasProps {
  /** Fixed story position for contained (sub-page) stages; omit to follow scroll. */
  story?: number;
  lite: boolean;
  anchor?: { x: number; y: number } | "scene";
  /** Camera distance multiplier. */
  distance?: number;
  pointerTarget: React.RefObject<HTMLElement | null>;
}

const NAVY = "#00103D";

/* ------------------------------------------------------------- the structure */

function Nexus({ story: fixedStory, lite, anchor = "scene", distance = 1 }: Omit<NexusCanvasProps, "pointerTarget">) {
  const rig = useMemo(() => new NexusRig({ lite }), [lite]);
  const state = useRef({ story: fixedStory ?? nexusState.storyTarget, intro: 0, frames: 0, az: 0, el: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => rig.dispose(), [rig]);

  useFrame((frame, delta) => {
    const { camera, size } = frame;
    const s = state.current;
    const dt = Math.min(delta, 0.1);
    const reduced = nexusState.reducedMotion;
    const goal = fixedStory ?? nexusState.storyTarget;
    s.story = reduced ? goal : lerp(s.story, goal, 1 - Math.exp(-3.0 * dt));
    if (Math.abs(s.story - goal) < 1e-4) s.story = goal;
    s.intro += dt;

    /* ---- orbital camera: blend shots in spherical coordinates so moves arc around the architecture */
    const { from, to, t } = sceneBlend(s.story);
    const A = SHOTS[from];
    const B = SHOTS[to];
    const aspect = size.width / Math.max(1, size.height);
    const narrow = aspect < 1.1;
    const fit = (narrow ? Math.min(2.3, 1.38 / aspect) : aspect < 1.45 ? 1.12 : 1) * distance;
    const p = nexusState.pointer;
    const px = p.active && !reduced ? p.x : 0;
    const py = p.active && !reduced ? p.y : 0;
    // Perceptible but controlled orbital parallax (~4.5° / 2.5°), settling in ~350 ms.
    s.az = lerp(s.az, px * 0.08, 1 - Math.exp(-6 * dt));
    s.el = lerp(s.el, py * 0.045, 1 - Math.exp(-6 * dt));
    const az = lerp(A.azimuth, B.azimuth, t) - s.az;
    const el = lerp(A.elevation, B.elevation, t) - s.el;
    const dist = lerp(A.distance, B.distance, t) * fit;
    target.set(lerp(A.target[0], B.target[0], t), lerp(A.target[1], B.target[1], t), lerp(A.target[2], B.target[2], t));
    camera.position.set(target.x + dist * Math.cos(el) * Math.sin(az), target.y + dist * Math.sin(el), target.z + dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(target);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = lerp(A.fov, B.fov, t);
    const ax = anchor === "scene" ? (narrow ? 0.5 : lerp(A.anchorX, B.anchorX, t)) : anchor.x;
    const ay = anchor === "scene" ? (narrow ? 0.24 : 0.5) : anchor.y;
    cam.setViewOffset(size.width, size.height, (0.5 - ax) * size.width, (0.5 - ay) * size.height, size.width, size.height);

    rig.update({
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
    if (++s.frames === 4) markNexusReady();
  });

  return <primitive object={rig.root} />;
}

/* ------------------------------------------------------- lighting & world */

function Lighting({ lite }: { lite: boolean }) {
  return (
    <>
      <ambientLight intensity={0.35} color="#3d63c4" />
      <directionalLight
        position={[-6, 11, 8]}
        intensity={2.6}
        color="#dbe8ff"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={40}
      />
      {/* Rim lights separate the architecture from the night behind it. */}
      <directionalLight position={[8, 5, -9]} intensity={3.2} color="#00D3FB" />
      <directionalLight position={[-9, 3, -7]} intensity={4.5} color="#2a66ff" />
      <pointLight position={[0, FLOOR_Y + 0.5, 2.2]} intensity={10} distance={7} color="#00D3FB" />

      {/* Studio environment for reflections: soft key, sapphire and cyan light walls, a jade accent. */}
      <Environment frames={1} resolution={lite ? 128 : 256}>
        <color attach="background" args={["#000716"]} />
        <Lightformer form="rect" intensity={6} color="#dbe8ff" scale={[16, 5]} position={[0, 9, 3]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.6} color="#cfe0ff" scale={[14, 4]} position={[2, 3, 11]} />
        <Lightformer form="rect" intensity={3.5} color="#4f8dff" scale={[6, 6]} position={[-7, 4, 7]} rotation-y={Math.PI / 4} />
        <Lightformer form="rect" intensity={5} color="#0042AC" scale={[4, 12]} position={[-10, 2, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={7} color="#00D3FB" scale={[0.8, 12]} position={[9, 1, -2]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={7} color="#00D3FB" scale={[0.8, 12]} position={[9, 1, 3]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={2.5} color="#0042AC" scale={9} position={[0, 4, -11]} />
        <Lightformer form="rect" intensity={2.4} color="#83FD80" scale={[4, 0.5]} position={[-3, -1.5, 9]} />
      </Environment>
    </>
  );
}

function Floor({ lite }: { lite: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y} receiveShadow>
      <planeGeometry args={[90, 90]} />
      {lite ? (
        <meshStandardMaterial color="#04123a" metalness={0.6} roughness={0.45} envMapIntensity={0.6} />
      ) : (
        <MeshReflectorMaterial
          blur={[420, 140]}
          resolution={1024}
          mixBlur={1}
          mixStrength={2.1}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#061641"
          metalness={0.6}
          mirror={0.6}
        />
      )}
    </mesh>
  );
}

/** Distant monoliths and a plaza ring give the scene background and middle-ground depth. */
function Backdrop({ lite }: { lite: boolean }) {
  const items = useMemo(
    () =>
      [
        [-24, -24, 3.2, 17],
        [-15, -28, 2.2, 22],
        [-7, -31, 3.8, 13],
        [9, -30, 2.6, 19],
        [17, -25, 3.4, 15],
        [27, -22, 2.4, 21],
        [-31, -14, 2.8, 12],
        [33, -12, 3, 14],
      ].slice(0, lite ? 5 : 8),
    [lite],
  );
  return (
    <group>
      {items.map(([x, z, w, h], i) => (
        <group key={i} position={[x, FLOOR_Y + h / 2, z]} rotation-y={(i % 3) * 0.25 - 0.25}>
          <mesh>
            <boxGeometry args={[w, h, w * 0.6]} />
            <meshStandardMaterial color="#0a1a44" metalness={0.85} roughness={0.38} envMapIntensity={0.8} />
          </mesh>
          {/* A low lit threshold at the base reads as distant architecture, not as lines across the copy. */}
          <mesh position={[0, -h / 2 + 0.6, w * 0.31]}>
            <boxGeometry args={[w * 0.7, 0.06, 0.06]} />
            <meshBasicMaterial color={i % 4 === 0 ? "#83FD80" : "#00D3FB"} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y + 0.005}>
        <ringGeometry args={[8.6, 8.66, 160]} />
        <meshBasicMaterial color="#00D3FB" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y + 0.005}>
        <ringGeometry args={[4.6, 4.63, 120]} />
        <meshBasicMaterial color="#0042AC" transparent opacity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Effects({ lite }: { lite: boolean }) {
  if (lite) return null;
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.25} />
      <Vignette offset={0.28} darkness={0.55} />
    </EffectComposer>
  );
}

/* ------------------------------------------------------------------ canvas */

export default function NexusCanvas({ pointerTarget, lite, ...rest }: NexusCanvasProps) {
  const maxDpr = lite ? 1.5 : 2;
  const [dpr, setDpr] = useState(() => Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, maxDpr));

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
      shadows={!lite}
      gl={{ antialias: lite, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 32, near: 0.1, far: 140, position: [8, 2, 15] }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <color attach="background" args={[NAVY]} />
      <fog attach="fog" args={[NAVY, 24, 62]} />
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d * 0.8))} onIncline={() => setDpr((d) => Math.min(maxDpr, d * 1.15))} flipflops={3} onFallback={() => setDpr(1)} />
      <Lighting lite={lite} />
      <Floor lite={lite} />
      <Backdrop lite={lite} />
      <Nexus lite={lite} {...rest} />
      <Effects lite={lite} />
    </Canvas>
  );
}
