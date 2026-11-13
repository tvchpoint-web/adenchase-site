/**
 * Orthogonal routing for the Living Circuit: a coarse occupancy grid of the page's content, and an
 * A* search that prefers open space (clearance cost), penalises turns, and only crosses content
 * when there is no other way (at a very high cost, so a route always exists).
 */
export type P = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export interface Grid {
  cell: number;
  cols: number;
  rows: number;
  blocked: Uint8Array;
  /** Extra cost of each cell for being close to content. */
  near: Float32Array;
}

export function buildGrid(width: number, height: number, cell: number, obstacles: Rect[], inflate: number, reach = 7): Grid {
  const cols = Math.max(2, Math.ceil(width / cell));
  const rows = Math.max(2, Math.ceil(height / cell));
  const blocked = new Uint8Array(cols * rows);
  for (const r of obstacles) {
    const c0 = Math.max(0, Math.floor((r.x - inflate) / cell));
    const c1 = Math.min(cols - 1, Math.floor((r.x + r.w + inflate) / cell));
    const r0 = Math.max(0, Math.floor((r.y - inflate) / cell));
    const r1 = Math.min(rows - 1, Math.floor((r.y + r.h + inflate) / cell));
    for (let y = r0; y <= r1; y++) blocked.fill(1, y * cols + c0, y * cols + c1 + 1);
  }
  // Distance (in cells) to the nearest content, by a multi-source BFS limited to `reach`.
  const dist = new Uint8Array(cols * rows).fill(255);
  let frontier: number[] = [];
  for (let i = 0; i < blocked.length; i++) if (blocked[i]) {
    dist[i] = 0;
    frontier.push(i);
  }
  for (let d = 1; d <= reach && frontier.length; d++) {
    const next: number[] = [];
    for (const i of frontier) {
      const x = i % cols;
      const n = [x > 0 ? i - 1 : -1, x < cols - 1 ? i + 1 : -1, i - cols, i + cols];
      for (const j of n) if (j >= 0 && j < dist.length && dist[j] === 255) {
        dist[j] = d;
        next.push(j);
      }
    }
    frontier = next;
  }
  const near = new Float32Array(cols * rows);
  for (let i = 0; i < near.length; i++) near[i] = dist[i] === 255 ? 0 : Math.max(0, reach + 1 - dist[i]) * 0.9;
  return { cell, cols, rows, blocked, near };
}

/**
 * Nearest free cell centre to a point (true Euclidean distance), searched outward ring by ring, so a
 * waypoint that lands on content moves to the closest open space rather than jumping across it.
 */
export function snapFree(g: Grid, p: P, maxRadius = 80): P {
  const cx = Math.min(g.cols - 1, Math.max(0, Math.floor(p.x / g.cell)));
  const cy = Math.min(g.rows - 1, Math.max(0, Math.floor(p.y / g.cell)));
  const centre = (x: number, y: number): P => ({ x: (x + 0.5) * g.cell, y: (y + 0.5) * g.cell });
  if (!g.blocked[cy * g.cols + cx]) return centre(cx, cy);
  let best: [number, number] | null = null;
  let bd = Infinity;
  // Ring r holds cells at Euclidean distance ≥ r, so once r² exceeds the best found, nothing closer remains.
  for (let r = 1; r <= maxRadius && r * r <= bd; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= g.cols || y >= g.rows || g.blocked[y * g.cols + x]) continue;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = [x, y];
        }
      }
    }
  }
  if (!best) {
    // Rare: no open space within the radius. Scan the whole grid rather than start inside content.
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        if (g.blocked[y * g.cols + x]) continue;
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < bd) {
          bd = d;
          best = [x, y];
        }
      }
    }
  }
  return best ? centre(best[0], best[1]) : p;
}

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

/**
 * A* between two points on the grid; returns the cell-centre polyline (corners only). The search is
 * confined to a band of rows around the two points (plus `margin` cells), so its working arrays are
 * sized to that band rather than the whole page.
 */
