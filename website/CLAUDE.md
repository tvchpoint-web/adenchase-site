# ADEN-CHASE Strategies website — working standards

Premium, distinctive, agency-level execution for a business-strategy firm whose three disciplines are
**Business Development • AI Engineering • Market Growth**. Every change is judged on how it looks,
moves and reads at desktop, tablet and phone sizes, not only on whether tests pass.

The user's words in the conversation always win over this file. This file wins over defaults.

---

## 1. Workflow for every substantial update

A substantial update is anything visible: a section, an animation, imagery, layout, typography,
copy, or more than a small bug fix. Follow these steps in order.

1. **Check skills first.** Look at the available skills and invoke the relevant ones before you start:
   - frontend implementation guidance: the `frontend-design` plugin skill, when installed;
   - critique and accessibility review: the `Design` plugin's `design-critique` and `accessibility-review`, when installed;
   - Next.js and React practice: the Vercel plugin's `nextjs`, `next-best-practices` and `react-best-practices`, when installed;
   - `code-review` and `simplify` before every commit; `security-review` when forms, headers, APIs or dependencies change.

   Say in the final report which skills were used and why any obvious one was not.
2. **Restate the brief.** In one short paragraph, write the goal, what must not change, and the acceptance criteria. Ask only when a decision is genuinely the user's.
3. **Design critique before building.** Compare the current state with the brief and any references, using screenshots from `npm run qa:visual`. Name the specific visual problems: composition, hierarchy, type, imagery, motion. Do this before writing code.
4. **Implement** to the standards in sections 3–7.
5. **Look at the result.** Run `npm run qa`. Open `qa-report/index.html` and actually inspect the screenshots and motion frames at all three sizes, comparing them with the brief and the references. Passing checks alone is not done.
6. **Review.** Run `npm run check` (lint, types, tests) and `/code-review`. Fix what they find, then run QA again.
7. **Deploy a preview** (section 8). Never deploy to production.
8. **Report.** Give the preview URL, what changed, what was verified and how, what could not be verified, which skills were used, and anything left open.

---

## 2. Commands

```bash
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + unit tests (incl. brand guards)
npm run qa           # production build, then every QA check → qa-report/index.html
npm run qa:only      # QA against the existing build (skip the build)
npm run qa:visual    # pages + motion only (screenshots, frames, circuit overlap, reverse scroll)
npm run qa:a11y      # axe-core WCAG 2.2 A/AA + keyboard checks
npm run qa:perf      # Lighthouse, mobile and desktop
node qa/run.mjs --base=https://…   # run QA against another server (no local build)
```

The QA harness lives in `qa/`, with all thresholds in `qa/config.mjs`. Hard failures make the run exit with code 1; warnings are reported. **A failing QA run blocks deployment.** Never weaken a threshold, skip a check, or narrow its scope to get a pass. Fix the cause, or report the failure to the user.

| Check | What it proves |
| --- | --- |
| Pages | Every route at 1440×900, 834×1194 and 390×844 renders with no runtime errors, failed requests, horizontal overflow or broken internal links; unknown routes return 404. Full-page screenshots for review. |
| Motion | Opening-sequence frames; Living Circuit frames; **the signal route never crosses text, images, controls or card surfaces** (measured independently of the component); reverse scrolling retraces the same states; reduced-motion state. |
| Accessibility | axe-core WCAG 2.2 A/AA on every route at desktop and mobile; serious or critical violations fail. The skip link and a visible focus style are checked. |
| Performance | Lighthouse on key routes. CLS above 0.1 or an accessibility score below 90 fails. Performance and LCP are warnings, because the sandbox has no GPU and throttling is simulated. |
| Brand guards (`npm test`) | The master logo is byte-identical; palette tokens exist; the full descriptor is written exactly. |

---

## 3. Brand system

**Palette.** These are the only brand colours, defined as tokens in `src/app/globals.css`:

