/**
 * The Nexus — architectural layout.
 *
 * One persistent structure that every scene of the homepage re-configures.
 * Everything here is plain data: node junctions, glass modules, the pathways
 * between them, the Jade Signal routes and the per-scene configurations.
 * The engine interpolates between scene configurations from scroll progress,
 * so every transition is reversible by construction.
 *
 * Regions map to the ADEN-CHASE disciplines:
 *   0 Strategy (left, stacked planning planes)
 *   1 AI Engineering (centre, the engine core)
 *   2 Market Growth (right, ascending steps)
 *   3 Expansion (outer network, emerges in Scene 04)
 *   4 Lead (the final pathway toward the call to action, Scene 05)
 */

export type Vec3 = [number, number, number];

export const REGION = {
  strategy: 0,
  engineering: 1,
  growth: 2,
  expansion: 3,
  lead: 4,
} as const;
export type RegionId = (typeof REGION)[keyof typeof REGION];
export const REGION_COUNT = 5;

export interface NodeDef {
  id: string;
  pos: Vec3;
  region: RegionId;
  /** Vertical stratum (0 bottom, 1 middle, 2 top) — separates in Scene 02. */
  layer: 0 | 1 | 2;
  /** Story position (0–4) at which the node has fully materialised. */
  appear: number;
}

export type ModuleKind = "column" | "panel" | "block" | "step";

export interface ModuleDef {
  id: string;
  kind: ModuleKind;
  center: Vec3;
  size: Vec3;
  rotY: number;
  region: RegionId;
  layer: 0 | 1 | 2;
  appear: number;
  /** Omitted on lightweight (mobile / low-power) configurations. */
  detail?: boolean;
}

export type LinkKind = "structural" | "bridge" | "dormant";

export interface LinkDef {
  a: string;
  b: string;
  kind: LinkKind;
  appear: number;
}

export interface PathDef {
  id: string;
  nodes: string[];
  /** Secondary signals that split off when the main signal reaches `from`. */
  branches?: { from: string; nodes: string[] }[];
}

/* ------------------------------------------------------------------ nodes */

const nodes: NodeDef[] = [];
const addNode = (id: string, pos: Vec3, region: RegionId, layer: 0 | 1 | 2, appear = 0) =>
  nodes.push({ id, pos, region, layer, appear });

// AI Engineering core: a square frame rotated 45°, three levels, a glass core chamber.
const AI_LEVELS = [-1.3, 0, 1.3];
const AI_CORNERS: [number, number][] = [
  [0.707, 0],
  [0, 0.707],
  [-0.707, 0],
  [0, -0.707],
];
AI_LEVELS.forEach((y, level) => {
  AI_CORNERS.forEach(([x, z], c) => addNode(`a${level}c${c}`, [x, y, z], REGION.engineering, level as 0 | 1 | 2));
});
addNode("core", [0, 0, 0], REGION.engineering, 1);

// Strategy: stacked planning planes stepping toward the core.
addNode("s-origin", [-3.1, -1.3, 0.3], REGION.strategy, 0);
addNode("s0l", [-2.75, -0.75, -0.08], REGION.strategy, 0);
addNode("s0r", [-1.25, -0.75, -0.08], REGION.strategy, 0);
addNode("s1l", [-2.6, 0.05, 0.02], REGION.strategy, 1);
addNode("s1r", [-1.1, 0.05, 0.02], REGION.strategy, 1);
addNode("s2l", [-2.45, 0.85, 0.12], REGION.strategy, 2, 1);
addNode("s2r", [-0.95, 0.85, 0.12], REGION.strategy, 2, 1);

// Market Growth: ascending steps toward a beacon.
for (let k = 0; k < 4; k++) {
  addNode(`g${k}`, [1.35 + 0.5 * k, -1.25 + 0.55 * k + 0.06, 0.45 - 0.05 * k], REGION.growth, k < 2 ? 0 : k < 3 ? 1 : 2);
}
addNode("gtop", [3.25, 1.15, 0.25], REGION.growth, 2);

// Expansion: the wider network that forms in Scene 04.
const EXPANSION: Vec3[] = [
  [-4.2, -1.0, 1.2],
  [-3.6, 1.4, -1.6],
  [-0.6, 2.4, -1.8],
  [1.6, 2.3, -1.2],
  [4.3, 1.8, -0.6],
  [4.5, -0.6, 1.4],
  [2.0, -2.2, 1.9],
  [-1.2, -2.3, 1.6],
];
EXPANSION.forEach((p, i) => addNode(`e${i}`, p, REGION.expansion, p[1] < -0.5 ? 0 : p[1] < 1.5 ? 1 : 2, 3));

