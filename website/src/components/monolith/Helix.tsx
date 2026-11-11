"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DNA_DISCIPLINES, STRANDS } from "./disciplines";
import { JADE, OCEAN, SEAM_ANGLE, openingCentre } from "./form";
import { monolithState } from "./state";

/* --------------------------------------------------------------- geometry */

/**
 * B-form proportions: pitch ≈ 1.6 × diameter, ~10.5 base pairs per turn, and the second
 * strand offset by 0.8π so the helix shows its characteristic major and minor grooves.
 */
const LENGTH = 2.85;
const RADIUS = 0.36;
const TURNS = 2.6;
const PHASE_B = 0.8 * Math.PI;
const BASE_PAIRS = 28;
const STRAND_RADIUS = 0.036;
const KEY_T = DNA_DISCIPLINES.map((_, k) => (k + 0.5) / DNA_DISCIPLINES.length);

function strandPoint(t: number, phase: number, out = new THREE.Vector3()) {
  const a = 2 * Math.PI * TURNS * t + phase;
  return out.set((t - 0.5) * LENGTH, RADIUS * Math.cos(a), RADIUS * Math.sin(a));
}

function strandCurve(phase: number) {
  return new THREE.CatmullRomCurve3(Array.from({ length: 241 }, (_, i) => strandPoint(i / 240, phase)));
}

/** Additive pulse that travels along a strand; transparent everywhere else. */
const pulseVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const pulseFragment = /* glsl */ `
  uniform vec3 uJade;
  uniform float uHead;
  uniform float uHover;
  uniform float uVisible;
  varying vec2 vUv;
  void main() {
    float u = vUv.x;
    float d = u - uHead;
    float head = exp(-d * d / 0.0005);
    float tail = d < 0.0 ? exp(d * 14.0) * 0.45 : 0.0;
    float g = (uHead > -0.5 ? head * 1.6 + tail : 0.0) + uHover * 0.28;
    if (g < 0.003) discard;
    gl_FragColor = vec4(uJade * g * uVisible, 1.0);
  }
`;

/* ------------------------------------------------------- discipline forms */

/**
 * Six precision-engineered elements, one per discipline, mounted at the centre of a key
 * base pair. Local +Y runs along the connection. Abstract by design — no icons.
 */
function DisciplineForm({ index, metal, glass, glow }: { index: number; metal: THREE.Material; glass: THREE.Material; glow: THREE.Material }) {
  const axisY: [number, number, number] = [Math.PI / 2, 0, 0]; // torus axis → local Y
  switch (index) {
    case 0: // Capital: a faceted sapphire gem held in a titanium ring.
      return (
        <group>
          <mesh material={glass}>
            <octahedronGeometry args={[0.075, 0]} />
          </mesh>
          <mesh material={metal} rotation={axisY}>
            <torusGeometry args={[0.1, 0.006, 10, 48]} />
          </mesh>
        </group>
      );
    case 1: // Revenue & market growth: three expanding coaxial rings.
      return (
        <group>
          {[0.05, 0.075, 0.1].map((r, i) => (
            <mesh key={r} material={metal} rotation={axisY} position={[0, (i - 1) * 0.032, 0]}>
              <torusGeometry args={[r, 0.0055, 10, 48]} />
            </mesh>
          ))}
        </group>
      );
    case 2: // Technology & automation: a gyroscope around a luminous core.
      return (
        <group>
          <mesh material={metal} rotation={axisY}>
            <torusGeometry args={[0.088, 0.006, 10, 48]} />
          </mesh>
          <mesh material={metal} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.072, 0.006, 10, 48]} />
          </mesh>
          <mesh material={glow}>
            <sphereGeometry args={[0.026, 20, 20]} />
          </mesh>
        </group>
      );
    case 3: // Customer: a core held within its orbit.
      return (
        <group>
          <mesh material={glass}>
            <sphereGeometry args={[0.048, 28, 28]} />
          </mesh>
          <mesh material={metal} rotation={[Math.PI / 2 + 0.45, 0.3, 0]}>
            <torusGeometry args={[0.1, 0.005, 10, 56]} />
          </mesh>
        </group>
      );
    case 4: // Partnerships: two interlocking rings.
      return (
        <group>
          <mesh material={metal} position={[-0.03, 0, 0]}>
            <torusGeometry args={[0.062, 0.008, 12, 48]} />
          </mesh>
          <mesh material={metal} position={[0.03, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.062, 0.008, 12, 48]} />
          </mesh>
        </group>
      );
    default: // Performance & optimization: a precision disc stack on an axle.
      return (
        <group>
          <mesh material={metal}>
            <cylinderGeometry args={[0.012, 0.012, 0.11, 16]} />
          </mesh>
          {[-2, -1, 0, 1, 2].map((i) => (
            <mesh key={i} material={i === 0 ? glass : metal} position={[0, i * 0.017, 0]}>
              <cylinderGeometry args={[0.066 - Math.abs(i) * 0.008, 0.066 - Math.abs(i) * 0.008, 0.006, 40]} />
            </mesh>
          ))}
        </group>
      );
  }
}

