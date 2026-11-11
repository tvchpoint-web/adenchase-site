import { describe, expect, it } from "vitest";
import { BLOCKS, BLOCK_COLOURS, K, blocksNormalised, para } from "./blocks";

describe("logo blocks", () => {
  it("are three parallelograms on the same slant as the official mark", () => {
    expect(BLOCKS).toHaveLength(3);
    for (const [tl, tr, br, bl] of BLOCKS) {
      const rise = bl[1] - tl[1];
      expect(tl[1]).toBe(tr[1]);
      expect(bl[1]).toBe(br[1]);
      expect((tl[0] - bl[0]) / rise).toBeCloseTo(K, 1);
      expect((tr[0] - br[0]) / rise).toBeCloseTo(K, 1);
    }
  });

  it("keep the logo's colour order: green, cyan, blue", () => {
    expect(BLOCK_COLOURS).toEqual(["#6EFA2E", "#00F6FE", "#005FFE"]);
  });

  it("generate parallelograms with the same slant and normalise inside a unit box", () => {
    const [tl, , , bl] = para(10, 200, 50, 100);
    expect((tl[0] - bl[0]) / (bl[1] - tl[1])).toBeCloseTo(K);
    for (const q of blocksNormalised()) for (const [x, y] of q) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
    }
  });
});
