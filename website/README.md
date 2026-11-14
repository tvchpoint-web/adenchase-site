# ADEN-CHASE Strategies — corporate website

Corporate website for ADEN-CHASE Strategies (`adenchase.com`): **Business Development • AI Engineering • Market Growth**. The site is photographic and editorial.

- **Opening.** The homepage opens logo-first. The authentic mark assembles from layers cut from the official artwork: the underline lights into the green block, then the cyan and sapphire blocks follow. A pinned scroll timeline then carries the visitor through a skyline, four angled slices, and three portals cut on the logo's slant.
- **The story.** It continues with Business Development, AI Engineering, Market Growth, capabilities and private engagement.
- **The Living Circuit.** A Neon Jade signal is routed through the page's open space and never crosses content. Its light reveals a real macro photograph of a circuit board hidden beneath the navy.

Working standards (brand, logo, motion, QA gate, isolation, deployment) live in **[CLAUDE.md](./CLAUDE.md)**.

This folder is a **self-contained project**. It shares nothing with:

- the **ADEN-CHASE Client Portal** (`tvchpoint-web/aden-chase-portal`), a separate app this site only links to;
- the **AdenChase Labs** static site at the root of this repository, which is untouched.

## Stack

Next.js 16 (App Router, TypeScript) · React 19 · Tailwind CSS 4 · GSAP ScrollTrigger (editorial reveals) · Inter Tight (SIL OFL 1.1, self-hosted). Everything is DOM, CSS and SVG; there is no WebGL.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + unit tests (routing, logo geometry, brand guards)
npm run build
npm run qa           # build + full QA → qa-report/index.html (see CLAUDE.md §2)
npm run qa:visual    # screenshots at 1440 / 834 / 390, motion frames, circuit overlap, reverse scroll
npm run qa:a11y      # axe-core WCAG 2.2 A/AA
npm run qa:perf      # Lighthouse (mobile + desktop)
```

The QA tools are dev-dependencies: Playwright 1.63, axe-core and Lighthouse. Playwright uses the Chromium installed on the machine; on a new machine, run `npx playwright install chromium` once.

## Structure

```
src/
  app/                        routes: / /approach /expertise /capabilities /engagement (+ 404)
    engagement/actions.ts     inquiry server action (honest about delivery)
    globals.css               tokens (palette, type), photo grading, motion styles
  components/
    opening/OpeningSequence   logo-first pinned opening (layered authentic mark → slices → portals)
    motion/LivingCircuit      routed Neon Jade signal + photographic board revealed by its light
    motion/InView             reversible in-view state
    home/                     homepage sections, AI demos, outcomes, engagement path, final CTA
    brand/                    AngledPhoto (slanted photo frames), BrandBlock(s), line icons
    editorial/                line-by-line headline reveal (ScrollTrigger, reversible)
    site/                     header, footer, page hero, CTA band, photo loader
  lib/
    blocks.ts                 logo geometry measured from the artwork (blocks, slant, underline)
    route.ts                  occupancy grid + A* routing + scroll mapping for the Living Circuit
    photos.ts                 the photo map (one place to change imagery)
    site.ts                   copy, navigation, disciplines, capabilities
public/
  brand/                      master logo (never modified) + transparent and block derivatives
  photos/                     graded photography, logo layers, circuit board; CREDITS.md lists every source
qa/                           QA harness: config.mjs (thresholds), checks/, run.mjs → qa-report/
```

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL. Defaults to `https://adenchase.com`. |
| `NEXT_PUBLIC_PORTAL_URL` | Client Portal sign-in link. Defaults to `https://aden-chase-portal.vercel.app/login`. Change it to `https://portal.adenchase.com/login` once that domain exists. |
| `RESEND_API_KEY`, `INQUIRY_TO`, `INQUIRY_FROM` | Inquiry delivery. **Until `RESEND_API_KEY` and `INQUIRY_TO` are set, the form validates input but tells visitors plainly that nothing was sent.** Use credentials created for this site, not the AdenChase Labs or portal keys. |

## Deployment (Vercel): previews only

- **Project.** The Vercel project `adenchase-site` (root directory `website`) already exists.
- **Previews.** Each review round is deployed as a new **preview** from the pushed branch commit (see CLAUDE.md §8). Previews are behind Vercel authentication.
- **Production.** Promoting to production, assigning `adenchase.com` and changing DNS each need explicit approval.

Note: if this branch is ever merged into `main`, the existing AdenChase Labs static deployment would also publish the `website/` folder as raw files. Keeping this site in its own repository (recommended) or excluding the folder from that project avoids that.