| Token | Hex | Role |
| --- | --- | --- |
| `--navy` | `#00103D` | Midnight Navy: the ground of the whole site |
| `--sapphire` | `#0042AC` | Sapphire Blue: depth, gradients, secondary surfaces |
| `--ocean` | `#00D3FB` | Ocean Blue: restrained highlights, AI Engineering |
| `--jade` | `#83FD80` | Neon Jade: the signal, primary actions, emphasis; use sparingly |

The logo's own block colours (`BLOCK_COLOURS` in `src/lib/blocks.ts`) are used only where the mark's blocks appear. `BLOCK_TEXT` holds their readable text tints. Do not introduce new hues.

**Typography.** Use Inter Tight only (self-hosted, SIL OFL). Use the established type utilities (`type-display`, `type-headline`, `type-title`, `type-lede`, `type-label`) and do not set ad-hoc sizes. Headlines are tight and confident. Labels are uppercase with tracking.

**Descriptor.** Wherever the full descriptor is shown, it reads exactly **Business Development • AI Engineering • Market Growth**: that wording, that order, bullet separators. The unit tests enforce this.

**Headline.** The headline is "The future doesn't build itself."

---

## 4. The logo (authentic artwork only)

- The master file is `public/brand/aden-chase-logo.png` (1397×473). **Never modify, re-export or replace it.** A unit test checks its SHA-256.
- **Never redraw or approximate the logo**: no text, SVG, CSS shapes or AI-generated versions. Only the artwork and layers cut from it may be used.
- Derived layers, each cut from the master and each recomposing to it exactly:
  - `public/brand/aden-chase-logo-transparent.png`: colour-to-alpha.
  - `public/photos/logo-wordmark.webp` and `logo-{text,underline,strategies,descriptor}.webp`: layers for animation.
  - `public/photos/logo-block-{0,1,2}.png` and `public/brand/aden-chase-blocks.png`: the three blocks.
- The block geometry in `src/lib/blocks.ts` is pixel-measured: rows 234–345, quads equal to the crop boxes. The underline runs from x 47 to the green block (`UNDERLINE`). If any layer is regenerated, verify the recomposite against the master (maximum error 0, or imperceptible) and magnify the underline–green join at hero and header sizes. There must be no navy gap.
- Animation may only move, fade, clip or light these layers. It must never alter their shapes or colours.

---

## 5. Visual standards

**Aim for** photographic, editorial and dimensional work: sophisticated composition, generous negative space, a clear hierarchy, and one bold idea per section with everything around it quiet.

**Never ship:**
- generic SaaS aesthetics: icon-grid feature lists, gradient-blob heroes, stock dashboards;
- flat or placeholder-looking diagrams, such as hub-and-spoke "AI" boxes;
- illustrated, vector or "sci-fi" circuitry, hexagon grids or floating components;
- inconsistent typography or spacing;
- decoration without purpose;
- invented statistics, testimonials, client names, logos or performance claims;
- claims that a form submission was delivered unless the backend is connected and tested.

**Photography.**
- Use real, high-resolution photographs graded into navy and sapphire with the `.photo` treatment.
- No prominent human faces.
- Keep the cargo/shipping photograph in Market Growth.
- Every image must be listed in `public/photos/CREDITS.md` with its source and licence status. Unsplash images are marked as temporary references. Client-supplied images are marked "licence to be confirmed".
- Use the photo map in `src/lib/photos.ts`; never hard-code paths in components.
- Provide `-m` variants for phones.

**Illustrative examples** (the AI demos) must be labelled "Illustrative" and must not imply deployed client systems.

---

## 6. Motion standards

