/**
 * ADEN-CHASE QA configuration. One place for what is tested, at which sizes, and what counts as
 * a failure. Thresholds marked "warn" are reported but do not fail the run, because this sandbox
 * renders without a GPU and Lighthouse simulates throttling; "fail" thresholds are hard limits.
 */
export const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  tablet: { width: 834, height: 1194, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  mobile: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
};

/** Every public route, plus one unknown path that must answer 404. */
export const ROUTES = ["/", "/approach", "/expertise", "/capabilities", "/engagement"];
export const NOT_FOUND_ROUTE = "/qa-route-that-does-not-exist";

/** Routes Lighthouse audits (each in mobile and desktop form factors). */
export const PERF_ROUTES = ["/", "/approach"];

export const THRESHOLDS = {
  // Accessibility (axe-core, WCAG 2.2 A/AA). Violations at these impacts fail the run.
  axeFailImpacts: ["critical", "serious"],
  // Lighthouse category scores (0–1).
  lighthouse: {
    accessibility: { min: 0.9, level: "fail" },
    "best-practices": { min: 0.9, level: "warn" },
    seo: { min: 0.9, level: "warn" },
    performance: { min: { desktop: 0.85, mobile: 0.7 }, level: "warn" },
  },
  // Core Web Vitals from Lighthouse (lab).
  cls: { max: 0.1, level: "fail" },
  lcpMs: { max: { desktop: 2500, mobile: 4000 }, level: "warn" },
  tbtMs: { max: { desktop: 200, mobile: 600 }, level: "warn" },
  // Living Circuit: the route may never cross content; near-misses inside this margin are warnings.
  circuitNearMissPx: 6,
  // Reverse scrolling: the signal head must return to the same place (px).
  reverseTolerancePx: 4,
};

export const SERVER = { port: 3123, startTimeoutMs: 60_000 };
export const OUT_DIR = "qa-report";
