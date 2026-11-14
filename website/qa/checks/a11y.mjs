import { createRequire } from "node:module";
import { ROUTES, THRESHOLDS, VIEWPORTS } from "../config.mjs";
import { fail, pass, settlePage, warn } from "../lib/util.mjs";

const require = createRequire(import.meta.url);
const AXE = require.resolve("axe-core/axe.min.js");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Accessibility: axe-core (WCAG 2.2 A/AA) on every route at desktop and mobile, after the page has
 * fully revealed, plus keyboard checks: a skip link first in tab order and a visible focus style.
 */
export async function checkA11y({ browser, base }) {
  const results = [];
  const violations = [];

  for (const vpName of ["desktop", "mobile"]) {
    const { width, height, ...device } = VIEWPORTS[vpName];
    const ctx = await browser.newContext({ viewport: { width, height }, ...device });
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      await page.goto(base + route, { waitUntil: "networkidle" });
      await settlePage(page);
      // Let scroll-smoothed layers (the opening's copy) finish easing back to their resting state,
      // so contrast is measured on settled content, not mid-fade.
      await page.waitForTimeout(2000);
      await page.addScriptTag({ path: AXE });
      const res = await page.evaluate((tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] }), TAGS);
      for (const v of res.violations) {
        violations.push({ route, viewport: vpName, id: v.id, impact: v.impact, help: v.help, url: v.helpUrl, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) });
      }
      await page.close();
    }
    await ctx.close();
  }

  // Keyboard: first Tab lands on the skip link; focus is visibly styled.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + "/approach", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = el ? getComputedStyle(el) : null;
    return { text: el?.textContent?.trim().slice(0, 40), href: el?.getAttribute("href"), outline: cs ? cs.outlineStyle !== "none" || cs.boxShadow !== "none" : false };
  });
  results.push(focus.href === "#main" ? pass("First Tab reaches the skip link") : warn("First Tab does not reach a skip link", JSON.stringify(focus)));
  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement);
    return cs.outlineStyle !== "none" || cs.boxShadow !== "none";
  });
  results.push(ring ? pass("Keyboard focus is visibly styled") : fail("Keyboard focus has no visible style"));
  await ctx.close();

  // Group violations by rule.
  const byRule = new Map();
  for (const v of violations) {
    const k = v.id;
    if (!byRule.has(k)) byRule.set(k, { ...v, where: [] });
    byRule.get(k).where.push(`${v.route} @ ${v.viewport} (${v.nodes})`);
  }
  for (const v of byRule.values()) {
    const blocking = THRESHOLDS.axeFailImpacts.includes(v.impact);
    const item = (blocking ? fail : warn)(`${v.impact}: ${v.help} [${v.id}]`, `${v.where.join(", ")}\ne.g. ${v.sample.join(" | ")}\n${v.url}`);
    results.push(item);
  }
  if (!byRule.size) results.unshift(pass(`axe-core: no WCAG 2.2 A/AA violations on ${ROUTES.length} routes (desktop + mobile)`));
  return { name: "Accessibility", results, violations };
}
