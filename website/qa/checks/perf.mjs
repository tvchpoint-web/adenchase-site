import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { writeFileSync } from "node:fs";
import { PERF_ROUTES, THRESHOLDS } from "../config.mjs";
import { ensureDir, fail, pass, slug, warn } from "../lib/util.mjs";

const PORT = 9333;
const pct = (v) => `${Math.round(v * 100)}`;
/** The first DOM node referenced in an audit's details (Lighthouse 13 nests it inside insight tables). */
const findNode = (o, depth = 0) => {
  if (!o || typeof o !== "object" || depth > 8) return undefined;
  if (o.type === "node" && o.snippet) return `${o.snippet.slice(0, 160)} (${o.selector})`;
  for (const v of Object.values(o)) {
    const hit = findNode(v, depth + 1);
    if (hit) return hit;
  }
  return undefined;
};

/**
 * Performance: Lighthouse (performance, accessibility, best practices, SEO) for key routes in
 * mobile and desktop form factors, run in the same Chromium Playwright uses. Lab numbers from a
 * GPU-less container are indicative; CLS and the accessibility score are hard limits.
 */
export async function checkPerf({ chromium, base, out }) {
  const results = [];
  const rows = [];
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${PORT}`] });
  try {
    for (const route of PERF_ROUTES) {
      for (const formFactor of ["mobile", "desktop"]) {
        const flags = { port: PORT, output: "html", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
        const runner = await lighthouse(base + route, flags, formFactor === "desktop" ? desktopConfig : undefined);
        const lhr = runner.lhr;
        const file = `lighthouse/${slug(route)}-${formFactor}.html`;
        ensureDir(`${out}/${file}`);
        writeFileSync(`${out}/${file}`, runner.report);
        const a = lhr.audits;
        const row = {
          route,
          formFactor,
          file,
          scores: Object.fromEntries(Object.entries(lhr.categories).map(([k, c]) => [k, c.score])),
          lcp: a["largest-contentful-paint"]?.numericValue,
          cls: a["cumulative-layout-shift"]?.numericValue,
          tbt: a["total-blocking-time"]?.numericValue,
          fcp: a["first-contentful-paint"]?.numericValue,
          lcpElement: findNode(a["lcp-breakdown-insight"]?.details) ?? findNode(a["largest-contentful-paint-element"]?.details) ?? "",
        };
        rows.push(row);
        const label = `${route} (${formFactor})`;
        if (lhr.runtimeError) results.push(fail(`${label}: Lighthouse runtime error`, `${lhr.runtimeError.code}: ${lhr.runtimeError.message}`));
        for (const [cat, rule] of Object.entries(THRESHOLDS.lighthouse)) {
          const min = typeof rule.min === "number" ? rule.min : rule.min[formFactor];
          const score = row.scores[cat];
          if (score == null) {
            if (rule.level === "fail") results.push(fail(`${label}: no ${cat} score (Lighthouse could not measure it)`));
            continue;
          }
          if (score < min) results.push((rule.level === "fail" ? fail : warn)(`${label}: ${cat} ${pct(score)} < ${pct(min)}`));
        }
        if (typeof row.cls !== "number") results.push(fail(`${label}: CLS could not be measured`));
        else if (row.cls > THRESHOLDS.cls.max) results.push(fail(`${label}: CLS ${row.cls.toFixed(3)} > ${THRESHOLDS.cls.max}`));
        if (row.lcp > THRESHOLDS.lcpMs.max[formFactor]) results.push(warn(`${label}: LCP ${Math.round(row.lcp)} ms > ${THRESHOLDS.lcpMs.max[formFactor]} ms (lab, simulated throttling)`, row.lcpElement ? `LCP element: ${row.lcpElement}` : ""));
        if (row.tbt > THRESHOLDS.tbtMs.max[formFactor]) results.push(warn(`${label}: TBT ${Math.round(row.tbt)} ms > ${THRESHOLDS.tbtMs.max[formFactor]} ms (lab)`));
      }
    }
  } finally {
    await browser.close();
  }
  if (!results.some((r) => r.status === "fail")) results.unshift(pass(`Lighthouse ran on ${rows.length} route/form-factor combinations; no hard limits exceeded`));
  return { name: "Performance & Lighthouse", results, rows };
}
