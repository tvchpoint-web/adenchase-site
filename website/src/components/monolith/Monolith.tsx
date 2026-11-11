"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { flutingNormalMap, wearRoughnessMap } from "./textures";
import { markMonolithReady, monolithState } from "./state";
import { Helix } from "./Helix";
import { BEVEL, CROWN_DROP, D, H, HAIRLINE, JADE, N, OCEAN, OPEN_DISTANCE, OPEN_SLIDE, SEAM_LEN, SEAM_MID, SEAM_START, U, W, openingCentre, seamY } from "./form";

function extrude(points: [number, number][]) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: D - 2 * BEVEL,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 1,
  });
  geo.translate(0, 0, -(D - 2 * BEVEL) / 2);
  geo.computeVertexNormals();
  return geo;
}

const inlayVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/**
 * The Living Signal inside the seam: it finds the seam (reveal head), then breathes,
 * follows the visitor's attention (cursor) and carries the slow scan.
 */
const inlayFragment = /* glsl */ `
  uniform vec3 uJade;
  uniform float uReveal;
  uniform float uLevel;
  uniform float uTime;
  uniform float uCursorT;
  uniform float uCursorAmt;
  uniform float uScan;
  varying vec2 vUv;
  void main() {
    float t = vUv.x;
    float revealed = smoothstep(uReveal + 0.002, uReveal - 0.04, t);
    float head = uReveal < 0.999 ? exp(-pow((t - uReveal) / 0.014, 2.0)) : 0.0;
    float breath = 0.78 + 0.22 * sin(uTime * 1.1 - t * 5.0);
    float cursor = uCursorAmt * exp(-pow((t - uCursorT) / 0.09, 2.0));
    float scan = exp(-pow((t - uScan) / 0.035, 2.0));
    float glow = revealed * uLevel * breath * 0.85 + head * 2.3 + cursor * 1.6 + scan * 1.4 * uLevel;
    gl_FragColor = vec4(uJade * glow, 1.0);
  }
`;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const damp = (a: number, b: number, l: number, dt: number) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-l * dt));