/* ------------------------------------------------------------------ helix */

/** Applies a discipline's activation to its materials (kept outside React's render scope). */
function applyActivation(metal: THREE.MeshPhysicalMaterial, glow: THREE.MeshBasicMaterial, level: number) {
  metal.emissiveIntensity = level * 1.1;
  glow.color.copy(OCEAN).lerp(JADE, level).multiplyScalar(1.1 + level * 1.6);
}

const touchOnly = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export function Helix({ lite, occluders }: { lite: boolean; occluders: React.RefObject<THREE.Object3D | null>[] }) {
  const { camera, size } = useThree();

  const geo = useMemo(() => {
    const curveA = strandCurve(0);
    const curveB = strandCurve(PHASE_B);
    const seg = lite ? 220 : 360;
    const strandA = new THREE.TubeGeometry(curveA, seg, STRAND_RADIUS, lite ? 10 : 14, false);
    const strandB = new THREE.TubeGeometry(curveB, seg, STRAND_RADIUS, lite ? 10 : 14, false);
    const filament = new THREE.TubeGeometry(curveB, seg, 0.009, 6, false);
    const pulseA = new THREE.TubeGeometry(curveA, seg, STRAND_RADIUS + 0.006, 8, false);
    const pulseB = new THREE.TubeGeometry(curveB, seg, STRAND_RADIUS + 0.006, 8, false);
    const rod = new THREE.CylinderGeometry(1, 1, 1, 10);
    return { strandA, strandB, filament, pulseA, pulseB, rod };
  }, [lite]);

  const mats = useMemo(() => {
    const titanium = new THREE.MeshPhysicalMaterial({
      color: "#4a5268",
      metalness: 1,
      roughness: 0.3,
      anisotropy: lite ? 0 : 0.6,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.3,
    });
    const sapphire = lite
      ? new THREE.MeshPhysicalMaterial({ color: "#2f63d8", metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.62, clearcoat: 1, envMapIntensity: 2, emissive: new THREE.Color("#0042AC"), emissiveIntensity: 0.35 })
      : new THREE.MeshPhysicalMaterial({
          color: "#b9cdff",
          metalness: 0,
          roughness: 0.05,
          transmission: 1,
          thickness: 0.12,
          ior: 1.62,
          attenuationColor: "#1d55e6",
          attenuationDistance: 0.25,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          envMapIntensity: 2.2,
        });
    const filament = new THREE.MeshBasicMaterial({ color: OCEAN.clone().multiplyScalar(1.3), toneMapped: false });
    const rung = new THREE.MeshPhysicalMaterial({ color: "#59627a", metalness: 1, roughness: 0.34, envMapIntensity: 1.2 });
    // Each discipline gets its own titanium so it can be activated independently.
    const keyMetal = DNA_DISCIPLINES.map(
      () => new THREE.MeshPhysicalMaterial({ color: "#6b7590", metalness: 1, roughness: 0.22, clearcoat: 0.6, envMapIntensity: 1.5, emissive: JADE.clone(), emissiveIntensity: 0 }),
    );
    const keyGlow = DNA_DISCIPLINES.map(() => new THREE.MeshBasicMaterial({ color: OCEAN.clone().multiplyScalar(1.2), toneMapped: false }));
    const pulse = () =>
      new THREE.ShaderMaterial({
        vertexShader: pulseVertex,
        fragmentShader: pulseFragment,
        uniforms: { uJade: { value: JADE }, uHead: { value: -1 }, uHover: { value: 0 }, uVisible: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
    const hit = new THREE.MeshBasicMaterial({ visible: false });
    return { titanium, sapphire, filament, rung, keyMetal, keyGlow, pulseA: pulse(), pulseB: pulse(), hit };
  }, [lite]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      [mats.titanium, mats.sapphire, mats.filament, mats.rung, mats.pulseA, mats.pulseB, mats.hit, ...mats.keyMetal, ...mats.keyGlow].forEach((m) => m.dispose());
    },
    [geo, mats],
  );

  /* ---- base pairs: plain connections, and the six key disciplines */
  const pairs = useMemo(() => {
    const keyIdx = KEY_T.map((kt) => Math.round(kt * BASE_PAIRS - 0.5));
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    return Array.from({ length: BASE_PAIRS }, (_, i) => {
      const t = (i + 0.5) / BASE_PAIRS;
      strandPoint(t, 0, a);
      strandPoint(t, PHASE_B, b);
      const dir = b.clone().sub(a);
      const len = dir.length();
      dir.normalize();
      return {
        t,
        key: keyIdx.indexOf(i),
        mid: a.clone().add(b).multiplyScalar(0.5),
        quat: new THREE.Quaternion().setFromUnitVectors(up, dir),
        len: len - STRAND_RADIUS * 1.2,
      };
    });
  }, []);

  const plain = useMemo(() => pairs.filter((p) => p.key < 0), [pairs]);
  const keys = useMemo(() => pairs.filter((p) => p.key >= 0).sort((x, y) => x.key - y.key), [pairs]);

  /* ---- refs */
  const placement = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const rungs = useRef<THREE.InstancedMesh>(null);
  const strandARef = useRef<THREE.Mesh>(null);
  const strandBRef = useRef<THREE.Mesh>(null);
  const pulseARef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const pulseBRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const hitRefs = useRef<(THREE.Mesh | null)[]>([]);
  const keyGroups = useRef<(THREE.Group | null)[]>([]);
  const label = useRef<{ el: HTMLElement | null; title: HTMLElement | null; line: HTMLElement | null; index: HTMLElement | null; shown: string }>({
    el: null,
    title: null,
    line: null,
    index: null,
    shown: "",
  });

  useEffect(() => {
    const el = document.getElementById("dna-label");
    label.current = {
      el,
      title: el?.querySelector("[data-title]") ?? null,
      line: el?.querySelector("[data-line]") ?? null,
      index: el?.querySelector("[data-index]") ?? null,
      shown: "",
    };
    return () => {
      if (el) el.style.opacity = "0";
    };
  }, []);

  // Plain connections are static within the spinning helix: set once.
  useEffect(() => {
    const m = new THREE.Matrix4();
    const s = new THREE.Vector3();
    plain.forEach((p, i) => {
      s.set(0.011, p.len, 0.011);
      m.compose(p.mid, p.quat, s);
      rungs.current?.setMatrixAt(i, m);
    });
    if (rungs.current) rungs.current.instanceMatrix.needsUpdate = true;
  }, [plain]);

  const sim = useRef({ t: 0, spin: 0, pulseStart: 0, level: new Float32Array(6), hover: -1, hoverStrand: -1, sticky: 0, autoKey: -1, autoUntil: 0 });
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), c: new THREE.Vector2(), ray: new THREE.Raycaster(), ndc: new THREE.Vector2() }), []);

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.1);
    const reduced = monolithState.reducedMotion;
    s.t += dt;
    const o = monolithState.open;
    const visible = THREE.MathUtils.smoothstep(o, 0.04, 0.3);

    /* ---- placement: centred in the opening, axis along the seam */
    if (placement.current) {
      openingCentre(o, tmp.c);
      placement.current.position.set(tmp.c.x, tmp.c.y, 0);
      placement.current.rotation.set(0, 0, SEAM_ANGLE);
      placement.current.visible = o > 0.02;
    }
    // Subtle, continuous rotation about the helix axis.
    if (!reduced) s.spin += dt * 0.16;
    if (spin.current) spin.current.rotation.x = reduced ? 0.6 : s.spin;

    /* ---- the Jade Signal travels the helix, activating disciplines 1 → 6 in sequence */
    let pulse = -1;
    if (!reduced && o > 0.12) {
      if (s.pulseStart === 0) s.pulseStart = s.t + 0.6;
      const phase = (s.t - s.pulseStart) % 7.5;
      if (s.t > s.pulseStart && phase < 4.2) pulse = -0.06 + (phase / 4.2) * 1.12;
    }
    monolithState.pulse = pulse;

    /* ---- pointer: hover a connection or a strand */
    const p = monolithState.pointer;
    let hover = -1;
    let hoverStrand = -1;
    let hoverPoint: THREE.Vector3 | null = null;
    if (p.active && !reduced && o > 0.28) {
      tmp.ndc.set(p.x, p.y);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      const targets: THREE.Object3D[] = [];
      occluders.forEach((r) => r.current && targets.push(r.current));
      hitRefs.current.forEach((h) => h && targets.push(h));
      if (strandARef.current) targets.push(strandARef.current);
      if (strandBRef.current) targets.push(strandBRef.current);
      const hits = tmp.ray.intersectObjects(targets, false);
      if (hits.length) {
        const first = hits[0].object;
        const k = hitRefs.current.indexOf(first as THREE.Mesh);
        if (k >= 0) hover = k;
        else if (first === strandARef.current) hoverStrand = 0;
        else if (first === strandBRef.current) hoverStrand = 1;
        if (hover >= 0 || hoverStrand >= 0) hoverPoint = hits[0].point.clone();
      }
    }
    // On touch, a tap keeps its label briefly after the finger lifts.
    if (hover >= 0 || hoverStrand >= 0) {
      s.hover = hover;
      s.hoverStrand = hoverStrand;
      s.sticky = s.t + (touchOnly() ? 2.5 : 0.2);
    } else if (s.t > s.sticky) {
      s.hover = -1;
      s.hoverStrand = -1;
    }

    /* ---- discipline activation levels */
    keys.forEach((k, i) => {
      const passing = pulse > -0.5 ? Math.exp(-(((k.t - pulse) / 0.05) ** 2)) : 0;
      if (passing > 0.6) {
        s.autoKey = i;
        s.autoUntil = s.t + 1.6;
      }
      const target = Math.max(s.hover === i ? 1 : 0, passing, reduced ? 0.35 : 0);
      s.level[i] = THREE.MathUtils.lerp(s.level[i], target, 1 - Math.exp(-(target > s.level[i] ? 10 : 2.2) * dt));
      applyActivation(mats.keyMetal[i], mats.keyGlow[i], s.level[i]);
      const g = keyGroups.current[i];
      if (g) g.scale.setScalar(1.45 * (1 + s.level[i] * 0.12));
    });

    /* ---- strands */
    [pulseARef.current, pulseBRef.current].forEach((m, i) => {
      if (!m) return;
      m.material.uniforms.uHead.value = pulse;
      m.material.uniforms.uVisible.value = visible;
      m.material.uniforms.uHover.value = THREE.MathUtils.lerp(m.material.uniforms.uHover.value, s.hoverStrand === i ? 1 : 0, 1 - Math.exp(-8 * dt));
    });

    /* ---- label: hover first; otherwise, once revealed, the signal's current discipline */
    const L = label.current;
    if (L.el) {
      let key = "";
      let idx = "";
      let title = "";
      let line = "";
      let anchor: THREE.Vector3 | null = null;
      if (s.hover >= 0) {
        key = `d${s.hover}`;
        idx = `0${s.hover + 1}`;
        title = DNA_DISCIPLINES[s.hover].title;
        line = DNA_DISCIPLINES[s.hover].line;
        anchor = keyGroups.current[s.hover]?.getWorldPosition(tmp.v) ?? null;
      } else if (s.hoverStrand >= 0) {
        key = `s${s.hoverStrand}`;
        idx = s.hoverStrand === 0 ? "Strand I" : "Strand II";
        title = STRANDS[s.hoverStrand].title;
        line = STRANDS[s.hoverStrand].line;
        anchor = hoverPoint ? tmp.v.copy(hoverPoint) : null;
      } else if (o > 0.55 && s.autoKey >= 0 && s.t < s.autoUntil) {
        key = `d${s.autoKey}`;
        idx = `0${s.autoKey + 1}`;
        title = DNA_DISCIPLINES[s.autoKey].title;
        line = DNA_DISCIPLINES[s.autoKey].line;
        anchor = keyGroups.current[s.autoKey]?.getWorldPosition(tmp.v) ?? null;
      }
      if (anchor && key) {
        if (L.shown !== key) {
          if (L.index) L.index.textContent = idx;
          if (L.title) L.title.textContent = title;
          if (L.line) L.line.textContent = line;
          L.shown = key;
        }
        if (size.width < 768) {
          // Phones: a steady caption at the foot of the screen, never over the copy.
          L.el.style.transform = `translate(16px, ${Math.round(size.height - (L.el.offsetHeight || 96) - 20)}px)`;
        } else {
          anchor.project(camera);
          const x = ((anchor.x + 1) / 2) * size.width;
          const y = ((1 - anchor.y) / 2) * size.height;
          const flip = x > size.width * 0.72;
          L.el.style.transform = `translate(${Math.round(x + (flip ? -24 : 24))}px, ${Math.round(y - 18)}px) translateX(${flip ? "-100%" : "0"})`;
        }
        L.el.style.opacity = "1";
      } else {
        L.el.style.opacity = "0";
        L.shown = "";
      }
    }
  });

  return (
    <group ref={placement}>
      <group ref={spin}>
        {/* Strand I — Business Strategy: dark brushed titanium. */}
        <mesh ref={strandARef} geometry={geo.strandA} material={mats.titanium} />
        {/* Strand II — AI Engineering: sapphire glass with an Ocean Blue filament. */}
        <mesh ref={strandBRef} geometry={geo.strandB} material={mats.sapphire} />
        <mesh geometry={geo.filament} material={mats.filament} />
        <mesh ref={pulseARef} geometry={geo.pulseA} material={mats.pulseA} renderOrder={3} />
        <mesh ref={pulseBRef} geometry={geo.pulseB} material={mats.pulseB} renderOrder={3} />

        <instancedMesh ref={rungs} args={[geo.rod, mats.rung, plain.length]} frustumCulled={false} />

        {keys.map((k, i) => (
          <group key={i} position={k.mid} quaternion={k.quat}>
            <mesh geometry={geo.rod} material={mats.keyMetal[i]} scale={[0.017, k.len, 0.017]} />
            <group ref={(g) => void (keyGroups.current[i] = g)} scale={1.45}>
              <DisciplineForm index={i} metal={mats.keyMetal[i]} glass={mats.sapphire} glow={mats.keyGlow[i]} />
            </group>
            {/* Invisible hover target, generous enough for a fingertip. */}
            <mesh ref={(m) => void (hitRefs.current[i] = m)} material={mats.hit}>
              <sphereGeometry args={[0.17, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
