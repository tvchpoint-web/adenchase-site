import { OVERLAP_EXTRA_VIEWPORTS, THRESHOLDS, VIEWPORTS } from "../config.mjs";
import sharp from "sharp";
import { renameSync } from "node:fs";
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

/**
 * Measures how much the signal's light changes the frame near the signal versus far from it, by
 * comparing the frame with the light layers hidden. Returns null when the signal is off-screen.
 */
async function revealContrast(page, litPng) {
  const headPt = await page.evaluate(() => {
    const g = document.querySelector(".living-circuit [data-glow]");
    if (!g || getComputedStyle(g).opacity === "0") return null;
    const m = new DOMMatrix(getComputedStyle(g).transform);
    return { x: m.m41 + 90, y: m.m42 + 90, w: innerWidth, h: innerHeight };
  });
  if (!headPt || headPt.x < 0 || headPt.y < 0 || headPt.x > headPt.w || headPt.y > headPt.h) return null;
  const tag = await page.addStyleTag({ content: ".lc-lamp,.lc-spec,.lc-glow{visibility:hidden!important;transition:none!important}" });
  await sleep(120);
  const dark = await page.screenshot();
  await tag.evaluate((n) => n.remove());
  await sleep(450); // lamps fade back (320 ms opacity transition)
  const lit2 = await page.screenshot();
  const [a, b, a2] = await Promise.all([litPng, dark, lit2].map((buf) => sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true })));
  const { width, height } = a.info;
  const R = Math.min(140, width * 0.18);
  let nearSum = 0;
  let nearN = 0;
  let farSum = 0;
  let farN = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const d = Math.hypot(x - headPt.x, y - headPt.y);
      // Ignore pixels that change between the two lit captures (other animation on the page, e.g.
      // a demo playing), so only the light's own contribution is measured.
      if (Math.abs(a.data[y * width + x] - a2.data[y * width + x]) > 3) continue;
      const diff = Math.abs(a.data[y * width + x] - b.data[y * width + x]);
      if (d < R) {
        nearSum += diff;
        nearN++;
      } else if (d > R * 3.5) {
        farSum += diff;
        farN++;
      }
    }
  }
  return { near: nearN ? nearSum / nearN : 0, far: farN ? farSum / farN : 0 };
}

