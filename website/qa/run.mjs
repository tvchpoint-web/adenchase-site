#!/usr/bin/env node
/**
 * ADEN-CHASE QA — one command that produces the evidence a release needs.
 *
 *   npm run qa                 build, then run every check against the production server
 *   npm run qa:only            run every check against the existing build
 *   node qa/run.mjs --only=pages,motion,a11y,perf   pick checks
 *   node qa/run.mjs --base=https://…                test another server (no local server started)
 *
 * Output: qa-report/index.html (open it), qa-report/summary.json. Exit code 1 on any failure.
 */
import { chromium } from "playwright";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { OUT_DIR, SERVER } from "./config.mjs";
import { startServer } from "./lib/util.mjs";
import { writeReport } from "./lib/report.mjs";
import { checkPages } from "./checks/pages.mjs";
import { checkMotion } from "./checks/motion.mjs";
import { checkA11y } from "./checks/a11y.mjs";
import { checkPerf } from "./checks/perf.mjs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const ALL = ["pages", "motion", "a11y", "perf"];
const only = args.only ? args.only.split(",") : ALL;
const unknown = only.filter((c) => !ALL.includes(c));
if (unknown.length) {
  console.error(`Unknown check(s): ${unknown.join(", ")}. Choose from ${ALL.join(", ")}.`);
  process.exit(2);
}

const out = OUT_DIR;
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const started = Date.now();
let server = null;
let browser = null;
const sections = [];
const run = async (name, fn) => {
  const t = Date.now();
  process.stdout.write(`• ${name} … `);
  try {
    const r = await fn();
    sections.push({ ...r, seconds: Math.round((Date.now() - t) / 1000) });
    const f = r.results.filter((x) => x.status === "fail").length;
    const w = r.results.filter((x) => x.status === "warn").length;
    console.log(`${f ? `${f} fail` : "ok"}${w ? `, ${w} warn` : ""} (${Math.round((Date.now() - t) / 1000)} s)`);
  } catch (e) {
    console.log("crashed");
    sections.push({ name, results: [{ status: "fail", title: `${name} check crashed`, detail: String(e?.stack || e) }] });
  }
};

let base = args.base;
try {
  if (!base) {
    console.log(`Starting production server on :${SERVER.port} …`);
    server = await startServer(SERVER.port, SERVER.startTimeoutMs);
    base = server.base;
  }
  browser = await chromium.launch();
  if (only.includes("pages")) await run("Pages & responsive", () => checkPages({ browser, base, out }));
  if (only.includes("motion")) await run("Motion & Living Circuit", () => checkMotion({ browser, base, out }));
  if (only.includes("a11y")) await run("Accessibility", () => checkA11y({ browser, base, out }));
  if (only.includes("perf")) await run("Performance & Lighthouse", () => checkPerf({ chromium, base, out }));
} catch (e) {
  sections.push({ name: "QA setup", results: [{ status: "fail", title: "QA could not start", detail: String(e?.stack || e) }] });
} finally {
  await browser?.close();
  server?.stop();
}

const all = sections.flatMap((s) => s.results);
const summary = {
  base,
  date: new Date().toISOString(),
  seconds: Math.round((Date.now() - started) / 1000),
  fail: all.filter((r) => r.status === "fail").length,
  warn: all.filter((r) => r.status === "warn").length,
  pass: all.filter((r) => r.status === "pass").length,
  sections,
};
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2));
writeReport(out, summary);

console.log(`\n${summary.fail ? "FAIL" : "PASS"} — ${summary.pass} pass, ${summary.warn} warn, ${summary.fail} fail in ${summary.seconds} s`);
for (const r of all.filter((x) => x.status === "fail")) console.log(`  ✗ ${r.title}`);
console.log(`Report: ${out}/index.html`);
process.exit(summary.fail ? 1 : 0);
