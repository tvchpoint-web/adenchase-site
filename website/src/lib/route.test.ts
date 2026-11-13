import { describe, expect, it } from "vitest";
import { buildGrid, chamfer, lengthAtDepth, pointAt, route, snapFree, track } from "./route";

describe("living circuit routing", () => {
  it("routes around content instead of through it", () => {
    // A wall of copy across the middle with a gap on the right.
    const g = buildGrid(400, 400, 10, [{ x: 0, y: 180, w: 320, h: 40 }], 10);
    const path = route(g, { x: 20, y: 20 }, { x: 20, y: 380 });
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      // No segment may pass through the inflated wall (y 170–230, x < 330).
      if (a.x === b.x && a.x < 330) expect(Math.max(a.y, b.y) < 170 || Math.min(a.y, b.y) > 230).toBe(true);
    }
    expect(path.some((p) => p.x > 330)).toBe(true);
  });

  it("cuts corners on the brand slant", () => {
    const pts = chamfer([{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }], 20, 0.68);
    expect(pts).toHaveLength(4);
    expect(pts[1]).toEqual({ x: 0, y: 80 });
    expect(pts[2].x).toBeCloseTo(13.6);
  });

  it("maps reading depth to a monotone, reversible position", () => {
    const t = track([{ x: 0, y: 0 }, { x: 0, y: 200 }, { x: 300, y: 200 }, { x: 300, y: 500 }], 200);
    let prev = -1;
    for (let d = -50; d <= 600; d += 10) {
      const l = lengthAtDepth(t, d);
      expect(l).toBeGreaterThanOrEqual(prev);
      prev = l;
    }
    expect(lengthAtDepth(t, 600)).toBe(t.total);
    // The horizontal crossing happens within a scroll window around its height.
    expect(pointAt(t, lengthAtDepth(t, 200)).x).toBeGreaterThan(50);
    expect(pointAt(t, lengthAtDepth(t, 200)).x).toBeLessThan(250);
  });
});

describe("waypoint snapping", () => {
  it("moves to the nearest open cell instead of sweeping across content", () => {
    // A wide label across the row; open space just above it and far to the right.
    const g = buildGrid(400, 200, 10, [{ x: 20, y: 90, w: 320, h: 20 }], 0);
    const p = snapFree(g, { x: 60, y: 100 });
    expect(p.x).toBeCloseTo(65); // stays in the same column…
    expect(Math.abs(p.y - 100)).toBeLessThan(20); // …and moves just off the label
  });

  it("prefers the truly nearest cell over a ring corner", () => {
    // Everything blocked except one cell 4 straight up and one diagonal corner (3,3) away.
    const g = buildGrid(200, 200, 10, [{ x: 0, y: 0, w: 200, h: 200 }], 0);
    const at = (cx: number, cy: number) => (g.blocked[cy * g.cols + cx] = 0);
    at(10, 6); // (0, -4): distance 4
    at(13, 13); // (3, +3): distance 4.24
    const p = snapFree(g, { x: 105, y: 105 });
    expect(p).toEqual({ x: 105, y: 65 });
  });

  it("still finds open space beyond the search radius", () => {
    const g = buildGrid(200, 200, 10, [{ x: 0, y: 0, w: 200, h: 180 }], 0); // rows 0–18 blocked, row 19 open
    const p = snapFree(g, { x: 15, y: 15 }, 3);
    expect(p.y).toBe(195);
  });
});
