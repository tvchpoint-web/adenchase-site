/**
 * The Growth Genome motion study — C1 at rest animating into C2.
 *
 * Plain three.js (no React in the frame loop). One six-second timeline drives every
 * element from the closed monolith to the fully revealed, activated Business DNA.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export const SEQUENCE = 6;

const C = {
  navy: new THREE.Color("#00103D"),
  ocean: new THREE.Color("#00D3FB"),
  jade: new THREE.Color("#83FD80"),
};

/* ------------------------------------------------------------------ math */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = THREE.MathUtils.lerp;

/* -------------------------------------------------------------- textures */
function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, color = false) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

function fluting(spacing = 0.06) {
  const t = canvasTexture(256, 4, (ctx) => {
    const img = ctx.createImageData(256, 4);
    for (let x = 0; x < 256; x++) {
      const u = x / 256;
      const slope = u > 0.62 ? Math.cos(((u - 0.62) / 0.38) * Math.PI) * 0.85 : 0;
      const nz = Math.sqrt(1 - slope * slope);
      for (let y = 0; y < 4; y++) {
        const i = (y * 256 + x) * 4;
        img.data[i] = (-slope * 0.5 + 0.5) * 255;
        img.data[i + 1] = 128;
        img.data[i + 2] = nz * 255;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
  t.repeat.set(1 / spacing, 1);
  return t;
}

function wear(seed: number, repeat: number) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const t = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "rgb(0,62,0)";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) {
      const x = r() * 512, y = r() * 512, rad = 40 + r() * 140;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(0,${50 + r() * 40},0,0.35)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(0,${50 + r() * 40},0,0.05)`;
      ctx.fillRect(r() * 512, 0, 1, 512);
    }
  });
  t.repeat.set(repeat, repeat);
  return t;
}

function radial(stops: [number, string][]) {
  return canvasTexture(
    256,
    256,
    (ctx) => {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    },
    true,
  );
}

function vertical(stops: [number, string][]) {
  return canvasTexture(
    4,
    512,
    (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 512);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 4, 512);
    },
    true,
  );
}

/* ------------------------------------------------------------- materials */
function makeMaterials(lite: boolean) {
  const lacquer = () =>
    new THREE.MeshPhysicalMaterial({
      color: "#081129",
      metalness: 0.1,
      roughness: 0.95,
      roughnessMap: wear(11, 0.32),
      normalMap: fluting(),
      normalScale: new THREE.Vector2(0.09, 0.09),
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.55,
    });
  const graphite = () =>
    new THREE.MeshPhysicalMaterial({ color: "#1a2238", metalness: 1, roughness: 0.9, roughnessMap: wear(23, 0.6), anisotropy: lite ? 0 : 0.75, anisotropyRotation: Math.PI / 2 });
  const titanium = (color: string, rough: number) =>
    new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, anisotropy: lite ? 0 : 0.55, clearcoat: 0.35, clearcoatRoughness: 0.18, envMapIntensity: 1.35 });
  const sapphire = (thickness: number, clear = false) =>
    lite
      ? new THREE.MeshPhysicalMaterial({ color: "#3a6fe0", metalness: 0.1, roughness: 0.06, transparent: true, opacity: 0.6, clearcoat: 1, envMapIntensity: 2.2, emissive: new THREE.Color("#0042AC"), emissiveIntensity: 0.3 })
      : new THREE.MeshPhysicalMaterial({
          color: clear ? "#d3e0ff" : "#bcd0ff",
          metalness: 0,
          roughness: clear ? 0.02 : 0.04,
          transmission: 1,
          thickness,
          ior: 1.62,
          attenuationColor: clear ? "#2858cf" : "#1d55e6",
          attenuationDistance: clear ? 1.5 : 0.9,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
          envMapIntensity: 2.3,
        });
  const glow = (color: THREE.Color, k: number) => {
    const m = new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(k), toneMapped: false });
    m.userData.base = color.clone();
    return m;
  };
  return { lacquer, graphite, titanium, sapphire, glow };
}
type Mats = ReturnType<typeof makeMaterials>;

const setGlow = (m: THREE.MeshBasicMaterial, k: number, color?: THREE.Color) => m.color.copy(color ?? (m.userData.base as THREE.Color)).multiplyScalar(k);

/* -------------------------------------------------------------- geometry */
const BEV = 0.035;
const G = { W: 3.0, H: 8.1, D: 1.25, DROP: 1.45, BASE: 0.48, PANEL_T: 0.2, N: { x: 0.98, y0: 0.8, yL: 6.55, yR: 7.2 } };

function extrude(points: [number, number][], holes: [number, number][][] = [], depth = G.D) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  holes.forEach((h) => shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * BEV, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 5, curveSegments: 1 });
  geo.translate(0, 0, -(depth - 2 * BEV) / 2);
  geo.computeVertexNormals();
  return geo;
}

function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, radial = 14) {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), radial), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function taperedTube(curve: THREE.Curve<THREE.Vector3>, segments: number, radial: number, radiusAt: (t: number) => number) {
  const geo = new THREE.TubeGeometry(curve, segments, 1, radial, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const frames = curve.computeFrenetFrames(segments, false);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i <= segments; i++) {
    curve.getPointAt(i / segments, p);
    const r = radiusAt(i / segments);
    for (let j = 0; j <= radial; j++, k++) {
      const v = (j / radial) * Math.PI * 2;
      n.copy(frames.normals[i]).multiplyScalar(-Math.cos(v)).addScaledVector(frames.binormals[i], Math.sin(v));
      pos.setXYZ(k, p.x + n.x * r, p.y + n.y * r, p.z + n.z * r);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

const torus = (r: number, tube: number, mat: THREE.Material, rot: [number, number, number] = [0, 0, 0], pos: [number, number, number] = [0, 0, 0]) => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 24, 128), mat);
  m.rotation.set(...rot);
  m.position.set(...pos);
  return m;
};

/* ---------------------------------------------------------------- scene */
export interface MotionStudy {
  render(t: number, dt: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

export function createMotionStudy(canvas: HTMLCanvasElement, opts: { width: number; height: number; dpr: number; lite: boolean }): MotionStudy {
  const { lite } = opts;
  let { width, height } = opts;
  RectAreaLightUniformsLib.init();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(opts.dpr);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const M: Mats = makeMaterials(lite);

  const scene = new THREE.Scene();
  scene.background = C.navy.clone();
  // #00234B displays as Midnight Navy (#00103D) after ACES tone mapping, so the sky matches the page
  // and the official logo's own navy field dissolves into it.
  const SKY = new THREE.Color("#00234B");
  scene.fog = new THREE.Fog(SKY, 26, 70);

  /* ---- atmosphere and studio environment */
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(90, 48, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: SKY }, horizon: { value: SKY } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ gl_FragColor = vec4(mix(horizon, top, smoothstep(0.0, 0.55, vP.y)), 1.0); }",
      }),
    ),
  );
  const env = new THREE.Scene();
  env.background = new THREE.Color("#00061a");
  const panelLight = (w: number, h: number, color: string, k: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 3.5, 0);
    env.add(m);
  };
  panelLight(3, 12, "#cddcff", 1.8, [-6, 5, 6]);
  panelLight(10, 2, "#2a5cff", 1.0, [0, 10, -4]);
  panelLight(0.5, 10, "#00D3FB", 1.6, [6, 4, -2]);
  panelLight(8, 1.2, "#ffffff", 0.6, [2, 1, 9]);
  panelLight(5, 5, "#0042AC", 0.8, [-8, 3, -3]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.035).texture;

  /* ---- gallery lighting */
  scene.add(new THREE.AmbientLight("#3b5bb0", 0.05));
  const key = new THREE.RectAreaLight("#e3eeff", 5.2, 2.8, 10);
  key.position.set(-5.6, 9.4, 7.2);
  key.lookAt(0, 4, 0);
  const rim = new THREE.RectAreaLight("#00D3FB", 6, 0.45, 9);
  rim.position.set(4.6, 4.6, -3.6);
  rim.lookAt(0, 3.8, 0);
  const back = new THREE.RectAreaLight("#2a5cff", 3.4, 3, 8);
  back.position.set(-4.8, 4.2, -3.8);
  back.lookAt(0, 3.6, 0);
  scene.add(key, rim, back);

  /* ---- floor */
  let mirror: Reflector | null = null;
  if (!lite) {
    mirror = new Reflector(new THREE.PlaneGeometry(400, 400), { textureWidth: Math.round(width * opts.dpr * 0.5), textureHeight: Math.round(height * opts.dpr * 0.5), color: 0x8a8f99 });
    mirror.rotation.x = -Math.PI / 2;
    scene.add(mirror);
  } else {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: "#030a1d", metalness: 0.55, roughness: 0.35 }));
    f.rotation.x = -Math.PI / 2;
    scene.add(f);
  }
  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { col: { value: new THREE.Color("#010a28") }, far: { value: SKY } },
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
      fragmentShader:
        "uniform vec3 col; uniform vec3 far; varying vec3 vW; void main(){ float d = length(vW.xz); float a = mix(0.7, 1.0, smoothstep(1.5, 16.0, d)); gl_FragColor = vec4(mix(col, far, smoothstep(14.0, 60.0, d)), a); }",
    }),
  );
  veil.rotation.x = -Math.PI / 2;
  veil.position.y = 0.002;
  scene.add(veil);
  const flat = (w: number, d: number, tex: THREE.Texture, additive: boolean, y: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    scene.add(m);
    return m;
  };
  flat(14, 14, radial([[0, "rgba(90,120,190,0.30)"], [0.45, "rgba(30,55,130,0.09)"], [1, "rgba(0,0,0,0)"]]), true, 0.004).position.z = 0.6;
  flat(6, 3.6, radial([[0, "rgba(0,0,0,0.92)"], [0.55, "rgba(0,0,0,0.6)"], [1, "rgba(0,0,0,0)"]]), false, 0.006);

  /* ---- the monolith */
  const n = G.N;
  const hw = G.W / 2 - BEV;
  const crown = (x: number) => G.H - BEV - G.DROP * (1 - (x + G.W / 2) / G.W);
  const frame = new THREE.Mesh(
    extrude([[-hw, BEV], [hw, BEV], [hw, crown(hw)], [-hw, crown(-hw)]], [[[-n.x, n.y0], [-n.x, n.yL], [n.x, n.yR], [n.x, n.y0]]]),
    [M.lacquer(), M.graphite()],
  );
  frame.position.y = G.BASE;
  scene.add(frame);

  const backZ = -G.D / 2 + 0.16;
  const wallMat = new THREE.MeshBasicMaterial({ map: vertical([[0, "#020a26"], [0.3, "#082a74"], [0.6, "#07245f"], [1, "#020a22"]]), color: new THREE.Color(0, 0, 0) });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(2 * n.x - 0.02, n.yR - n.y0), wallMat);
  wall.position.set(0, G.BASE + (n.y0 + n.yR) / 2, backZ - 0.01);
  scene.add(wall);
  const ribMat = M.titanium("#141c33", 0.45);
  for (let i = 0; i <= 18; i++) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.018, n.yR - n.y0, 0.07), ribMat);
    r.position.set(-n.x + 0.05 + (i * (2 * n.x - 0.1)) / 18, G.BASE + (n.y0 + n.yR) / 2, backZ + 0.04);
    scene.add(r);
  }
  const wallChannels = [-0.55, 0.55].map((x) => {
    const m = M.glow(C.ocean, 0);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.01, n.yL - n.y0 - 0.4, 0.01), m);
    ch.position.set(x, G.BASE + (n.y0 + n.yL) / 2, backZ + 0.09);
    scene.add(ch);
    return m;
  });

  const railMat = M.titanium("#3a4460", 0.3);
  const grooves = [-1, 1].map((s) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, n.yL - n.y0 + 0.2, 0.09), railMat);
    rail.position.set(s * (n.x - 0.035), G.BASE + (n.y0 + n.yL) / 2 - 0.1, G.D / 2 - 0.12);
    scene.add(rail);
    const m = M.glow(C.ocean, 0);
    const groove = new THREE.Mesh(new THREE.BoxGeometry(0.012, n.yL - n.y0, 0.012), m);
    groove.position.set(s * (n.x - 0.07), G.BASE + (n.y0 + n.yL) / 2, G.D / 2 - 0.1);
    scene.add(groove);
    return m;
  });

  const plinth = new THREE.Mesh(
    new RoundedBoxGeometry(5.4, G.BASE, 3.1, 5, 0.06),
    new THREE.MeshPhysicalMaterial({ color: "#060c1d", metalness: 0.35, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.18 }),
  );
  plinth.position.y = G.BASE / 2;
  scene.add(plinth);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(2 * n.x + 0.2, 0.02, G.PANEL_T + 0.08), new THREE.MeshBasicMaterial({ color: "#000000" }));
  slot.position.set(0, G.BASE + 0.001, G.D / 2 + 0.2);
  scene.add(slot);

  // The front panel: a thick lacquered slab that descends into the plinth.
  const panelH = n.yL - n.y0 + 0.3;
  const panel = new THREE.Group();
  panel.add(new THREE.Mesh(extrude([[-n.x - 0.08, 0], [n.x + 0.08, 0], [n.x + 0.08, panelH], [-n.x - 0.08, panelH]], [], G.PANEL_T), [M.lacquer(), M.graphite()]));
  const seamMat = M.glow(C.jade, 0);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(2 * n.x + 0.06, 0.012, G.PANEL_T - 0.06), seamMat);
  seam.position.y = panelH + 0.004;
  panel.add(seam);
  panel.position.z = G.D / 2 + 0.2;
  const PANEL_CLOSED = G.BASE + n.y0 - 0.15;
  const PANEL_OPEN = G.BASE + 0.62 - panelH;
  scene.add(panel);

  const down = new THREE.RectAreaLight("#e6efff", 0, 1.6, 0.8);
  down.position.set(0, G.BASE + n.yL - 0.05, 0.1);
  down.lookAt(0, 0, 0.1);
  const side = new THREE.RectAreaLight("#00D3FB", 0, 0.25, 5);
  side.position.set(n.x - 0.08, G.BASE + 3.6, 0.3);
  side.lookAt(0, G.BASE + 3.6, 0);
  const sill = new THREE.RectAreaLight("#83FD80", 0, 1.6, 0.3);
  sill.position.set(0, G.BASE + n.y0 + 0.05, 0.35);
  sill.lookAt(0, G.BASE + 4, 0);
  scene.add(down, side, sill);

  /* ---- the Business DNA */
  const dna = new THREE.Group();
  const LEN = 5.3;
  const TURNS = 1.62;
  const PH = 0.8 * Math.PI;
  const helixR = (t: number) => 0.6 + 0.05 * Math.sin(Math.PI * t);
  const pt = (t: number, ph: number) => {
    const a = 2 * Math.PI * TURNS * t + ph;
    return new THREE.Vector3(helixR(t) * Math.cos(a), (t - 0.5) * LEN, helixR(t) * Math.sin(a));
  };
  const curve = (ph: number) => new THREE.CatmullRomCurve3(Array.from({ length: 321 }, (_, i) => pt(i / 320, ph)));
  const prof = (t: number) => 0.05 + 0.068 * Math.sin(Math.PI * t) ** 0.7;
  const segs = lite ? 360 : 700;
  const ti = M.titanium("#7b869c", 0.2);
  const tiDark = M.titanium("#56607a", 0.28);
  const tiLight = M.titanium("#6c7790", 0.24);
  const glass = M.sapphire(0.3);
  dna.add(new THREE.Mesh(taperedTube(curve(0), segs, lite ? 16 : 28, prof), ti)); // Strand I — Business Strategy
  dna.add(new THREE.Mesh(taperedTube(curve(PH), segs, lite ? 16 : 28, prof), M.sapphire(0.45, true))); // Strand II — AI Engineering
  const filament = M.glow(C.ocean, 0);
  dna.add(new THREE.Mesh(taperedTube(curve(PH), segs, 10, (t) => prof(t) * 0.18), filament));
  const spineMat = M.glow(C.ocean, 0);
  dna.add(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, LEN * 0.92, 12), spineMat));
  const pulseMat = M.glow(C.jade, 0);
  const pulse = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.34, 8, 16), pulseMat);
  dna.add(pulse);

  const PAIRS = 26;
  const keys = [0, 1, 2, 3, 4, 5].map((k) => Math.round(((k + 0.5) / 6) * PAIRS - 0.5));
  const nodes: { mat: THREE.MeshBasicMaterial; y: number }[] = [];
  const accents: { mat: THREE.MeshBasicMaterial; y: number }[] = [];
  let gyro: THREE.Group | null = null;
  let dataRing: THREE.Group | null = null;
  const nodeGeo = new THREE.SphereGeometry(0.034, 24, 24);
  for (let i = 0; i < PAIRS; i++) {
    const t = (i + 0.5) / PAIRS;
    const a = pt(t, 0);
    const b = pt(t, PH);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const k = keys.indexOf(i);
    if (k < 0) {
      dna.add(rod(a, mid, 0.022, tiDark, 16), rod(mid, b, 0.022, tiLight, 16));
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#1a2238"), toneMapped: false });
      const node = new THREE.Mesh(nodeGeo, mat);
      node.position.copy(mid);
      dna.add(node);
      nodes.push({ mat, y: mid.y });
      continue;
    }
    dna.add(rod(a, b, 0.032, ti, 20));
    const accent = M.glow(C.jade, 0.25);
    accents.push({ mat: accent, y: mid.y });
    const ins = new THREE.Group();
    const Y: [number, number, number] = [Math.PI / 2, 0, 0];
    if (k === 0) ins.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), glass), torus(0.1, 0.008, ti, Y));
    else if (k === 1) [0.06, 0.085, 0.11].forEach((r, j) => ins.add(torus(r, 0.007, ti, Y, [0, (j - 1) * 0.035, 0])));
    else if (k === 2) {
      // Technology: the intelligence core — a gyroscope on the helix axis.
      gyro = new THREE.Group();
      gyro.add(torus(0.2, 0.009, ti, Y), torus(0.17, 0.008, ti, [0, Math.PI / 2, 0.35]), torus(0.14, 0.007, ti, [0.9, 0.2, 0]));
      ins.add(gyro);
      ins.add(new THREE.Mesh(new THREE.SphereGeometry(0.085, 48, 48), glass));
      const heart = M.glow(C.jade, 0.6);
      accents.push({ mat: heart, y: mid.y });
      ins.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 24), heart));
      dataRing = new THREE.Group();
      const cell = new THREE.BoxGeometry(0.022, 0.006, 0.034);
      for (let j = 0; j < 36; j++) {
        const ang = (j / 36) * Math.PI * 2;
        const m = new THREE.Mesh(cell, j % 6 === 0 ? M.glow(C.ocean, 1.3) : ti);
        m.position.set(Math.cos(ang) * 0.255, 0, Math.sin(ang) * 0.255);
        m.rotation.y = -ang;
        dataRing.add(m);
      }
      dataRing.scale.setScalar(0.001);
      ins.add(dataRing);
    } else if (k === 3) ins.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 40, 40), glass), torus(0.11, 0.007, ti, [Math.PI / 2 + 0.5, 0.3, 0]));
    else if (k === 4) ins.add(torus(0.075, 0.01, ti, [0, 0, 0], [-0.035, 0, 0]), torus(0.075, 0.01, ti, [Math.PI / 2, 0, 0], [0.035, 0, 0]));
    else
      [-2, -1, 0, 1, 2].forEach((j) => {
        const r = 0.095 - Math.abs(j) * 0.012;
        const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.008, 64), j === 0 ? glass : ti);
        d.position.y = j * 0.022;
        ins.add(d);
      });
    [-1, 1].forEach((s) => {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.05, 32), ti);
      collar.position.y = s * (k === 2 ? 0.27 : 0.16);
      ins.add(collar);
      const line = new THREE.Mesh(new THREE.CylinderGeometry(0.0355, 0.0355, 0.006, 32), accent);
      line.position.y = collar.position.y + s * 0.012;
      ins.add(line);
    });
    ins.position.copy(mid);
    ins.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    ins.scale.setScalar(1.3);
    dna.add(ins);
  }
  const centreY = G.BASE + (n.y0 + n.yL) / 2 + 0.1;
  dna.position.set(0, centreY, 0.02);
  scene.add(dna);

  /* ---- camera and post */
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 200);
  const rt = new THREE.WebGLRenderTarget(width * opts.dpr, height * opts.dpr, { type: THREE.HalfFloatType, samples: lite ? 0 : 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(opts.dpr);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.24, 0.45, 1.05);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let idle = 0;
  let gyroSpin = 0;

  /* ================================================================ timeline */
  function pose(t: number, dt: number) {
    idle += dt;

    // 0.0–0.8 s: the closed monolith, gallery light rising.
    key.intensity = 5.2 * lerp(0.35, 1, easeOut(seg(t, 0, 1.0)));
    rim.intensity = 6 * lerp(0.4, 1, easeOut(seg(t, 0, 1.2)));

    // 0.6–1.0 s: the seam ignites; the panel releases with a small mechanical lift.
    setGlow(seamMat, 1.25 * easeOut(seg(t, 0.6, 0.95)));
    const lift = 0.03 * Math.sin(Math.PI * seg(t, 0.8, 1.05));
    // 1.0–2.7 s: the panel descends along the rails into the plinth, settling with weight.
    const travel = ease(seg(t, 1.0, 2.7));
    const settle = t > 2.7 ? 0.012 * Math.exp(-(t - 2.7) * 9) * Math.sin((t - 2.7) * 28) : 0;
    panel.position.y = lerp(PANEL_CLOSED, PANEL_OPEN, travel) + lift + settle;
    const panelTop = panel.position.y + panelH;
    grooves.forEach((g) => setGlow(g, travel > 0 ? 0.55 * clamp01((G.BASE + n.yL - panelTop) / 1.2) : 0));

    // The niche lights as it is revealed.
    const reveal = easeOut(seg(t, 1.3, 2.9));
    down.intensity = 12 * reveal;
    side.intensity = 2.2 * reveal;
    wallMat.color.setScalar(reveal);

    // 2.4–3.6 s: the DNA emerges; the sapphire strand's filament comes up (C1).
    const emerge = easeOut(seg(t, 2.4, 3.6));
    // 2.8–4.8 s: the jade pulse climbs the axis, activating each connection (C1 → C2).
    const climb = seg(t, 2.8, 4.8);
    const pulseY = lerp(-LEN / 2 + 0.2, LEN / 2 - 0.2, ease(climb));
    pulse.position.y = pulseY;
    pulse.visible = t > 2.75 && t < 5.2;
    setGlow(pulseMat, 1.35 * Math.min(seg(t, 2.75, 3.0), 1 - seg(t, 4.8, 5.2)));
    const c2 = easeOut(seg(t, 3.2, 5.6)); // overall progression toward C2
    setGlow(filament, lerp(0, 0.85, emerge) + 0.3 * c2);
    setGlow(spineMat, 0.9 * easeOut(seg(t, 3.0, 4.4)));
    wallChannels.forEach((m) => setGlow(m, 0.75 * c2));
    sill.intensity = lerp(0.7 * emerge, 1.6, c2);

    const passed = (y: number) => (t > 2.8 ? clamp01((pulseY - y) / 0.25 + 1) : 0);
    accents.forEach((a) => {
      const p = passed(a.y);
      const flash = Math.exp(-(((pulseY - a.y) / 0.22) ** 2)) * (t > 2.8 && t < 5.0 ? 1 : 0);
      setGlow(a.mat, lerp(0.25 * emerge, 1.3, p) + 1.1 * flash);
    });
    nodes.forEach((nd) => {
      const p = passed(nd.y);
      nd.mat.color.set("#1a2238").lerp(C.ocean, p).multiplyScalar(lerp(1, 1.1, p));
    });

    // 3.6–5.0 s: the intelligence core begins to turn; its data ring fades in.
    const core = easeOut(seg(t, 3.6, 5.0));
    gyroSpin += dt * 0.7 * core;
    if (gyro) {
      gyro.rotation.y = gyroSpin;
      gyro.children[1].rotation.x = gyroSpin * 0.6;
    }
    if (dataRing) {
      dataRing.scale.setScalar(Math.max(0.001, lerp(0.85, 1, core) * core));
      dataRing.rotation.y = -gyroSpin * 0.35;
    }

    // The helix turns slowly throughout and at rest.
    dna.rotation.y = 0.35 + idle * 0.05;

    // Camera: a slow push and quarter-arc into the final gallery composition.
    const cam = ease(seg(t, 0, SEQUENCE));
    const aspect = width / Math.max(1, height);
    const narrow = aspect < 1.1;
    const lens = narrow ? Math.min(2.4, 1.05 / aspect) : 1;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * lens));
    const az = lerp(0.38, 0.26, cam);
    const el = lerp(0.03, 0.015, cam);
    const dist = lerp(24.5, 21.4, cam) * (narrow ? 1.15 : aspect < 1.45 ? 1.08 : 1);
    const ty = lerp(4.15, 4.35, cam);
    camera.position.set(dist * Math.cos(el) * Math.sin(az), ty + dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(0, ty, 0);
    const ax = narrow ? 0.5 : 0.655;
    const ay = narrow ? 0.28 : 0.5;
    camera.setViewOffset(width, height, (0.5 - ax) * width, (0.5 - ay) * height, width, height);
  }

  return {
    render(t, dt) {
      pose(Math.min(t, SEQUENCE), dt);
      composer.render();
    },
    resize(w, h) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
      camera.aspect = w / h;
    },
    dispose() {
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      mirror?.dispose();
      composer.dispose();
      rt.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
