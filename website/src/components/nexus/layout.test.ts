import { describe, expect, it } from "vitest";
import {
  LINKS,
  MODULES,
  NODES,
  NODE_INDEX,
  PATHS,
  SCENE_COUNT,
  SCENE_PATHS,
  appearance,
  findLink,
  sceneBlend,
} from "./layout";

describe("Nexus layout", () => {
  it("has unique node ids and links that reference real nodes", () => {
    expect(NODE_INDEX.size).toBe(NODES.length);
    for (const l of LINKS) {
      expect(NODE_INDEX.has(l.a), l.a).toBe(true);
      expect(NODE_INDEX.has(l.b), l.b).toBe(true);
    }
  });

  it("opens Scene 01 with a partially assembled structure of 12–18 modules", () => {
    const initial = MODULES.filter((m) => m.appear === 0).length;
    expect(initial).toBeGreaterThanOrEqual(12);
    expect(initial).toBeLessThanOrEqual(18);
    expect(initial).toBeLessThan(MODULES.length);
  });

  it("keeps every Jade Signal hop on a real architectural connection", () => {
    for (const path of Object.values(PATHS)) {
      const routes = [path.nodes, ...(path.branches ?? []).map((b) => b.nodes)];
      for (const route of routes) {
        for (let i = 1; i < route.length; i++) {
          expect(findLink(route[i - 1], route[i]), `${path.id}: ${route[i - 1]} → ${route[i]}`).toBeGreaterThanOrEqual(0);
        }
      }
      for (const b of path.branches ?? []) expect(path.nodes).toContain(b.from);
    }
  });

  it("only routes signals through nodes that exist by that scene", () => {
    SCENE_PATHS.forEach((ids, scene) => {
      for (const id of ids) {
        const p = PATHS[id];
        const all = [...p.nodes, ...(p.branches ?? []).flatMap((b) => b.nodes)];
        for (const n of all) {
          const node = NODES[NODE_INDEX.get(n)!];
          expect(node.appear, `${id} uses ${n} in scene ${scene}`).toBeLessThanOrEqual(scene);
        }
        for (let i = 1; i < p.nodes.length; i++) {
          expect(LINKS[findLink(p.nodes[i - 1], p.nodes[i])].appear).toBeLessThanOrEqual(scene);
        }
      }
    });
  });

  it("blends scenes continuously so scrolling backward retraces the same states", () => {
    let prev = sceneBlend(0);
    for (let s = 0; s <= SCENE_COUNT - 1; s += 0.01) {
      const b = sceneBlend(s);
      const value = b.from + b.t;
      expect(value).toBeGreaterThanOrEqual(prev.from + prev.t - 1e-9);
      prev = b;
    }
    expect(sceneBlend(SCENE_COUNT - 1).t).toBeCloseTo(1);
    expect(sceneBlend(-3)).toEqual(sceneBlend(0));
  });

  it("materialises elements by the scene they belong to", () => {
    expect(appearance(0, 0)).toBe(1);
    expect(appearance(3, 1)).toBe(0);
    expect(appearance(3, 3)).toBe(1);
  });
});
