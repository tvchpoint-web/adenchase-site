import { NOT_FOUND_ROUTE, ROUTES, VIEWPORTS } from "../config.mjs";
import { ensureDir, fail, pass, settlePage, slug, warn, watchErrors } from "../lib/util.mjs";

/**
 * Pages: every route at desktop, tablet and mobile. Full-page screenshots for visual review,
 * horizontal overflow, console/page errors, failed requests, broken internal links, and the
 * 404 route.
 */
export async function checkPages({ browser, base, out }) {
  const webkit = browser.browserType().name() === "webkit";
  const results = [];
  const shots = [];
  const links = new Set();

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const { width, height, ...device } = vp;
    const newCtx = () => browser.newContext({ viewport: { width, height }, ...device });
    let ctx = await newCtx();
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      const errors = watchErrors(page, base);
      const res = await page.goto(base + route, { waitUntil: "networkidle" });
      await settlePage(page);
      const label = `${route} @ ${vpName}`;
      if (!res || res.status() !== 200) results.push(fail(`${label}: HTTP ${res?.status()}`));

      // The page body must never scroll sideways.
      const overflow = await page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const sw = document.documentElement.scrollWidth;
        if (sw <= w + 1) return null;
        const wide = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.right > w + 1 && getComputedStyle(el).position !== "fixed";
          })
          .slice(0, 3)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")}`);
        return { sw, w, wide };
      });
      if (overflow) results.push(fail(`${label}: horizontal overflow`, `page is ${overflow.sw}px wide in a ${overflow.w}px viewport; e.g. ${overflow.wide.join(", ")}`));

      // Typography: the brand font actually rendered (no silent fallback), and no clipped text.
      const type = await page.evaluate(async () => {
        await document.fonts.ready;
        const families = new Set();
        document.querySelectorAll("h1, h2, h3, p, a, button, li, label").forEach((el) => {
          if (el.closest("[aria-hidden='true'], .sr-only") || !el.textContent.trim()) return;
          families.add(getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/['"]/g, ""));
        });
        const missing = [...families].filter((f) => !document.fonts.check(`16px "${f}"`) || ![...document.fonts].some((ff) => ff.family.replace(/['"]/g, "") === f && ff.status === "loaded"));
        const clipped = [];
        document.querySelectorAll("body *").forEach((el) => {
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!own || el.closest("[aria-hidden='true'], .sr-only")) return;
          const cs = getComputedStyle(el);
          if (cs.overflowX === "visible" && cs.overflowY === "visible" && cs.textOverflow !== "ellipsis") return;
          if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 4) clipped.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 40)}"`);
        });
        return { families: [...families], missing, clipped: clipped.slice(0, 6) };
      });
      if (type.missing.length) results.push(fail(`${label}: text renders in a fallback font`, `not loaded: ${type.missing.join(", ")}`));
      if (type.clipped.length) results.push(warn(`${label}: possibly clipped text`, type.clipped.join("\n")));

      if (vpName === "desktop") {
        const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
        hrefs.filter((h) => h && h.startsWith("/") && !h.startsWith("//")).forEach((h) => links.add(h.split("#")[0] || "/"));
      }
      if (errors.length) results.push(fail(`${label}: ${errors.length} runtime error(s)`, errors.slice(0, 5).join("\n")));

      // Full-page screenshot, taken last. Headless WebKit on Linux can crash on very tall bitmaps,
      // so its captures are capped at 8000px; a renderer crash is reported and the run continues.
      const file = `screens/${vpName}/${slug(route)}.png`;
      ensureDir(`${out}/${file}`);
      try {
        if (webkit) {
          const h = await page.evaluate(() => document.documentElement.scrollHeight);
          await page.screenshot({ path: `${out}/${file}`, fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(h, 8000) } });
        } else {
          await page.screenshot({ path: `${out}/${file}`, fullPage: true });
        }
        shots.push({ viewport: vpName, route, file });
        await page.close();
      } catch (e) {
        results.push(warn(`${label}: screenshot failed (browser renderer crashed)`, String(e?.message || e).split("\n")[0]));
        await ctx.close().catch(() => {});
        ctx = await newCtx();
      }
    }
    await ctx.close();
  }

  // Internal links.
  const ctx = await browser.newContext();
  const broken = [];
  for (const href of links) {
    const r = await ctx.request.get(base + href, { maxRedirects: 3 }).catch((e) => ({ status: () => `error ${e.message}` }));
    if (r.status() !== 200) broken.push(`${href} → ${r.status()}`);
  }
  results.push(broken.length ? fail(`${broken.length} broken internal link(s)`, broken.join("\n")) : pass(`${links.size} internal links resolve`));

  // Unknown routes must 404 (not 200 or 500).
  const nf = await ctx.request.get(base + NOT_FOUND_ROUTE);
  results.push(nf.status() === 404 ? pass("Unknown route answers 404") : fail(`Unknown route answers ${nf.status()}`));
  await ctx.close();

  const failures = results.filter((r) => r.status === "fail").length;
  if (!failures) results.unshift(pass(`${ROUTES.length} routes × ${Object.keys(VIEWPORTS).length} viewports render without errors or overflow`));
  if (shots.length === 0) results.push(warn("No screenshots captured"));
  return { name: "Pages & responsive", results, shots };
}
