/**
 * npm run editions — generate the distribution assets of every published edition of
 * The Opportunity Perspective from the same source as the website:
 *
 *   public/editions/NNN/ADEN-CHASE-The-Opportunity-Perspective-Issue-NNN.pdf   (US Letter)
 *   public/editions/NNN/opportunity-perspective-NNN-1200x630.jpg              (LinkedIn, Facebook, Open Graph)
 *   public/editions/NNN/opportunity-perspective-NNN-1080x1350.jpg             (Instagram, portrait)
 *   public/editions/NNN/opportunity-perspective-NNN-1080x1920.jpg             (Stories, WhatsApp Status)
 *   public/editions/manifest.json                                              (fingerprints; checked by npm test)
 *
 * It builds the site with the (otherwise absent) template routes, renders them in the local
 * Chromium, and finally rebuilds the site normally. No external service is involved.
 */
import { spawnSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const ROOT = join(import.meta.dirname, "..");
const PORT = 3417;
const BASE = `http://127.0.0.1:${PORT}`;
const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log("• Building with edition templates…");
run("npx", ["next", "build"], { EDITION_TEMPLATES: "1" });
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], { cwd: ROOT, stdio: "ignore", env: { ...process.env, EDITION_TEMPLATES: "1" } });

try {
  for (let i = 0; i < 60; i++) {
    if (await fetch(`${BASE}/editions/list`).then((r) => r.ok, () => false)) break;
    await sleep(500);
  }
  const editions = await (await fetch(`${BASE}/editions/list`)).json();
  const browser = await chromium.launch();
  const manifest = {};
  for (const e of editions) {
    console.log(`• ${e.slug}`);
    const out = (p) => {
      const f = join(ROOT, "public", p);
      mkdirSync(dirname(f), { recursive: true });
      return f;
    };
    // PDF: US Letter, running header and page numbers in the margins, selectable text, live links.
    const page = await browser.newPage();
    await page.goto(`${BASE}/editions/${e.slug}/print`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const fingerprint = await page.getAttribute(".pdf", "data-fingerprint");
    if (fingerprint !== e.fingerprint) throw new Error("fingerprint mismatch");
    const small = "font-family: Helvetica, Arial, sans-serif; font-size: 7px; color: #6b7794; width: 100%; padding: 0 0.95in; display: flex; justify-content: space-between; letter-spacing: 0.06em;";
    await page.pdf({
      path: out(e.assets.pdf),
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="${small}"><span>THE OPPORTUNITY PERSPECTIVE · ISSUE ${String(e.issue).padStart(3, "0")}</span><span>ADEN-CHASE STRATEGIES</span></div>`,
      footerTemplate: `<div style="${small}"><span>adenchase.com</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
    await page.close();
    // Graphics: exact pixel sizes.
    for (const [format, file, w, h] of [["landscape", e.assets.landscape, 1200, 630], ["portrait", e.assets.portrait, 1080, 1350], ["story", e.assets.story, 1080, 1920]]) {
      const g = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      await g.goto(`${BASE}/editions/${e.slug}/graphic/${format}`, { waitUntil: "networkidle" });
      await g.evaluate(() => document.fonts.ready);
      await g.screenshot({ path: out(file), type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: w, height: h } });
      await g.close();
    }
    manifest[e.slug] = { issue: e.issue, fingerprint: e.fingerprint, url: e.url, files: e.assets, pdfBytes: statSync(out(e.assets.pdf)).size };
    console.log(`  PDF ${(manifest[e.slug].pdfBytes / 1024).toFixed(0)} KB, graphics 1200×630, 1080×1350, 1080×1920`);
  }
  await browser.close();
  writeFileSync(join(ROOT, "public/editions/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
} finally {
  server.kill("SIGTERM");
}
console.log("• Rebuilding without templates…");
run("npx", ["next", "build"]);
console.log("Done.");