- Every animation must communicate something: progression, connection, cause and effect. Remove anything that is only ornament.
- **Scroll-linked motion is reversible**: scrolling back retraces the same states. Smoothing is time-based, never per-frame, so slow devices keep up. QA checks reverse drift.
- Animate only `transform`, `opacity` and `clip-path` on small elements. Never apply full-screen `filter`s, and never animate layout properties. Keep masked or blended layers small and few.
- `prefers-reduced-motion`: no moving light, parallax or entrance animation, and every final state is shown at rest. QA checks this.
- The opening sequence (`src/components/opening/OpeningSequence.tsx`) is a pinned, scroll-driven timeline. The intro plays once: ambient light, ADEN-CHASE, the underline lit left to right into the green block, cyan then sapphire, then STRATEGIES and the descriptor.

**The Living Circuit** (`src/components/motion/LivingCircuit.tsx`, routing in `src/lib/route.ts`):
- The signal is routed by A* through open space, around every line of text, image, control and card surface, with turns cut on the logo slant (K = 0.68). It enters each discipline at its marker. The route must **never** overlap content; QA fails if it does.
- The board is **one real macro photograph** (`public/photos/pcb*.webp`, client-supplied). It is never tiled and never illustrated. It sits on a viewport-held parallax layer, almost fully concealed.
- It is revealed only by the light travelling with the signal: lamps with a Gaussian falloff, plus a highlight layer for glints on metal. Never use hard circular edges, and never let it overpower typography.
- Verify with QA motion frames at all three sizes, plus a sequence through at least one horizontal crossing.

---

## 7. Responsive, accessibility and performance

- **Design mobile first.** Phones (390px) and tablets (834px) get considered layouts, not shrunken desktop ones. Nothing may scroll sideways.
- WCAG 2.2 AA:
  - semantic headings;
  - real alt text, or `alt=""` with `aria-hidden` for decoration;
  - visible focus;
  - keyboard reachable;
  - contrast of at least 4.5:1 for body text (the `--mist` token is tuned for this);
  - motion that respects user preferences.
- Performance budgets:
  - CLS ≤ 0.1 (hard limit);
  - LCP target ≤ 2.5 s desktop and ≤ 4 s mobile (lab);
  - no layout shift from late-loading imagery;
  - heavy decorative assets load after first paint;
  - prefer WebP sizes matched to their use.
- **Known open item:** the homepage LCP element is the STRATEGIES logo layer, which appears about 2 s into the intro. Improving it, for example with cropped layers or preloading, is planned work.

---

## 8. Isolation and deployment

- This project is self-contained in `website/`.
  - Do not touch the AdenChase Labs static site at the repository root.
  - Do not touch the **Client Portal** (`tvchpoint-web/aden-chase-portal`) or **Dentopia**, or their credentials, Supabase or databases.
  - The site only links to the portal (`SITE.portalUrl`).
- **Previews only.** Deploy a new preview from the pushed branch commit through the Vercel REST API:
  - project `prj_DPKYInbKQaFAW3Ad82guzaRYAV0f`, team `team_S9DcSiKV8lSIAWpWIynu6qqd`;
  - `gitSource` = this repository, branch and commit;
  - `projectSettings: { rootDirectory: "website", framework: "nextjs" }`;
  - no `target`, so it stays a preview.

  The Vercel token is injected by the environment's network proxy. Never print, store or ask for it.
- After deploying:
  - poll until `READY`;
  - confirm the production target is unchanged;
  - report the preview URL. The stable branch alias is `adenchase-site-git-<branch>-…vercel.app`.
- Never promote to production, change domains or DNS, or merge into `main` without explicit approval in the conversation.
- Previews are behind Vercel authentication.

---

## 9. Environment limits (cloud sessions)

The cloud environment imposes three limits:
- **Deployed previews are not reachable** from the sandbox, because `*.vercel.app` is not allowed and previews are SSO-protected. Verification happens on the local production build with `npm run qa`. Say so in reports.
- **Only Chromium is installed.** WebKit (Safari) and Firefox are not, so Safari behaviour (masks, blend modes, fixed layers) is unverified unless reviewed on a real device or in the desktop app.
- **Rendering has no GPU.** Frame-time numbers are not representative. Judge smoothness on real devices.

Any change to network access, plugins or credentials needs the user's approval first.