// Lead: the final pathway that reaches toward the call to action.
addNode("l0", [-3.0, -1.9, 1.6], REGION.lead, 0, 4);
addNode("l1", [-4.6, -2.0, 2.4], REGION.lead, 0, 4);
addNode("l2", [-6.4, -2.0, 3.0], REGION.lead, 0, 4);

/* ---------------------------------------------------------------- modules */

const modules: ModuleDef[] = [];
const addModule = (m: ModuleDef) => modules.push(m);
const QUARTER = Math.PI / 4;

AI_CORNERS.forEach(([x, z], c) =>
  addModule({ id: `ai-col-${c}`, kind: "column", center: [x, 0, z], size: [0.07, 3.1, 0.07], rotY: QUARTER, region: REGION.engineering, layer: 1, appear: 0 }),
);
addModule({ id: "ai-floor-0", kind: "panel", center: [0, -1.3, 0], size: [1.0, 0.035, 1.0], rotY: QUARTER, region: REGION.engineering, layer: 0, appear: 0 });
addModule({ id: "ai-floor-2", kind: "panel", center: [0, 1.3, 0], size: [1.0, 0.035, 1.0], rotY: QUARTER, region: REGION.engineering, layer: 2, appear: 0 });
addModule({ id: "ai-core", kind: "block", center: [0, 0, 0], size: [0.52, 0.52, 0.52], rotY: QUARTER, region: REGION.engineering, layer: 1, appear: 0 });

addModule({ id: "st-plane-0", kind: "panel", center: [-2.0, -0.77, -0.55], size: [1.5, 0.035, 0.95], rotY: 0, region: REGION.strategy, layer: 0, appear: 0 });
addModule({ id: "st-plane-1", kind: "panel", center: [-1.85, 0.03, -0.45], size: [1.5, 0.035, 0.95], rotY: 0, region: REGION.strategy, layer: 1, appear: 0 });
addModule({ id: "st-plane-2", kind: "panel", center: [-1.7, 0.83, -0.35], size: [1.5, 0.035, 0.95], rotY: 0, region: REGION.strategy, layer: 2, appear: 1 });
addModule({ id: "st-column", kind: "column", center: [-2.2, -0.15, -0.95], size: [0.06, 2.3, 0.06], rotY: 0, region: REGION.strategy, layer: 1, appear: 1, detail: true });

for (let k = 0; k < 4; k++) {
  addModule({
    id: `gr-step-${k}`,
    kind: "step",
    center: [1.35 + 0.5 * k, -1.25 + 0.55 * k, 0.45 - 0.05 * k],
    size: [0.48, 0.09, 0.62],
    rotY: -0.1,
    region: REGION.growth,
    layer: k < 2 ? 0 : k < 3 ? 1 : 2,
    appear: 0,
  });
}
addModule({ id: "gr-column", kind: "column", center: [2.85, -0.85, 0.28], size: [0.05, 2.5, 0.05], rotY: 0, region: REGION.growth, layer: 1, appear: 1, detail: true });

([
  [1, [-3.6, 1.15, -1.6], [0.8, 0.03, 0.5]],
  [3, [1.6, 2.05, -1.2], [0.7, 0.03, 0.55]],
  [5, [4.5, -0.85, 1.4], [0.6, 0.03, 0.7]],
  [7, [-1.2, -2.55, 1.6], [0.9, 0.03, 0.5]],
] as [number, Vec3, Vec3][]).forEach(([i, center, size], n) =>
  addModule({ id: `ex-plane-${i}`, kind: "panel", center, size, rotY: 0.2 * (n - 1.5), region: REGION.expansion, layer: center[1] < -0.5 ? 0 : 2, appear: 3, detail: n % 2 === 1 }),
);

/* ------------------------------------------------------------------ links */

const links: LinkDef[] = [];
const link = (a: string, b: string, kind: LinkKind = "structural", appear = 0) => links.push({ a, b, kind, appear });