export function Monolith({ lite }: { lite: boolean }) {
  const { camera } = useThree();

  /* ---- geometry */
  const geo = useMemo(() => {
    const hw = W / 2 - BEVEL;
    const off = BEVEL + HAIRLINE;
    const lower = extrude([
      [-hw, BEVEL],
      [hw, BEVEL],
      [hw, seamY(hw, -off)],
      [-hw, seamY(-hw, -off)],
    ]);
    const upper = extrude([
      [-hw, seamY(-hw, off)],
      [hw, seamY(hw, off)],
      [hw, H - BEVEL],
      [-hw, H - BEVEL - CROWN_DROP],
    ]);
    // The upper section pivots about the middle of the seam.
    upper.translate(-SEAM_MID.x, -SEAM_MID.y, 0);
    const plinth = new RoundedBoxGeometry(4.8, 0.3, 2.6, 4, 0.05);
    const inlay = new THREE.BoxGeometry(SEAM_LEN - 0.12, 0.012, D - 2 * BEVEL - 0.02);
    return { lower, upper, plinth, inlay };
  }, []);

  /* ---- materials */
  const mats = useMemo(() => {
    const fluting = flutingNormalMap();
    fluting.repeat.set(1 / 0.06, 1);
    const wear = wearRoughnessMap(11);
    wear.repeat.set(0.32, 0.32);
    const wearSide = wearRoughnessMap(23);
    wearSide.repeat.set(0.6, 0.6);
    // Polished sapphire-black lacquer with fine architectural fluting on the broad faces.
    const lacquer = new THREE.MeshPhysicalMaterial({
      color: "#0b1531",
      metalness: 0.1,
      roughness: 0.95,
      roughnessMap: wear,
      normalMap: fluting,
      normalScale: new THREE.Vector2(0.09, 0.09),
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.0,
    });
    // Brushed graphite metal for the edges and the revealed cut faces.
    const graphite = new THREE.MeshPhysicalMaterial({
      color: "#1a2238",
      metalness: 1,
      roughness: 0.9,
      roughnessMap: wearSide,
      anisotropy: lite ? 0 : 0.75,
      anisotropyRotation: Math.PI / 2,
      envMapIntensity: 1.1,
    });
    const plinth = new THREE.MeshPhysicalMaterial({ color: "#070d1f", metalness: 0.3, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const inlay = new THREE.ShaderMaterial({
      vertexShader: inlayVertex,
      fragmentShader: inlayFragment,
      uniforms: {
        uJade: { value: JADE },
        uReveal: { value: 0 },
        uLevel: { value: 0 },
        uTime: { value: 0 },
        uCursorT: { value: 0.5 },
        uCursorAmt: { value: 0 },
        uScan: { value: -1 },
      },
      toneMapped: false,
    });
    return { lacquer, graphite, plinth, inlay, textures: [fluting, wear, wearSide] };
  }, [lite]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      [mats.lacquer, mats.graphite, mats.plinth, mats.inlay].forEach((m) => m.dispose());
      mats.textures.forEach((t) => t.dispose());
    },
    [geo, mats],
  );

  /* ---- refs */
  const lowerRef = useRef<THREE.Mesh>(null);
  const upperRef = useRef<THREE.Mesh>(null);
  const upperPivot = useRef<THREE.Group>(null);
  const sculpture = useRef<THREE.Group>(null);
  const interiorLights = useRef<(THREE.PointLight | null)[]>([]);
  const keyLight = useRef<THREE.RectAreaLight>(null);
  const rimLight = useRef<THREE.RectAreaLight>(null);
  const backLight = useRef<THREE.RectAreaLight>(null);
  const inlayRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);

  const sim = useRef({ t: 0, open: 0, cursorAmt: 0, cursorT: 0.5, keyX: -5, keyY: 8.5, frames: 0 });
  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(),
      c2: new THREE.Vector2(),
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      local: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.1);
    const reduced = monolithState.reducedMotion;
    s.t += dt;
    const t = reduced ? 99 : s.t;

    /* ---- choreography: light rises → the signal finds the seam → the sculpture opens */
    const light = THREE.MathUtils.smoothstep(t, 0.0, 1.8);
    const reveal = easeInOut(clamp01((t - 1.4) / 2.2));
    // At rest the seam opens to a narrow crack with glimpses of the helix; scrolling reveals all of it.
    const autoOpen = 0.17 * easeInOut(clamp01((t - 3.5) / 2.8));
    const openTarget = autoOpen + 0.83 * monolithState.scroll * clamp01((t - 3.5) / 2.8);
    s.open = reduced ? openTarget : damp(s.open, openTarget, 2.4, dt); // heavy, deliberate
    const o = s.open;
    monolithState.open = o;

    if (upperPivot.current) {
      const lift = OPEN_DISTANCE * o;
      upperPivot.current.position.set(SEAM_MID.x + N.x * lift + U.x * OPEN_SLIDE * o, SEAM_MID.y + N.y * lift + U.y * OPEN_SLIDE * o, 0.1 * o);
      upperPivot.current.rotation.z = -0.03 * o;
    }

    /* ---- cursor: where the visitor looks, the signal answers */
    const p = monolithState.pointer;
    let hit = false;
    if (p.active && !reduced && lowerRef.current && upperRef.current && sculpture.current) {
      tmp.ndc.set(p.x, p.y);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      const hits = tmp.ray.intersectObjects([lowerRef.current, upperRef.current], false);
      if (hits.length) {
        hit = true;
        tmp.local.copy(hits[0].point);
        sculpture.current.worldToLocal(tmp.local);
        const rx = tmp.local.x - SEAM_START.x;
        const ry = tmp.local.y - SEAM_START.y;
        const along = (rx * U.x + ry * U.y) / SEAM_LEN;
        const across = Math.abs(rx * N.x + ry * N.y);
        s.cursorT = damp(s.cursorT, clamp01(along), 8, dt);
        s.cursorAmt = damp(s.cursorAmt, THREE.MathUtils.smoothstep(1.8 - across, 0, 1.8) * reveal, 5, dt);
      }
    }
    if (!hit) s.cursorAmt = damp(s.cursorAmt, 0, 3, dt);

    /* ---- the helix signal also runs along the seam inlay (same axis, same moment) */
    const pulse = monolithState.pulse;
    const scan = pulse > -0.5 ? 0.5 + (pulse - 0.5) * (3.3 / SEAM_LEN) : -1;

    const inlay = inlayRef.current?.material.uniforms;
    if (inlay) {
      inlay.uReveal.value = reveal;
      inlay.uLevel.value = reveal;
      inlay.uTime.value = t;
      inlay.uCursorT.value = s.cursorT;
      inlay.uCursorAmt.value = s.cursorAmt;
      inlay.uScan.value = scan;
    }

    // Ocean and jade light inside the opening: it is what models the helix.
    openingCentre(o, tmp.c2);
    interiorLights.current.forEach((l, k) => {
      if (!l) return;
      const lt = 0.2 + 0.3 * k;
      const near = scan > -1 ? Math.exp(-(((lt - scan) / 0.2) ** 2)) : 0;
      l.position.set(tmp.c2.x + U.x * SEAM_LEN * (lt - 0.5), tmp.c2.y + U.y * SEAM_LEN * (lt - 0.5), 0.75);
      l.intensity = (lite ? 2.6 : 3.4) * Math.min(1, o * 2.5) * (k === 1 ? 0.5 + 1.2 * near : 1) + 1.0 * s.cursorAmt;
    });

    /* ---- gallery key light follows the cursor, so highlights glide across the lacquer */
    const px = p.active && !reduced ? p.x : 0;
    const py = p.active && !reduced ? p.y : 0;
    s.keyX = damp(s.keyX, -5 + px * 4.5, 2.8, dt);
    s.keyY = damp(s.keyY, 8.5 + py * 1.8, 2.8, dt);
    if (keyLight.current) {
      keyLight.current.position.set(s.keyX, s.keyY, 7);
      keyLight.current.lookAt(0, 3.6, 0);
      keyLight.current.intensity = 5.2 * light;
    }
    if (rimLight.current) rimLight.current.intensity = 6 * light;
    if (backLight.current) backLight.current.intensity = 3.2 * light;

    if (++s.frames === 4) markMonolithReady();
  });

  return (
    <group>
      {/* Lights that belong to the sculpture's choreography. */}
      <rectAreaLight ref={keyLight} width={2.8} height={10} color="#e3eeff" intensity={0} position={[-5, 8.5, 7]} />
      <rectAreaLight ref={rimLight} width={0.45} height={9} color="#00D3FB" intensity={0} position={[4.4, 4.6, -3.6]} onUpdate={(l) => l.lookAt(0, 3.8, 0)} />
      <rectAreaLight ref={backLight} width={3} height={8} color="#2a5cff" intensity={0} position={[-4.8, 4.2, -3.8]} onUpdate={(l) => l.lookAt(0, 3.6, 0)} />

      <mesh geometry={geo.plinth} material={mats.plinth} position={[0, 0.15, 0]} receiveShadow castShadow />

      <group ref={sculpture} position={[0, 0.3, 0]}>
        <mesh ref={lowerRef} geometry={geo.lower} material={[mats.lacquer, mats.graphite]} castShadow receiveShadow />
        <group ref={upperPivot} position={[SEAM_MID.x, SEAM_MID.y, 0]}>
          <mesh ref={upperRef} geometry={geo.upper} material={[mats.lacquer, mats.graphite]} castShadow receiveShadow />
        </group>

        {/* The seam inlay sits in the lower cut face: the line the signal finds first. */}
        <mesh
          ref={inlayRef}
          geometry={geo.inlay}
          material={mats.inlay}
          position={[
            SEAM_MID.x - N.x * (BEVEL + HAIRLINE - 0.006),
            SEAM_MID.y - N.y * (BEVEL + HAIRLINE - 0.006),
            0,
          ]}
          rotation={[0, 0, Math.atan2(U.y, U.x)]}
        />

        <Helix lite={lite} occluders={[lowerRef, upperRef]} />

        {[0, 1, 2].map((k) => (
          <pointLight key={k} ref={(l) => void (interiorLights.current[k] = l)} color={k === 1 ? JADE : OCEAN} intensity={0} distance={3.2} decay={1.8} />
        ))}
      </group>
    </group>
  );
}
