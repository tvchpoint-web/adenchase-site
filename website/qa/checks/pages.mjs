import { NOT_FOUND_ROUTE, ROUTES, VIEWPORTS } from "../config.mjs";
import { ensureDir, fail, pass, settlePage, slug, warn, watchErrors } from "../lib/util.mjs";

/**
 * Pages: every route at desktop, tablet and mobile. Full-page screenshots for visual review,
 * horizontal overflow, console/page errors, failed requests, broken internal links, and the
 * 404 route.
 */
export async function checkPages({ browser, base, out }) {
  const results = [];
  const shots = [];
  const links = new Set();

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const { width, height, ...device } = vp;
    const ctx = await browser.newContext({ viewport: { width, height }, ...device });
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

      const file = `screens/${vpName}/${slug(route)}.png`;
      ensureDir(`${out}/${file}`);
      await page.screenshot({ path: `${out}/${file}`, fullPage: true });
      shots.push({ viewport: vpName, route, file });

      if (vpName === "desktop") {
        const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
        hrefs.filter((h) => h && h.startsWith("/") && !h.startsWith("//")).forEach((h) => links.add(h.split("#")[0] || "/"));
      }
      if (errors.length) results.push(fail(`${label}: ${errors.length} runtime error(s)`, errors.slice(0, 5).join("\n")));
      await page.close();
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
