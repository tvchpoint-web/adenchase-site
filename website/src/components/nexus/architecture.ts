/**
 * The Nexus — architectural definition.
 *
 * A monumental glass structure: a twisting central tower of thick glass floor
 * plates on a metal frame, with three wings (Strategy, AI Engineering, Market
 * Growth), an outer ring of satellite monoliths and 3D energy channels that
 * carry the Jade Signal between them.
 *
 * Every group and piece has an explicit pose in each of the five scenes. The
 * renderer blends group poses and piece poses separately (so wings rotate as
 * rigid bodies), driven only by scroll progress — every transition reverses.
 */

export type V3 = [number, number, number];

export const REGION = { strategy: 0, engineering: 1, growth: 2, expansion: 3, lead: 4 } as const;
export type RegionId = (typeof REGION)[keyof typeof REGION];
export const SCENE_COUNT = 5;

export type MaterialKind = "glass" | "glassDeep" | "metal" | "strip" | "heart" | "shaft";
export type Shape = "box" | "octahedron";

export interface GroupPose {
  p: V3;
  ry: number;
  /** 0 = sunk below the floor / absent, 1 = present. */
  presence: number;
}

export interface PiecePose {
  p: V3;
  r: V3;
  /** Multiplier on the piece's base size. */
  s: V3;
  presence: number;
}

export interface GroupDef {
  id: string;
  region: RegionId;
  poses: GroupPose[];
  detail?: boolean;
}

export interface PieceDef {
  id: string;
  group: string;
  region: RegionId;
  mat: MaterialKind;
  shape: Shape;
  size: V3;
  poses: PiecePose[];
  /** Omitted on lightweight devices. */
  detail?: boolean;
}

export type Anchor = { piece: string; at: V3 } | { world: V3 };

export interface ChannelDef {
  id: string;
  from: Anchor;
  to: Anchor;
  /** Story position by which the channel is fully revealed. */
  appear: number;
  /** Arc height multiplier. */
  lift?: number;
  detail?: boolean;
}

/** A hop along a channel; `rev` travels it from `to` back to `from`. */
export interface Hop {
  ch: string;
  rev?: boolean;
}

/* ------------------------------------------------------------------ helpers */

const S = <T,>(fn: (scene: number) => T): T[] => [0, 1, 2, 3, 4].map(fn);
const pose = (p: V3, r: V3 = [0, 0, 0], s: V3 = [1, 1, 1], presence = 1): PiecePose => ({ p, r, s, presence });
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const groups: GroupDef[] = [];
const pieces: PieceDef[] = [];

function group(id: string, region: RegionId, poses: GroupPose[], detail?: boolean) {
  groups.push({ id, region, poses, detail });
}

function piece(def: Omit<PieceDef, "shape"> & { shape?: Shape }) {
  pieces.push({ shape: "box", ...def });
}

/** Light strips ride on a parent piece: same rotation, offset rotated with it. */
function strip(id: string, parent: PieceDef, offset: V3, size: V3, detail?: boolean) {
  piece({
    id,
    group: parent.group,
    region: parent.region,
    mat: "strip",
    size,
    detail,
    poses: parent.poses.map((pp) => pose(add(pp.p, rotY([offset[0] * pp.s[0], offset[1] * pp.s[1], offset[2] * pp.s[2]], pp.r[1])), pp.r, [1, 1, 1], pp.presence)),
  });
}

const FLOOR = -2.6;
const g = (p: V3, ry: number, presence = 1): GroupPose => ({ p, ry, presence });

/* ============================================================== CORE TOWER */

group("core", REGION.engineering, [g([0, 0, 0], 0), g([0, 0, 0], 0), g([0, -0.15, -2.4], 0), g([0, 0, 0], 0), g([0, 0, 0], 0)]);

piece({ id: "core-plinth", group: "core", region: 1, mat: "metal", size: [3.1, 0.26, 3.1], poses: S(() => pose([0, FLOOR + 0.13, 0])) });

