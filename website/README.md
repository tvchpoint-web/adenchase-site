# ADEN-CHASE Strategies — The Living Opportunity Engine

Corporate website for ADEN-CHASE Strategies (`adenchase.com`). It is built around **The Nexus**: one persistent, interactive 3D architecture that the homepage re-configures across five scroll scenes (Arrival → Discovery → Engineering → Growth → Private Engagement).

This folder is a **self-contained project**. It shares nothing with:

- the **ADEN-CHASE Client Portal** (`tvchpoint-web/aden-chase-portal`), a separate app this site only links to;
- the **AdenChase Labs** static site at the root of this repository, which is untouched.

It has its own dependencies, environment variables and Vercel project.

## Stack

Next.js 16 (App Router, TypeScript) · React 19 · React Three Fiber + Three.js + Drei · GSAP ScrollTrigger · Tailwind CSS 4 · Inter Tight (SIL OFL 1.1, self-hosted).

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
npm run lint
npm test           # Nexus layout invariants + inquiry validation
```

## Structure

```
src/
  app/                      routes: / /approach /expertise /capabilities /engagement
    engagement/actions.ts   inquiry server action (honest about delivery)
  components/
    nexus/                  The Nexus
      layout.ts             nodes, glass modules, pathways, Jade Signal routes, 5 scene configs
      engine.ts             per-frame engine (instanced glass, nodes, hairlines, signal, heat)
      shaders.ts            in-shader lighting — reads well without bloom
      NexusCanvas.tsx       R3F canvas, camera choreography, adaptive DPR
      NexusStage.tsx        WebGL detection, lazy loading, static still fallback
      store.ts              DOM ↔ WebGL bridge (scroll, pointer, focus) — no React re-renders
    story/                  homepage scroll controller, discovery lenses, service pillars
    editorial/              line-by-line headline reveal (ScrollTrigger, reversible)
    site/                   header, footer, page hero, CTA band, region tracker
  lib/site.ts               all copy, navigation, disciplines, capabilities
public/
  brand/aden-chase-logo.png the official logo artwork (byte-identical copy from the portal)
  nexus/still-*.webp        stills rendered from the live Nexus (first paint, no-JS / no-WebGL fallback)
```

### How the Nexus works

- Every element has a pose in each of the five scene configurations. The engine blends between them from a smoothed scroll value, so **scrolling backward retraces exactly the same states**. Nothing is a one-shot animation.
- Scroll is read natively, with no scroll-jacking. ScrollTrigger only reports progress.
- **Pointer:** magnetic parallax (±5° / ±3°, ~330 ms critically-damped settle), camera depth parallax, screen-space proximity lighting of cyan junctions, and Jade Signal routing that favours the pathway nearest the pointer. The signal always travels on real connections; the unit tests enforce this.
- **Service pillars and discovery lenses:** hover, keyboard focus or tap highlights the matching region or pathway.
- **Reduced motion:** no entrance, drift, parallax or travelling light. The scene's principal pathway is held softly lit instead, and scene changes are immediate.
- **Mobile / low-power:** detail modules dropped, DPR capped at 1.5, ground plane removed, adaptive DPR via `PerformanceMonitor`. Rendering pauses when the stage is off-screen.

### Regenerating the fallback stills

The stills in `public/nexus/` are screenshots of the real renderer with the UI hidden. If the Nexus layout or scene cameras change, re-capture them at 1600×1000 (desktop), with an iPhone 13 profile (mobile), and per sub-page stage. Save them as WebP.

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL. Defaults to `https://adenchase.com`. |
| `NEXT_PUBLIC_PORTAL_URL` | Client Portal sign-in link. Defaults to `https://aden-chase-portal.vercel.app/login`. Change it to `https://portal.adenchase.com/login` once that domain exists. |
| `RESEND_API_KEY`, `INQUIRY_TO`, `INQUIRY_FROM` | Inquiry delivery. **Until `RESEND_API_KEY` and `INQUIRY_TO` are set, the form validates input but tells visitors plainly that nothing was sent.** Use credentials created for this site, not the AdenChase Labs or portal keys. |

## Deployment (Vercel) — needs approval

1. Create a **new** Vercel project from this repository with **Root Directory = `website`** (framework: Next.js). Do not reuse the AdenChase Labs or Client Portal projects.
2. Set the environment variables above.
3. Assign `adenchase.com` only when ready. DNS changes need explicit approval.

Note: if this branch is ever merged into `main`, the existing AdenChase Labs static deployment would also publish the `website/` folder as raw files. Keeping this site in its own repository (recommended) or excluding the folder from that project avoids that.