export function route(g: Grid, a: P, b: P, turn = 24, wall = 400, margin = 80): P[] {
  const { cols, rows, cell } = g;
  const sx = Math.min(cols - 1, Math.max(0, Math.floor(a.x / cell)));
  const sy = Math.min(rows - 1, Math.max(0, Math.floor(a.y / cell)));
  const tx = Math.min(cols - 1, Math.max(0, Math.floor(b.x / cell)));
  const ty = Math.min(rows - 1, Math.max(0, Math.floor(b.y / cell)));
  const r0 = Math.max(0, Math.min(sy, ty) - margin);
  const r1 = Math.min(rows - 1, Math.max(sy, ty) + margin);
  const N = (r1 - r0 + 1) * cols * 4;
  const cost = new Float32Array(N).fill(Infinity);
  const from = new Int32Array(N).fill(-1);
  const closed = new Uint8Array(N);
  const sid = (x: number, y: number, d: number) => ((y - r0) * cols + x) * 4 + d;
  // Binary heap of state ids keyed by f.
  const heap: number[] = [];
  const key: number[] = [];
  const push = (s: number, f: number) => {
    heap.push(s);
    key.push(f);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (key[p] <= key[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      [key[p], key[i]] = [key[i], key[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const lastS = heap.pop()!;
    const lastK = key.pop()!;
    if (heap.length) {
      heap[0] = lastS;
      key[0] = lastK;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && key[l] < key[m]) m = l;
        if (r < heap.length && key[r] < key[m]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        [key[m], key[i]] = [key[i], key[m]];
        i = m;
      }
    }
    return top;
  };
  const h = (x: number, y: number) => Math.abs(x - tx) + Math.abs(y - ty);
  for (let d = 0; d < 4; d++) {
    const s = sid(sx, sy, d);
    cost[s] = 0;
    push(s, h(sx, sy));
  }
  let goal = -1;
  while (heap.length) {
    const s = pop();
    if (closed[s]) continue;
    closed[s] = 1;
    const local = s >> 2;
    const d = s & 3;
    const x = local % cols;
    const y = ((local / cols) | 0) + r0;
    if (x === tx && y === ty) {
      goal = s;
      break;
    }
    for (let nd = 0; nd < 4; nd++) {
      if (nd === ((d + 2) & 3)) continue;
      const nx = x + DX[nd];
      const ny = y + DY[nd];
      if (nx < 0 || ny < r0 || nx >= cols || ny > r1) continue;
      const nc = ny * cols + nx;
      const ns = sid(nx, ny, nd);
      if (closed[ns]) continue;
      const step = 1 + g.near[nc] + (g.blocked[nc] ? wall : 0) + (nd !== d ? turn : 0);
      const v = cost[s] + step;
      if (v < cost[ns]) {
        cost[ns] = v;
        from[ns] = s;
        push(ns, v + h(nx, ny));
      }
    }
  }
  if (goal < 0) return [a, { x: a.x, y: b.y }, b];
  const pts: P[] = [];
  for (let s = goal; s >= 0; s = from[s]) {
    const local = s >> 2;
    pts.push({ x: ((local % cols) + 0.5) * cell, y: (((local / cols) | 0) + r0 + 0.5) * cell });
  }
  pts.reverse();
  return corners(pts);
}

/** Keeps only the points where the direction changes. */
export function corners(pts: P[]): P[] {
  if (pts.length < 3) return pts.slice();
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const colinear = (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y);
    if (!colinear) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * Cuts every right-angle corner on the logo's slant (run K per unit of rise), so turns read as the
 * brand's geometry rather than generic rounded or square elbows.
 */
export function chamfer(pts: P[], size: number, k: number): P[] {
  if (pts.length < 3) return pts.slice();
  const out: P[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const inH = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);
    const outH = Math.abs(c.x - b.x) > Math.abs(c.y - b.y);
    if (inH === outH) {
      out.push(b);
      continue;
    }
    const lenIn = Math.hypot(b.x - a.x, b.y - a.y);
    const lenOut = Math.hypot(c.x - b.x, c.y - b.y);
    if (lenIn < 1 || lenOut < 1) {
      out.push(b);
      continue;
    }
    // Vertical leg is cut by s, horizontal by k·s.
    const s = Math.min(size, (inH ? lenIn / k : lenIn) * 0.45, (outH ? lenOut / k : lenOut) * 0.45);
    const cutIn = inH ? k * s : s;
    const cutOut = outH ? k * s : s;
    out.push({ x: b.x - ((b.x - a.x) / lenIn) * cutIn, y: b.y - ((b.y - a.y) / lenIn) * cutIn });
    out.push({ x: b.x + ((c.x - b.x) / lenOut) * cutOut, y: b.y + ((c.y - b.y) / lenOut) * cutOut });
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export interface Track {
  pts: P[];
  /** Cumulative length at each point. */
  len: number[];
  /** Reading depth at which the signal reaches each point (monotone). */
  depth: number[];
  total: number;
}

/**
 * Builds the scroll mapping. Vertical travel follows the reading line 1:1; a horizontal run is
 * spread across a short scroll window centred on its height, so crossings are seen happening
 * rather than jumping, and the head never strays far from the reading line.
 */
export function track(pts: P[], window: number): Track {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const horiz = (i: number) => i >= 0 && i < pts.length - 1 && Math.abs(pts[i + 1].x - pts[i].x) > Math.abs(pts[i + 1].y - pts[i].y) * 2;
  const depth = pts.map((p, i) => {
    if (horiz(i)) return p.y - Math.min(window, Math.abs(pts[i + 1].x - p.x) * 0.5) / 2;
    if (horiz(i - 1)) return p.y + Math.min(window, Math.abs(p.x - pts[i - 1].x) * 0.5) / 2;
    return p.y;
  });
  // Keep the mapping monotone. A leg that climbs (routing up around content) still consumes scroll
  // equal to its length, so it is travelled rather than skipped.
  for (let i = 1; i < depth.length; i++) depth[i] = Math.max(depth[i], depth[i - 1] + Math.max(0.5, pts[i - 1].y - pts[i].y));
  return { pts, len, depth, total: len[len.length - 1] };
}

/** Length along the track for a reading depth. */
export function lengthAtDepth(t: Track, d: number): number {
  const { depth, len } = t;
  if (d <= depth[0]) return 0;
  if (d >= depth[depth.length - 1]) return t.total;
  let lo = 0;
  let hi = depth.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (depth[m] <= d) lo = m;
    else hi = m;
  }
  const f = (d - depth[lo]) / (depth[hi] - depth[lo]);
  return len[lo] + (len[hi] - len[lo]) * f;
}

/** Point at a length along the track. */
export function pointAt(t: Track, l: number): P {
  const { pts, len } = t;
  if (l <= 0) return pts[0];
  if (l >= t.total) return pts[pts.length - 1];
  let lo = 0;
  let hi = len.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (len[m] <= l) lo = m;
    else hi = m;
  }
  const f = (l - len[lo]) / (len[hi] - len[lo] || 1);
  return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * f, y: pts[lo].y + (pts[hi].y - pts[lo].y) * f };
}