const PLATES = 7;
const plateY = (i: number) => -2.0 + i * 0.72;
for (let i = 0; i < PLATES; i++) {
  const odd = i % 2 === 1;
  const p: PieceDef = {
    id: `core-plate-${i}`,
    group: "core",
    region: 1,
    mat: "glass",
    shape: "box",
    size: [2.3, 0.16, 2.3],
    poses: [
      // Arrival: the upper plates hover, not yet in place.
      i >= 5 ? pose([0.35, plateY(i) + 1.0 + (i - 5) * 0.55, -0.2], [0.06, i * 0.1 + 0.55, -0.05]) : pose([0, plateY(i), 0], [0, i * 0.1, 0]),
      // Discovery: plates separate and fan open.
      pose([odd ? 0.55 : -0.55, plateY(i) + (i - 3) * 0.42, odd ? -0.35 : 0.35], [0, i * 0.26, 0]),
      // Engineering: plates rotate into precise alignment.
      pose([0, plateY(i) * 0.92, 0], [0, 0, 0]),
      // Growth.
      pose([0, plateY(i), 0], [0, i * 0.1, 0]),
      // Engagement: the iconic twist.
      pose([0, plateY(i), 0], [0, i * 0.14, 0]),
    ],
  };
  pieces.push(p);
  strip(`core-plate-${i}-sf`, p, [0, 0, 1.17], [2.06, 0.035, 0.035], i % 2 === 1);
  strip(`core-plate-${i}-sr`, p, [1.17, 0, 0], [0.035, 0.035, 2.06]);
}

[
  [0.62, 0.62],
  [-0.62, 0.62],
  [0.62, -0.62],
  [-0.62, -0.62],
].forEach(([x, z], c) =>
  piece({
    id: `core-column-${c}`,
    group: "core",
    region: 1,
    mat: "metal",
    size: [0.12, 5.0, 0.12],
    poses: [pose([x, 0.1, z]), pose([x, 0.1, z], [0, 0, 0], [1, 1.5, 1]), pose([x, -0.1, z]), pose([x, 0.1, z]), pose([x, 0.1, z])],
  }),
);

piece({
  id: "core-shaft",
  group: "core",
  region: 1,
  mat: "shaft",
  size: [0.05, 5.0, 0.05],
  poses: [pose([0, 0.1, 0]), pose([0, 0.1, 0], [0, 0, 0], [1, 1.5, 1]), pose([0, -0.1, 0]), pose([0, 0.1, 0]), pose([0, 0.1, 0])],
});

piece({ id: "core-heart", group: "core", region: 1, mat: "heart", shape: "octahedron", size: [0.26, 0.26, 0.26], poses: S(() => pose([0, -0.2, 0])) });
piece({
  id: "core-chamber",
  group: "core",
  region: 1,
  mat: "glass",
  size: [0.62, 0.62, 0.62],
  poses: S((k) => pose([0, -0.2, 0], [0.62, 0.785 + (k === 1 ? 0.6 : 0), 0])),
});

const crown: PieceDef = {
  id: "core-crown",
  group: "core",
  region: 1,
  mat: "glass",
  shape: "box",
  size: [1.5, 0.62, 1.5],
  poses: [
    pose([0, 2.85, 0], [0, 0.6, 0], [1, 1, 1], 0),
    pose([0, 4.4, 0], [0, 1.6, 0]),
    pose([0, 2.62, 0], [0, 0, 0]),
    pose([0, 2.85, 0], [0, 0.6, 0]),
    pose([0, 2.85, 0], [0, 0.84, 0]),
  ],
};
pieces.push(crown);
piece({
  id: "core-crown-cap",
  group: "core",
  region: 1,
  mat: "metal",
  size: [1.66, 0.06, 1.66],
  poses: crown.poses.map((c) => pose(add(c.p, [0, 0.34, 0]), c.r, [1, 1, 1], c.presence)),
});
strip("core-crown-s", crown, [0, -0.31, 0.76], [1.4, 0.035, 0.035]);

/* ============================================================ STRATEGY WING */