// AI rings on each level, spokes from the core.
for (let level = 0; level < 3; level++) {
  for (let c = 0; c < 4; c++) link(`a${level}c${c}`, `a${level}c${(c + 1) % 4}`, "structural", level === 1 ? 0 : 0);
}
for (let c = 0; c < 4; c++) link("core", `a1c${c}`);
// Column-aligned verticals (dormant: revealed during Discovery).
for (let level = 0; level < 2; level++) for (let c = 0; c < 4; c++) link(`a${level}c${c}`, `a${level + 1}c${c}`, "dormant", 1);

// Strategy planes.
link("s-origin", "s0l");
link("s0l", "s0r");
link("s1l", "s1r");
link("s2l", "s2r", "structural", 1);
link("s0r", "s1r");
link("s1r", "s2r", "structural", 1);
link("s0l", "s1l", "dormant", 1);
link("s1l", "s2l", "dormant", 1);
// Bridges into the core.
link("s0r", "a0c2", "bridge");
link("s1r", "a1c2", "bridge");
link("s2r", "a2c2", "bridge", 1);

// Growth steps.
link("g0", "g1");
link("g1", "g2");
link("g2", "g3");
link("g3", "gtop");
link("a0c0", "g0", "bridge");
link("a1c0", "g2", "bridge");
link("a2c0", "g3", "bridge", 1);

// Dormant cross-connections — the insights that only appear on closer inspection.
link("s0r", "g0", "dormant", 1);
link("s2r", "g3", "dormant", 1);
link("core", "a0c1", "dormant", 1);
link("core", "a2c3", "dormant", 1);
link("s1l", "s-origin", "dormant", 1);
link("g1", "a0c1", "dormant", 1);

// Expansion spokes and ring.
const SPOKES: [string, string][] = [
  ["e0", "s-origin"],
  ["e1", "s2l"],
  ["e2", "a2c3"],
  ["e3", "a2c0"],
  ["e4", "gtop"],
  ["e5", "g3"],
  ["e6", "g0"],
  ["e7", "a0c1"],
];
SPOKES.forEach(([a, b]) => link(a, b, "structural", 3));
for (let i = 0; i < 8; i++) {
  const structural = i === 3 || i === 6 || i === 0;
  link(`e${i}`, `e${(i + 1) % 8}`, structural ? "structural" : "dormant", 3);
}

// Lead pathway.
link("s-origin", "l0", "structural", 4);
link("l0", "l1", "structural", 4);
link("l1", "l2", "structural", 4);

/* ------------------------------------------------------------------ paths */

export const PATHS: Record<string, PathDef> = {
  // Discover → Connect → Engineer → Expand → Grow, literally.
  hero: { id: "hero", nodes: ["s-origin", "s0l", "s0r", "s1r", "a1c2", "core", "a1c0", "g2", "g3", "gtop"] },
  market: { id: "market", nodes: ["s-origin", "s0l", "s0r", "g0", "g1", "g2", "g3", "gtop"] },
  experience: { id: "experience", nodes: ["gtop", "g3", "a2c0", "a2c1", "a2c2", "s2r", "s2l"] },
  operations: { id: "operations", nodes: ["core", "a1c1", "a1c2", "a1c3", "a1c0", "core"] },
  engineerForward: { id: "engineerForward", nodes: ["s2l", "s2r", "a2c2", "a2c3", "a2c0", "g3", "gtop"] },
  engineerReturn: { id: "engineerReturn", nodes: ["g0", "a0c0", "a0c3", "a0c2", "s0r", "s0l"] },
  growOuter: {
    id: "growOuter",
    nodes: ["core", "a1c3", "a2c3", "e2", "e3", "e4", "gtop"],
    branches: [{ from: "e3", nodes: ["e3", "a2c0", "g3"] }],
  },
  growLower: {
    id: "growLower",
    nodes: ["s-origin", "s0l", "s0r", "a0c2", "a0c1", "e7", "e6", "g0", "g1", "g2"],
    branches: [{ from: "e7", nodes: ["e7", "e0", "s-origin"] }],
  },
  growHero: {
    id: "growHero",
    nodes: ["s-origin", "s0l", "s0r", "s1r", "a1c2", "core", "a1c0", "g2", "g3", "gtop", "e4", "e5"],
    branches: [{ from: "gtop", nodes: ["gtop", "e4", "e3"] }],
  },
  final: { id: "final", nodes: ["core", "a1c2", "s1r", "s0r", "s0l", "s-origin", "l0", "l1", "l2"] },
};

