"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { Monolith } from "./Monolith";
import { monolithState } from "./state";

/** Brand Midnight Navy: also lets the official logo's own navy field dissolve into the page. */
const BG = "#00103D";

/* ------------------------------------------------------------------ camera */

/**
 * A weighted camera: a slow push-in on arrival, a dolly toward the opening as the
 * visitor scrolls, and a subtle orbit that follows the pointer to reveal depth.
 */
function CameraRig() {
  const s = useRef({ t: 0, az: 0, el: 0, scroll: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const { camera, size } = state;
    const dt = Math.min(delta, 0.1);
    const reduced = monolithState.reducedMotion;
    const r = s.current;
    r.t += dt;
    const p = monolithState.pointer;
    const px = p.active && !reduced ? p.x : 0;
    const py = p.active && !reduced ? p.y : 0;
    r.az = THREE.MathUtils.lerp(r.az, px * 0.11, 1 - Math.exp(-3.2 * dt));
    r.el = THREE.MathUtils.lerp(r.el, py * 0.05, 1 - Math.exp(-3.2 * dt));
    r.scroll = reduced ? monolithState.scroll : THREE.MathUtils.lerp(r.scroll, monolithState.scroll, 1 - Math.exp(-3 * dt));
    const k = r.scroll;
    const intro = reduced ? 0 : 1 - THREE.MathUtils.smoothstep(r.t, 0, 4.5);

    const aspect = size.width / Math.max(1, size.height);
    const narrow = aspect < 1.1;
    // Narrow screens widen the lens rather than retreating into the fog, so the sculpture keeps its presence.
    const fit = narrow ? 1.2 : aspect < 1.45 ? 1.1 : 1;
    const lens = narrow ? Math.min(2.4, 1.05 / aspect) : 1;

    const az = THREE.MathUtils.lerp(0.5, 0.24, k) - r.az;
    const el = THREE.MathUtils.lerp(0.03, 0.11, k) - r.el;
    const dist = (THREE.MathUtils.lerp(18.6, 14.2, k) + intro * 2.4) * fit;
    target.set(THREE.MathUtils.lerp(0, 0.1, k), THREE.MathUtils.lerp(3.7, 4.1, k), 0);
    camera.position.set(target.x + dist * Math.cos(el) * Math.sin(az), target.y + dist * Math.sin(el) - 1.2, target.z + dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(target);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * lens));
    const ax = narrow ? 0.5 : THREE.MathUtils.lerp(0.66, 0.63, k);
    const ay = narrow ? 0.27 : 0.5;
    cam.setViewOffset(size.width, size.height, (0.5 - ax) * size.width, (0.5 - ay) * size.height, size.width, size.height);
  });
  return null;
}

/* ------------------------------------------------------------------ world */

function Gallery({ lite }: { lite: boolean }) {
  const pool = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(90,120,190,0.32)");
    g.addColorStop(0.45, "rgba(30,55,130,0.1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => pool.dispose(), [pool]);

  return (
    <>
      <ambientLight intensity={0.06} color="#3b5bb0" />
      {/* Dark studio: only a few soft panels for the polished surfaces to reflect. */}
      <Environment frames={1} resolution={lite ? 128 : 256}>
        <color attach="background" args={["#00061a"]} />
        <Lightformer form="rect" intensity={1.6} color="#cddcff" scale={[3, 12]} position={[-6, 5, 6]} target={[0, 3, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#2a5cff" scale={[10, 2]} position={[0, 10, -4]} target={[0, 3, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#00D3FB" scale={[0.4, 10]} position={[6, 4, -2]} target={[0, 3, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#ffffff" scale={[8, 1.2]} position={[2, 1, 9]} target={[0, 3, 0]} />
      </Environment>

      {/* Black mirror floor and a soft gallery light pool. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[120, 120]} />
        {lite ? (
          <meshStandardMaterial color="#030a1d" metalness={0.55} roughness={0.32} envMapIntensity={0.7} />
        ) : (
          <MeshReflectorMaterial
            blur={[700, 220]}
            resolution={1024}
            mixBlur={1}
            mixStrength={1.6}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.25}
            maxDepthThreshold={1.6}
            color="#030a1d"
            metalness={0.55}
            mirror={0.45}
          />
        )}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0.5]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <ContactShadows position={[0, 0.004, 0]} scale={16} resolution={lite ? 512 : 1024} blur={2.8} opacity={0.92} far={9} color="#000000" frames={Infinity} />
    </>
  );
}

function Effects({ lite }: { lite: boolean }) {
  return (
    <EffectComposer multisampling={lite ? 0 : 4}>
      {/* Only the jade signal exceeds the bloom threshold: no general glow. */}
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={1.0} luminanceSmoothing={0.15} radius={0.6} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} />
    </EffectComposer>
  );
}

/* ------------------------------------------------------------------ canvas */

export default function MonolithCanvas({ lite, pointerTarget }: { lite: boolean; pointerTarget: React.RefObject<HTMLElement | null> }) {
  const maxDpr = lite ? 2 : 2;
  const [dpr, setDpr] = useState(() => Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, maxDpr));
  useMemo(() => RectAreaLightUniformsLib.init(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = pointerTarget.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      monolithState.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      monolithState.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      monolithState.pointer.active = e.pointerType === "mouse" || e.pointerType === "pen" || e.buttons > 0;
    };
    const off = () => (monolithState.pointer.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", off, { passive: true });
    document.documentElement.addEventListener("pointerleave", off);
    window.addEventListener("blur", off);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", off);
      document.documentElement.removeEventListener("pointerleave", off);
      window.removeEventListener("blur", off);
    };
  }, [pointerTarget]);

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: lite, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 30, near: 0.1, far: 160, position: [8, 2, 16] }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 22, 55]} />
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d * 0.8))} onIncline={() => setDpr((d) => Math.min(maxDpr, d * 1.15))} flipflops={3} onFallback={() => setDpr(1)} />
      <CameraRig />
      <Gallery lite={lite} />
      <Monolith lite={lite} />
      <Effects lite={lite} />
    </Canvas>
  );
}