group("strategy", REGION.strategy, [
  g([-3.4, 0, 0.5], 0.5),
  g([-4.9, 0.25, 1.1], 0.85),
  g([-4.1, 0, 1.6], 0),
  g([-3.5, 0, 0.4], 0.5),
  g([-3.2, 0, 0.5], 0.55),
]);
piece({ id: "st-plinth", group: "strategy", region: 0, mat: "metal", size: [2.3, 0.2, 1.5], poses: S(() => pose([0, FLOOR + 0.1, 0])) });
piece({ id: "st-wall", group: "strategy", region: 0, mat: "glass", size: [2.1, 3.6, 0.14], poses: S((k) => pose([0, -0.75, k === 1 ? -1.05 : -0.66])) });
piece({ id: "st-fin", group: "strategy", region: 0, mat: "metal", size: [0.1, 3.7, 1.4], poses: S((k) => pose([k === 1 ? -1.45 : -1.08, -0.75, 0])) });
for (let k = 0; k < 4; k++) {
  const slab: PieceDef = {
    id: `st-slab-${k}`,
    group: "strategy",
    region: 0,
    mat: "glass",
    shape: "box",
    size: [2.0, 0.15, 1.25],
    poses: [
      pose([0.22 * k, -1.75 + 0.95 * k, 0.05], [0, 0, 0], [1, 1, 1], k === 3 ? 0 : 1),
      pose([0.42 * k, -1.75 + 1.22 * k, 0.15 * k], [0, -0.12 * k, 0]),
      pose([0, -1.85 + 0.9 * k, 0]),
      pose([0.22 * k, -1.75 + 0.95 * k, 0.05]),
      pose([0.22 * k, -1.75 + 0.95 * k, 0.05]),
    ],
  };
  pieces.push(slab);
  strip(`st-slab-${k}-s`, slab, [0, 0, 0.64], [1.9, 0.035, 0.035]);
}

/* ======================================================= AI ENGINEERING WING */

group("ai", REGION.engineering, [
  g([0.3, 0, -3.2], 0, 0),
  g([0.7, 0.3, -4.7], -0.35),
  g([0, 0, 1.8], 0),
  g([0.3, 0, -3.2], 0),
  g([0, 0, -3.0], 0),
]);
piece({ id: "ai-plinth", group: "ai", region: 1, mat: "metal", size: [2.3, 0.2, 1.5], poses: S(() => pose([0, FLOOR + 0.1, 0])) });
const tower: PieceDef = { id: "ai-tower", group: "ai", region: 1, mat: "glass", shape: "box", size: [1.15, 4.4, 1.15], poses: S(() => pose([0, -0.2, 0])) };
pieces.push(tower);
strip("ai-tower-sl", tower, [-0.59, 0, 0.59], [0.035, 4.2, 0.035]);
strip("ai-tower-sr", tower, [0.59, 0, 0.59], [0.035, 4.2, 0.035]);
[-1, 1].forEach((side) =>
  piece({
    id: `ai-flank-${side < 0 ? "l" : "r"}`,
    group: "ai",
    region: 1,
    mat: "glassDeep",
    size: [0.5, 3.1, 0.5],
    poses: S((k) => pose([side * (k === 1 ? 1.55 : 0.98), k === 1 ? -0.55 : -0.85, 0])),
  }),
);
piece({ id: "ai-cap", group: "ai", region: 1, mat: "metal", size: [2.0, 0.1, 1.35], poses: S((k) => pose([0, k === 1 ? 2.7 : 2.08, 0])) });

/* ========================================================= MARKET GROWTH WING */

group("growth", REGION.growth, [
  g([3.4, 0, 0.6], -0.5),
  g([4.9, -0.05, 1.2], -0.85),
  g([4.1, 0, 1.6], 0),
  g([3.5, 0, 0.5], -0.5),
  g([3.2, 0, 0.6], -0.55),
]);
piece({ id: "gr-plinth", group: "growth", region: 2, mat: "metal", size: [2.9, 0.2, 1.3], poses: S(() => pose([0, FLOOR + 0.1, 0])) });
const STEPS = [1.0, 1.7, 2.5, 3.4];
STEPS.forEach((h, k) => {
  const base = FLOOR + 0.2;
  const tight = pose([-0.95 + 0.63 * k, base + h / 2, 0.06 * k], [0, 0, 0], [1, 1, 1], k === 3 ? 0 : 1);
  const step: PieceDef = {
    id: `gr-step-${k}`,
    group: "growth",
    region: 2,
    mat: "glass",
    shape: "box",
    size: [0.64, h, 0.64],
    poses: [
      tight,
      pose([-1.35 + 0.9 * k, base + h / 2 + 0.15 * k, k % 2 ? -0.3 : 0.3], [0, 0.2 * k, 0]),
      pose([-0.95 + 0.63 * k, base + h / 2, 0]),
      pose([-0.95 + 0.63 * k, base + h / 2, 0.06 * k]),
      pose([-0.95 + 0.63 * k, base + h / 2, 0.06 * k]),
    ],
  };
  pieces.push(step);
  const cap: PieceDef = {
    id: `gr-cap-${k}`,
    group: "growth",
    region: 2,
    mat: "metal",
    shape: "box",
    size: [0.72, 0.07, 0.72],
    poses: step.poses.map((sp) => pose(add(sp.p, [0, h / 2 + 0.035, 0]), sp.r, [1, 1, 1], sp.presence)),
  };
  pieces.push(cap);
  strip(`gr-cap-${k}-s`, cap, [0, 0, 0.37], [0.62, 0.03, 0.03]);
});

