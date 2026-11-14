import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/** Result helpers: every check reports items of { status: pass|warn|fail, title, detail }. */
export const pass = (title, detail = "") => ({ status: "pass", title, detail });
export const warn = (title, detail = "") => ({ status: "warn", title, detail });
export const fail = (title, detail = "") => ({ status: "fail", title, detail });

export const ensureDir = (file) => mkdirSync(dirname(file), { recursive: true });
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const slug = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-"));

/**
 * Starts `next start` for the existing production build and resolves once it answers.
 * The caller must run `next build` first (`npm run qa` does).
 */
export async function startServer(port, timeoutMs) {
  // Refuse to test whatever happens to be listening already (e.g. a stale server from an earlier run).
  const busy = await fetch(`http://127.0.0.1:${port}/`).then(() => true, () => false);
  if (busy) throw new Error(`Port ${port} is already in use. Stop the process listening there (it may be a stale QA server) and run again.`);
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  const base = `http://127.0.0.1:${port}`;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null) throw new Error(`next start exited early:\n${log}`);
    try {
      const res = await fetch(base + "/");
      if (res.ok) return { base, stop: () => child.kill("SIGTERM") };
    } catch {
      /* not up yet */
    }
    await sleep(400);
  }
  child.kill("SIGTERM");
  throw new Error(`next start did not answer within ${timeoutMs} ms. Did you run \`next build\`?\n${log}`);
}

/**
 * Brings a page to its fully revealed state: forces the editorial reveal, then scrolls through so
 * in-view effects and lazy photography load, and returns to the top.
 */
export async function settlePage(page) {
  await page.evaluate(() => document.documentElement.classList.add("reveal-all"));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(400, Math.round((await page.evaluate(() => innerHeight)) * 0.8));
  for (let y = 0; y < height; y += step) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await sleep(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState("networkidle").catch(() => {});
  await sleep(300);
}

/** Collects console errors, page errors and failed same-origin requests for a page. */
export function watchErrors(page, base) {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`page error: ${e.message}`));
  page.on("response", (r) => {
    if (r.url().startsWith(base) && r.status() >= 400 && !r.url().includes("qa-route-that-does-not-exist")) errors.push(`HTTP ${r.status()}: ${r.url().slice(base.length)}`);
  });
  page.on("requestfailed", (r) => {
    // Link prefetches (RSC payloads) cancelled because the test navigated away are not errors.
    if (r.failure()?.errorText === "net::ERR_ABORTED" && /[?&]_rsc=/.test(r.url())) return;
    if (r.url().startsWith(base)) errors.push(`request failed: ${r.url().slice(base.length)} (${r.failure()?.errorText})`);
  });
  return errors;
}
