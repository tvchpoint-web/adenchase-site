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

  const files: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(f) && !f.endsWith(".test.ts")) files.push(p);
    }
  };
  walk(join(ROOT, "src"));

  it("writes the full descriptor exactly wherever it appears", () => {
    const exact = "Business Development • AI Engineering • Market Growth";
    // Descriptor-style lists (the three names joined by separators) must be the exact descriptor;
    // ordinary sentences that mention the disciplines are prose, not the descriptor.
    const listed = /Business \w+\s*[•·|/–]\s*AI Engineering\s*[•·|/–]\s*Market Growth/;
    for (const f of files) {
      for (const line of readFileSync(f, "utf8").split("\n")) {
        const m = line.match(listed);
        if (m) expect(m[0], f).toBe(exact);
      }
    }
  });

  it("uses the approved discipline name, never the retired 'Business Strategy'", () => {
    const docs = ["README.md", "CLAUDE.md", "public/photos/CREDITS.md", "design/REFERENCES.md"].map((f) => join(ROOT, f));
    const offenders = [...files, ...docs].filter((f) => /Business Strategy/i.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