/* ================================================================ SATELLITES */

export const SATELLITES = 8;
for (let i = 0; i < SATELLITES; i++) {
  const a = (i + 0.5) * (Math.PI / 4);
  const h = 1.3 + (i % 3) * 0.6;
  const detail = i % 2 === 1;
  const at = (r: number): V3 => [r * Math.sin(a), 0, r * Math.cos(a)];
  group(
    `sat-${i}`,
    REGION.expansion,
    [g(at(7.6), a, 0), g(at(7.6), a, 0), g(at(7.6), a, 0), g(at(7.4), a, 1), g(at(6.3), a, 1)],
    detail,
  );
  const mono: PieceDef = {
    id: `sat-${i}-mono`,
    group: `sat-${i}`,
    region: 3,
    mat: "glass",
    shape: "box",
    size: [0.6, h, 0.6],
    detail,
    poses: [0, 1, 2, 3].map(() => pose([0, FLOOR + h / 2, 0])).concat([pose([0, FLOOR + 0.9, 0], [0, 0, 0], [1, 1.8 / h, 1])]),
  };
  pieces.push(mono);
  piece({
    id: `sat-${i}-cap`,
    group: `sat-${i}`,
    region: 3,
    mat: "metal",
    size: [0.7, 0.06, 0.7],
    detail,
    poses: [0, 1, 2, 3].map(() => pose([0, FLOOR + h + 0.03, 0])).concat([pose([0, FLOOR + 1.83, 0])]),
  });
}

/* ================================================================== CHANNELS */

const satTargets: Anchor[] = [
  { piece: "gr-cap-1", at: [0, 0.03, 0] },
  { piece: "gr-cap-3", at: [0, 0.03, 0] },
  { piece: "ai-cap", at: [0.9, 0.05, 0] },
  { piece: "ai-cap", at: [-0.9, 0.05, 0] },
  { piece: "st-slab-2", at: [-0.9, 0, 0] },
  { piece: "st-slab-0", at: [-0.9, 0, 0.5] },
  { piece: "core-plinth", at: [-1.5, 0.13, 1.4] },
  { piece: "core-plinth", at: [1.5, 0.13, 1.4] },
];

export const CHANNELS: ChannelDef[] = [
  { id: "c-sc", from: { piece: "st-slab-1", at: [0.95, 0, 0.45] }, to: { piece: "core-plate-3", at: [-1.15, 0, 0.4] }, appear: 0 },
  { id: "c-cg", from: { piece: "core-plate-4", at: [1.15, 0, 0.4] }, to: { piece: "gr-cap-2", at: [0, 0.04, 0] }, appear: 0 },
  { id: "c-ca", from: { piece: "core-heart", at: [0, 0, 0] }, to: { piece: "ai-tower", at: [0, 0.6, 0.58] }, appear: 1, lift: 0.2 },
  { id: "c-sa", from: { piece: "st-slab-3", at: [0.95, 0, -0.35] }, to: { piece: "ai-cap", at: [-0.95, 0.05, 0] }, appear: 1 },
  { id: "c-ag", from: { piece: "ai-cap", at: [0.95, 0.05, 0] }, to: { piece: "gr-cap-3", at: [0, 0.04, 0] }, appear: 1 },
  { id: "c-sg", from: { piece: "st-slab-0", at: [0.95, 0, 0.6] }, to: { piece: "gr-cap-0", at: [0, 0.04, 0.3] }, appear: 1, lift: 0.25 },
  ...satTargets.map((to, i) => ({
    id: `c-sat-${i}`,
    from: { piece: `sat-${i}-cap`, at: [0, 0.04, 0] as V3 },
    to,
    appear: 3,
    lift: 0.45,
    detail: i % 2 === 1,
  })),
  { id: "c-lead", from: { piece: "st-plinth", at: [-1.1, 0.12, 0.6] }, to: { world: [-12, FLOOR + 0.2, 5] }, appear: 4, lift: 0.15 },
];