/** Records a continuous scroll through the homepage and back up, for motion review. */
async function scrollVideo(browser, base, out, vpName, vp) {
  const dir = `${out}/motion/video-tmp-${vpName}`;
  const { width, height, ...device } = vp;
  const size = vpName === "desktop" ? { width: 960, height: 600 } : { width, height };
  const ctx = await browser.newContext({ viewport: { width, height }, ...device, recordVideo: { dir, size } });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await sleep(3000); // the intro
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const step = Math.round(height * 0.06);
  // scrollBy rather than mouse.wheel: mobile WebKit has no wheel events.
  for (let y = 0; y < total; y += step) {
    await page.evaluate((d) => window.scrollBy(0, d), step);
    await sleep(45);
  }
  await sleep(800);
  for (let y = 0; y < total * 0.35; y += step) {
    await page.evaluate((d) => window.scrollBy(0, d), -step);
    await sleep(45);
  }
  await sleep(800);
  const video = page.video();
  await ctx.close();
  const file = `motion/scroll-${vpName}.webm`;
  renameSync(await video.path(), `${out}/${file}`);
  return file;
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

  // Per viewport. Headless WebKit on Linux occasionally crashes its renderer (no GPU, very large
  // layers); a crashed viewport is retried once in a fresh context and reported if it crashes again.
  const runViewport = async (vpName, vp) => {
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

      // Frames of the light travelling through the story, each with a reveal-quality measurement:
      // the light's contribution (frame with the light minus the same frame without it) must be
      // concentrated around the signal and near zero far from it.
      const reveals = [];
      for (let i = 0; i < 8; i++) {
        const y = geo.top + (geo.height * (i + 0.5)) / 8 - vp.height * 0.56;
        await page.evaluate((v) => window.scrollTo(0, v), Math.round(y));
        await sleep(1100);
        const f = `motion/${vpName}/circuit-${i + 1}.png`;
        ensureDir(`${out}/${f}`);
        const lit = await page.screenshot({ path: `${out}/${f}` });
        frames.push({ viewport: vpName, label: `Circuit · ${i + 1}/8`, file: f });
        const r = await revealContrast(page, lit);
        if (r) reveals.push(r);
      }
      if (reveals.length) {
        const near = reveals.reduce((a, r) => a + r.near, 0) / reveals.length;
        const far = Math.max(...reveals.map((r) => r.far));
        const detail = `mean light contribution near the signal ${near.toFixed(1)}/255, worst far from it ${far.toFixed(2)}/255 (${reveals.length} frames)`;
        const ok = near >= THRESHOLDS.reveal.minNear && far <= THRESHOLDS.reveal.maxFar;
        results.push(ok ? pass(`${vpName}: circuit reveal is localised to the signal`, detail) : warn(`${vpName}: circuit reveal not localised as specified`, detail));
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
  };
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const mark = { results: results.length, frames: frames.length };
    try {
      await runViewport(vpName, vp);
    } catch (e) {
      results.length = mark.results;
      frames.length = mark.frames;
      try {
        await runViewport(vpName, vp);
        results.push(warn(`${vpName}: browser renderer crashed once; the retry completed`, String(e?.message || e).split("\n")[0]));
      } catch (e2) {
        results.push(warn(`${vpName}: motion checks not completed (browser renderer crashed twice)`, String(e2?.message || e2).split("\n")[0]));
      }
    }
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
  // Engines serialise the offset differently ("0" in Chromium, "0px" in WebKit).
  const ok = rm.stage === "none" && parseFloat(rm.lit) === 0 && rm.logo > 0.95;
  results.push(ok ? pass("Reduced motion: no moving light, full route drawn, mark shown at rest") : fail("Reduced motion state incorrect", JSON.stringify(rm)));
  await ctx.close();

  // Opening copy hand-offs: step through the whole pinned timeline and fail if any two visible copy
  // layers' text lines overlap (e.g. the outgoing headline over incoming slice copy, or captions
  // stacked on top of each other). Reduced motion makes each step settle at once; the opacity
  // windows are identical to the animated version.
  for (const [vpName, vp] of Object.entries({ ...VIEWPORTS, ...OVERLAP_EXTRA_VIEWPORTS })) {
    const c = await context(browser, vp, { reducedMotion: "reduce" });
    const pg = await c.newPage();
    await pg.goto(base + "/", { waitUntil: "networkidle" });
    const span = await pg.evaluate(() => {
      const t = document.querySelector('[data-k="wmText"]')?.closest(".relative");
      return t ? { top: t.getBoundingClientRect().top + scrollY, h: t.offsetHeight - innerHeight } : null;
    });
    if (!span) continue;
    const clashes = [];
    for (let i = 0; i <= 100; i += 1) {
      await pg.evaluate((y) => window.scrollTo(0, y), Math.round(span.top + (span.h * i) / 100));
      await sleep(60);
      const hit = await pg.evaluate(() => {
        const keys = ["f1tag", "f2", "f3", "f4", "f5", "f6", "sliceCopy0", "sliceCopy1", "sliceCopy2", "sliceCopy3", "portalLabel0", "portalLabel1", "portalLabel2"];
        const lines = [];
        for (const k of keys) {
          const el = document.querySelector(`[data-k="${k}"]`);
          if (!el) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent.trim() || n.parentElement.closest(".sr-only")) continue;
            range.selectNodeContents(n);
            for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) lines.push({ k, r });
          }
        }
        for (let a = 0; a < lines.length; a++)
          for (let b = a + 1; b < lines.length; b++) {
            const A = lines[a];
            const B = lines[b];
            if (A.k === B.k) continue;
            const ox = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
            const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
            if (ox > 2 && oy > 2) return `${A.k} × ${B.k}`;
          }
        return null;
      });
      if (hit) clashes.push(`${i}%: ${hit}`);
    }
    results.push(clashes.length ? fail(`${vpName}: opening copy overlaps at ${clashes.length} timeline step(s)`, clashes.slice(0, 8).join("\n")) : pass(`${vpName}: opening copy never overlaps (101 timeline steps)`));
    await c.close();
  }

  // Continuous scroll videos (down, then partly back up) for motion review.
  const videos = [];
  for (const vpName of ["desktop", "mobile"]) {
    try {
      videos.push({ viewport: vpName, file: await scrollVideo(browser, base, out, vpName, VIEWPORTS[vpName]) });
    } catch (e) {
      results.push(warn(`${vpName}: scroll video not recorded`, String(e?.message || e)));
    }
  }
  if (videos.length) results.push(pass(`Scroll videos recorded for motion review (${videos.map((v) => v.viewport).join(", ")})`));

  return { name: "Motion & Living Circuit", results, frames, videos };
}