/** Signal routes in rotation for each scene. */
export const SCENE_PATHS: string[][] = [
  ["hero"],
  ["market", "experience", "operations"],
  ["engineerForward", "engineerReturn", "operations"],
  ["growHero", "growOuter", "growLower"],
  ["final"],
];

/** Scene 02 discovery categories → the pathway each one reveals. */
export const DISCOVERY_PATHS = ["market", "experience", "operations"] as const;

/* ----------------------------------------------------------------- scenes */

export interface RegionPose {
  offset: Vec3;
  scale: number;
}

export interface SceneConfig {
  name: string;
  /** Whole-structure yaw (radians). */
  yaw: number;
  /** Per-region pose, indexed by RegionId. */
  regions: RegionPose[];
  /** Vertical / depth separation between strata (Scene 02's layered view). */
  strata: number;
  camera: { pos: Vec3; target: Vec3; fov: number };
  /** Horizontal composition: where the structure's origin sits, as a fraction of viewport width. */
  anchorX: number;
}

const still = (scale = 1): RegionPose => ({ offset: [0, 0, 0], scale });

export const SCENES: SceneConfig[] = [
  {
    name: "Arrival",
    yaw: -0.38,
    regions: [still(), still(), still(), still(), still()],
    strata: 0,
    camera: { pos: [0, 1.0, 11.4], target: [0, 0, 0], fov: 34 },
    anchorX: 0.665,
  },
  {
    name: "Discovery",
    yaw: -0.22,
    regions: [still(), still(), still(), still(), still()],
    strata: 0.5,
    camera: { pos: [0.5, 0.55, 8.1], target: [-0.15, 0.05, 0], fov: 36 },
    anchorX: 0.685,
  },
  {
    name: "Engineering",
    yaw: 0,
    regions: [
      { offset: [-0.72, 0.15, 0.3], scale: 1 },
      { offset: [0, 0.3, -0.2], scale: 1.04 },
      { offset: [0.8, -0.05, 0.3], scale: 1 },
      still(),
      still(),
    ],
    strata: 0.12,
    camera: { pos: [0, 1.9, 13.8], target: [0, 0.15, 0], fov: 34 },
    anchorX: 0.67,
  },
  {
    name: "Growth",
    yaw: 0.22,
    regions: [still(), still(), still(), still(1.02), still()],
    strata: 0,
    camera: { pos: [0, 3.5, 14.8], target: [0, -0.1, 0], fov: 35 },
    anchorX: 0.665,
  },
  {
    name: "Private Engagement",
    yaw: -0.12,
    regions: [still(), still(), still(), still(0.9), still()],
    strata: 0,
    camera: { pos: [0, 1.3, 15.2], target: [-0.6, -0.25, 0], fov: 35 },
    anchorX: 0.62,
  },
];

export const SCENE_COUNT = SCENES.length;

/* ---------------------------------------------------------------- exports */

export const NODES: readonly NodeDef[] = nodes;
export const MODULES: readonly ModuleDef[] = modules;
export const LINKS: readonly LinkDef[] = links;
export const NODE_INDEX: ReadonlyMap<string, number> = new Map(nodes.map((n, i) => [n.id, i]));

const linkKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const LINK_INDEX: ReadonlyMap<string, number> = new Map(links.map((l, i) => [linkKey(l.a, l.b), i]));

/** Index into LINKS for the connection between two nodes, or -1. */
export function findLink(a: string, b: string): number {
  return LINK_INDEX.get(linkKey(a, b)) ?? -1;
}

/* ------------------------------------------------------------------- math */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Ease used for every scene-to-scene blend: calm in, calm out. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Split continuous story progress (0…SCENE_COUNT-1) into the two scenes to blend and the eased weight. */
export function sceneBlend(story: number): { from: number; to: number; t: number } {
  const s = Math.min(Math.max(story, 0), SCENE_COUNT - 1);
  const from = Math.min(Math.floor(s), SCENE_COUNT - 2);
  return { from, to: from + 1, t: easeInOut(clamp01(s - from)) };
}

/** How materialised an element is at a given story position (0 hidden … 1 present). */
export function appearance(appear: number, story: number): number {
  if (appear <= 0) return 1;
  return smoothstep(appear - 0.7, appear - 0.05, story);
}
