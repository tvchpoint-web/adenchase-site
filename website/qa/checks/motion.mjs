import { THRESHOLDS, VIEWPORTS } from "../config.mjs";
import { ensureDir, fail, pass, sleep, warn, watchErrors } from "../lib/util.mjs";

const context = (browser, vp, extra = {}) => {
  const { width, height, ...device } = vp;
  return browser.newContext({ viewport: { width, height }, ...device, ...extra });
};

/**
 * In-page geometry for the Living Circuit: the route's polyline and the rectangles of every piece
 * of visible content — text measured line by line, images, photographs, controls and every drawn
 * surface (any background, border on any side, outline or shadow). It is measured from the
 * rendered page with a deliberately broader definition than the component uses, so a gap in the
 * component's notion of "content" shows up here as a failure.
 */
function circuitGeometry() {
  const host = document.querySelector(".living-circuit");
  if (!host) return null;
  const root = host.parentElement;
  const box = root.getBoundingClientRect();
  const d = host.querySelector("[data-lit-path]")?.getAttribute("d") || "";
  const pts = d
    .split(/[ML]/)
    .filter(Boolean)
    .map((s) => s.trim().split(/\s+/).map(Number));
  const end = root.querySelector("[data-trail-end]");
  const W = box.width;
  const visible = (el) => {
    for (let n = el; n && n !== root; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
      if (n.getAttribute && n.getAttribute("aria-hidden") === "true" && n !== el) return false;
    }
    return true;
  };
  const rects = [];
  const add = (r, what) => {
    if (r.width < 2 || r.height < 2) return;
    rects.push({ x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height, what });
  };
  // Text, line by line.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (t) => (t.textContent.trim() && !host.contains(t) && !(end && end.contains(t)) && t.parentElement && visible(t.parentElement) && !t.parentElement.closest(".sr-only") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const range = document.createRange();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    range.selectNodeContents(t);
    for (const r of range.getClientRects()) add(r, `text "${t.textContent.trim().slice(0, 30)}"`);
  }
  // Images, photographs and controls.
  root.querySelectorAll("img, video, canvas, [data-photo], a, button, input, select, textarea").forEach((el) => {
    if (host.contains(el) || (end && end.contains(el)) || !visible(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width > W * 0.92 && r.height > 260) return; // full-bleed section backdrops are not content
    add(r, `${el.tagName.toLowerCase()}${el.dataset.photo ? `[photo=${el.dataset.photo}]` : ""}`);
  });
  // Surfaces: cards, panels and chips (anything drawn with a background, border or shadow).
  root.querySelectorAll("section *").forEach((el) => {
    if (host.contains(el) || (end && end.contains(el)) || !visible(el)) return;
    const cs = getComputedStyle(el);
    const side = (s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Color`] !== "rgba(0, 0, 0, 0)" && cs[`border${s}Style`] !== "none";
    const surface = (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") || cs.backgroundImage !== "none" || ["Top", "Right", "Bottom", "Left"].some(side) || cs.boxShadow !== "none" || (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0);
    if (!surface || cs.position === "fixed") return;
    const r = el.getBoundingClientRect();
    if (r.width > W * 0.92 && r.height > 260) return;
    add(r, `surface ${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`);
  });
  return { pts, rects, height: box.height, top: box.top + scrollY, d };
}

function routeHits(geo, nearPx) {
  const hits = [];
  const near = [];
  for (let i = 1; i < geo.pts.length; i++) {
    const [x1, y1] = geo.pts[i - 1];
    const [x2, y2] = geo.pts[i];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(len / 2));
    for (let s = 0; s <= steps; s++) {
      const x = x1 + ((x2 - x1) * s) / steps;
      const y = y1 + ((y2 - y1) * s) / steps;
      for (const r of geo.rects) {
        const inside = x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
        if (inside) hits.push(`${r.what} at ${Math.round(x)},${Math.round(y)}`);
        else if (x > r.x - nearPx && x < r.x + r.w + nearPx && y > r.y - nearPx && y < r.y + r.h + nearPx) near.push(`${r.what} at ${Math.round(x)},${Math.round(y)}`);
      }
    }
  }
  return { hits: [...new Set(hits)], near: [...new Set(near)] };
}

async function openingFrames(page, url, out, vpName, frames) {
  // Intro plays on arrival; capture it mid-way and at rest, then step the pinned timeline.
  await page.goto(url, { waitUntil: "commit" });
  await page.waitForSelector('[data-k="wmText"]');
  await sleep(1300);
  const f0 = `motion/${vpName}/opening-intro.png`;
  ensureDir(`${out}/${f0}`);
  await page.screenshot({ path: `${out}/${f0}` });
  frames.push({ viewport: vpName, label: "Opening · intro (1.3 s)", file: f0 });
  await sleep(2000);
  const track = await page.evaluate(() => {
    const t = document.querySelector('[data-k="wmText"]')?.closest(".relative");
    return t ? { top: t.getBoundingClientRect().top + scrollY, h: t.offsetHeight - innerHeight } : null;
  });
  if (!track) return;
  for (const p of [0, 0.2, 0.45, 0.6, 0.74, 0.97]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(track.top + track.h * p));
    await sleep(1400);
    const f = `motion/${vpName}/opening-${String(Math.round(p * 100)).padStart(2, "0")}.png`;
    await page.screenshot({ path: `${out}/${f}` });
    frames.push({ viewport: vpName, label: `Opening · ${Math.round(p * 100)}%`, file: f });
  }
}

/**
 * Motion: the opening sequence frame by frame; the Living Circuit route (never crossing content),
 * frames of the light travelling, reverse-scroll consistency; and the reduced-motion state.
 */
export async function checkMotion({ browser, base, out }) {
  const results = [];
  const frames = [];

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await context(browser, vp);
    const page = await ctx.newPage();
    const errors = watchErrors(page, base);
    await openingFrames(page, base + "/", out, vpName, frames);

    // Lay the page out completely, then measure the circuit against the content.
    await page.evaluate(() => document.documentElement.classList.add("reveal-all"));
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 600) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await sleep(30);
    }
    await sleep(900); // the route is re-measured (debounced) after layout settles
    const geo = await page.evaluate(circuitGeometry);
    if (!geo || geo.pts.length < 2) {
      results.push(fail(`${vpName}: Living Circuit route not found`));
    } else {
      const { hits, near } = routeHits(geo, THRESHOLDS.circuitNearMissPx);
      if (hits.length) results.push(fail(`${vpName}: signal route crosses content at ${hits.length} point(s)`, hits.slice(0, 8).join("\n")));
      else results.push(pass(`${vpName}: signal route (${geo.pts.length} vertices) clears ${geo.rects.length} content boxes`));
      if (near.length) results.push(warn(`${vpName}: route passes within ${THRESHOLDS.circuitNearMissPx}px of content at ${near.length} point(s)`, near.slice(0, 6).join("\n")));

      // Frames of the light travelling through the story.
      for (let i = 0; i < 8; i++) {
        const y = geo.top + (geo.height * (i + 0.5)) / 8 - vp.height * 0.56;
        await page.evaluate((v) => window.scrollTo(0, v), Math.round(y));
        await sleep(1100);
        const f = `motion/${vpName}/circuit-${i + 1}.png`;
        ensureDir(`${out}/${f}`);
        await page.screenshot({ path: `${out}/${f}` });
        frames.push({ viewport: vpName, label: `Circuit · ${i + 1}/8`, file: f });
      }

      // Reverse scrolling must retrace the same states.
      const head = () => page.evaluate(() => document.querySelector(".living-circuit [data-head]")?.getAttribute("transform") || "");
      const parse = (t) => (t.match(/-?[\d.]+/g) || []).map(Number);
      const probes = [0.2, 0.5, 0.8].map((f) => Math.round(geo.top + geo.height * f - vp.height * 0.56));
      const forward = [];
      for (const y of probes) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await sleep(1500);
        forward.push(parse(await head()));
      }
      // Overshoot past the last probe, then come back through every probe in reverse.
      await page.evaluate((v) => window.scrollTo(0, v), Math.round(geo.top + geo.height * 0.95 - vp.height * 0.56));
      await sleep(1200);
      let worst = 0;
      for (let i = probes.length - 1; i >= 0; i--) {
        await page.evaluate((v) => window.scrollTo(0, v), probes[i]);
        await sleep(1500);
        const back = parse(await head());
        worst = Math.max(worst, Math.hypot((back[0] ?? 0) - (forward[i][0] ?? 0), (back[1] ?? 0) - (forward[i][1] ?? 0)));
      }
      results.push(worst <= THRESHOLDS.reverseTolerancePx ? pass(`${vpName}: reverse scrolling retraces the signal (max drift ${worst.toFixed(1)}px)`) : fail(`${vpName}: reverse scrolling drifts ${worst.toFixed(1)}px`));
    }
    if (errors.length) results.push(fail(`${vpName}: ${errors.length} runtime error(s) during motion`, errors.slice(0, 5).join("\n")));
    await ctx.close();
  }

  // Reduced motion: no moving light, full route drawn, the opening shows the authentic mark.
  const ctx = await context(browser, VIEWPORTS.desktop, { reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await sleep(1200);
  const rm = await page.evaluate(() => {
    const h = document.querySelector(".living-circuit");
    const wm = document.querySelector('[data-k="wmText"]');
    return {
      stage: h?.querySelector("[data-stage]") ? getComputedStyle(h.querySelector("[data-stage]")).display : "missing",
      lit: h?.querySelector("[data-lit-path]")?.style.strokeDashoffset,
      logo: wm ? Number(getComputedStyle(wm).opacity) : 0,
    };
  });
  const f = "motion/reduced-motion.png";
  ensureDir(`${out}/${f}`);
  await page.screenshot({ path: `${out}/${f}` });
  frames.push({ viewport: "desktop", label: "Reduced motion · arrival", file: f });
  const ok = rm.stage === "none" && rm.lit === "0" && rm.logo > 0.95;
  results.push(ok ? pass("Reduced motion: no moving light, full route drawn, mark shown at rest") : fail("Reduced motion state incorrect", JSON.stringify(rm)));
  await ctx.close();

  return { name: "Motion & Living Circuit", results, frames };
}
