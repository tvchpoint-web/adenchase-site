# QA harness and project profile

## The reference harness

The ADEN-CHASE site (`website/qa/` in the `adenchase-site` repository) is the reference implementation. To set up a new client site, copy that folder, then adjust `qa/config.mjs` (routes, viewports, thresholds) and any project-specific motion checks.

| Command | What it does |
| --- | --- |
| `npm run qa` | production build, then every check → `qa-report/index.html` + `summary.json`; exit 1 on any failure |
| `npm run qa:only` | the same, against the existing build |
| `npm run qa:visual` | pages + motion only |
| `npm run qa:a11y` / `qa:perf` | accessibility / Lighthouse only |
| `node qa/run.mjs --base=<url>` | run against another server, e.g. an authorised preview |
| `node qa/run.mjs --browser=webkit` | run in WebKit, when it is installed |

Checks, and what each proves:

- **Pages:** every route at three viewports renders with no errors, failed requests, horizontal overflow or broken links; unknown routes return 404. Typography: the brand font is loaded (no silent fallback) and no text is clipped.
- **Motion:**
  - frames of the opening and the scroll sequence;
  - a scroll video for motion review;
  - signature-effect geometry, e.g. a routed signal never crossing content;
  - reveal quality: the light is brighter near the source than away from it;
  - reverse-scroll retrace;
  - the reduced-motion state.
- **Accessibility:** axe-core WCAG 2.2 A/AA; skip link; visible focus.
- **Performance:** Lighthouse in mobile and desktop form factors, with CLS and the accessibility score as hard limits and LCP and TBT as warnings, reporting the LCP element.

Dev-dependencies: `playwright` (pinned to the installed browser build), `axe-core`, `lighthouse`.

## What a project profile (CLAUDE.md) must contain

1. **Isolation.** Which repositories, apps and credentials must never be touched.
2. **Brand.**
   - Palette tokens.
   - Typography.
   - Logo master file, permitted derived layers, and the hash test.
   - Descriptor or tagline, worded exactly.
3. **Visual, photography and motion standards**, including any signature effect and its rules.
4. **Approved references.** Where they live and what each one sets the standard for.
5. **Commands and thresholds.**
6. **Deployment.** Preview procedure; production and DNS need explicit approval.
7. **Environment limits.** What cannot be verified here, so reports say so.