export const ROUTES: Record<string, Hop[]> = {
  // Discover → Connect → Engineer → Expand → Grow.
  hero: [{ ch: "c-sc" }, { ch: "c-cg" }],
  market: [{ ch: "c-sg" }],
  experience: [{ ch: "c-ag", rev: true }, { ch: "c-sa", rev: true }],
  operations: [{ ch: "c-ca" }, { ch: "c-ag" }],
  engineerForward: [{ ch: "c-sc" }, { ch: "c-ca" }, { ch: "c-ag" }],
  engineerReturn: [{ ch: "c-ag", rev: true }, { ch: "c-sa", rev: true }],
  growOuter: [{ ch: "c-sc" }, { ch: "c-cg" }, { ch: "c-sat-1", rev: true }],
  growRing: [{ ch: "c-sat-2" }, { ch: "c-ag" }, { ch: "c-sat-0", rev: true }],
  growLow: [{ ch: "c-sat-5" }, { ch: "c-sg" }, { ch: "c-sat-7", rev: true }],
  final: [{ ch: "c-sc", rev: true }, { ch: "c-lead" }],
};

export const SCENE_ROUTES: string[][] = [
  ["hero"],
  ["market", "experience", "operations"],
  ["engineerForward", "engineerReturn", "operations"],
  ["growOuter", "growRing", "growLow"],
  ["final"],
];

/* ==================================================================== CAMERA */

export interface CameraShot {
  /** Orbit around the target, radians. */
  azimuth: number;
  elevation: number;
  distance: number;
  target: V3;
  fov: number;
  /** Horizontal position of the target in the frame (fraction of width). */
  anchorX: number;
}

export const SHOTS: CameraShot[] = [
  { azimuth: 0.5, elevation: 0.1, distance: 19.5, target: [0.2, 0.7, 0], fov: 32, anchorX: 0.63 },
  { azimuth: 0.22, elevation: 0.06, distance: 13.5, target: [0.3, 0.7, 0], fov: 34, anchorX: 0.67 },
  { azimuth: -0.06, elevation: 0.3, distance: 20.5, target: [0, -0.3, 0.4], fov: 32, anchorX: 0.66 },
  { azimuth: -0.7, elevation: 0.58, distance: 26, target: [0, -0.9, 0], fov: 32, anchorX: 0.64 },
  { azimuth: 0.4, elevation: 0.17, distance: 22.5, target: [-1.2, 0.1, 0], fov: 32, anchorX: 0.6 },
];

export const SCENE_NAMES = ["Arrival", "Discovery", "Engineering", "Growth", "Private Engagement"];

/* ===================================================================== DATA */

export const GROUPS: readonly GroupDef[] = groups;
export const PIECES: readonly PieceDef[] = pieces;
export const PIECE_INDEX: ReadonlyMap<string, number> = new Map(pieces.map((p, i) => [p.id, i]));
export const CHANNEL_INDEX: ReadonlyMap<string, number> = new Map(CHANNELS.map((c, i) => [c.id, i]));
export const FLOOR_Y = FLOOR;

/* ===================================================================== MATH */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** Split continuous story progress (0…4) into the two scenes to blend and an eased weight. */
export function sceneBlend(story: number): { from: number; to: number; t: number } {
  const s = Math.min(Math.max(story, 0), SCENE_COUNT - 1);
  const from = Math.min(Math.floor(s), SCENE_COUNT - 2);
  return { from, to: from + 1, t: easeInOut(clamp01(s - from)) };
}

/** Channel visibility at a story position. */
export function channelPresence(appear: number, story: number): number {
  if (appear <= 0) return 1;
  return smoothstep(appear - 0.75, appear - 0.1, story);
}
