import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Brand guards. These protect decisions that must never drift silently:
 * the master logo is the official artwork, byte for byte; the approved palette is defined;
 * and wherever the full descriptor is written out, it is written exactly.
 */
const ROOT = join(__dirname, "..", "..");

describe("brand guards", () => {
  it("keeps the master logo byte-identical to the official artwork", () => {
    const sha = createHash("sha256").update(readFileSync(join(ROOT, "public/brand/aden-chase-logo.png"))).digest("hex");
    expect(sha).toBe("bbbac9b9624371ff4c4d32c5de12d7a7140799b5b8055a85b31462055aa2ede1");
  });

  it("defines the approved palette as design tokens", () => {
    const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8").toLowerCase();
    for (const [token, hex] of [
      ["--navy", "#00103d"],
      ["--sapphire", "#0042ac"],
      ["--ocean", "#00d3fb"],
      ["--jade", "#83fd80"],
    ]) {
      expect(css).toContain(`${token}: ${hex};`);
    }
  });

  it("writes the full descriptor exactly wherever it appears", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|css)$/.test(f) && !f.endsWith(".test.ts")) files.push(p);
      }
    };
    walk(join(ROOT, "src"));
    const exact = "Business Development • AI Engineering • Market Growth";
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      // Any line naming all three in sequence must use the exact wording and bullet separators.
      for (const line of text.split("\n")) {
        if (/Business Development.{0,6}AI Engineering.{0,6}Market Growth/.test(line)) expect(line, f).toContain(exact);
      }
    }
  });
});
