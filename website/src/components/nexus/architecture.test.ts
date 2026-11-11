import { describe, expect, it } from "vitest";
import { CHANNELS, CHANNEL_INDEX, GROUPS, PIECES, PIECE_INDEX, ROUTES, SCENE_COUNT, SCENE_ROUTES, SHOTS, sceneBlend } from "./architecture";

const groupIds = new Set(GROUPS.map((g) => g.id));

describe("Nexus architecture", () => {
  it("defines every group and piece in all five scenes", () => {
    for (const g of GROUPS) expect(g.poses).toHaveLength(SCENE_COUNT);
    for (const p of PIECES) {
      expect(p.poses, p.id).toHaveLength(SCENE_COUNT);
      expect(groupIds.has(p.group), p.id).toBe(true);
    }
    expect(PIECE_INDEX.size).toBe(PIECES.length);
    expect(SHOTS).toHaveLength(SCENE_COUNT);
  });

  it("is volumetric: structural glass and metal have real thickness", () => {
    for (const p of PIECES.filter((x) => x.mat === "glass" || x.mat === "glassDeep" || x.mat === "metal")) {
      expect(Math.min(...p.size), p.id).toBeGreaterThanOrEqual(0.06);
    }
  });

  it("opens partially assembled and resolves complete", () => {
    const present = (scene: number) =>
      PIECES.filter((p) => p.mat !== "strip" && p.poses[scene].presence > 0 && GROUPS.find((g) => g.id === p.group)!.poses[scene].presence > 0).length;
    const all = PIECES.filter((p) => p.mat !== "strip").length;
    expect(present(0)).toBeLessThan(present(1));
    expect(present(4)).toBe(all);
  });

  it("gives each scene a distinct configuration", () => {
    const signature = (scene: number) => GROUPS.map((g) => g.poses[scene].p.join(",") + g.poses[scene].ry).join("|") + PIECES.map((p) => p.poses[scene].p.join(",") + p.poses[scene].r.join(",")).join("|");
    const sigs = new Set([0, 1, 2, 3, 4].map(signature));
    expect(sigs.size).toBe(SCENE_COUNT);
  });

  it("anchors every channel to a real piece and routes only through real channels", () => {
    for (const c of CHANNELS) for (const a of [c.from, c.to]) if ("piece" in a) expect(PIECE_INDEX.has(a.piece), `${c.id} → ${a.piece}`).toBe(true);
    for (const [id, hops] of Object.entries(ROUTES)) for (const h of hops) expect(CHANNEL_INDEX.has(h.ch), `${id}: ${h.ch}`).toBe(true);
    SCENE_ROUTES.forEach((ids, scene) =>
      ids.forEach((id) => ROUTES[id].forEach((h) => expect(CHANNELS[CHANNEL_INDEX.get(h.ch)!].appear, `${id} in scene ${scene}`).toBeLessThanOrEqual(scene))),
    );
    for (const lens of ["market", "experience", "operations"]) expect(ROUTES[lens]).toBeDefined();
  });

  it("blends scenes continuously so scrolling backward retraces the same states", () => {
    let prev = -1;
    for (let s = 0; s <= SCENE_COUNT - 1; s += 0.01) {
      const b = sceneBlend(s);
      expect(b.from + b.t).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = b.from + b.t;
    }
  });
});
