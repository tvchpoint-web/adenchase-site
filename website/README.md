# ADEN-CHASE Strategies — The Living Opportunity Engine

Corporate website for ADEN-CHASE Strategies (`adenchase.com`). It is built around **The Nexus**: one persistent, interactive 3D architecture that the homepage re-configures across five scroll scenes (Arrival → Discovery → Engineering → Growth → Private Engagement).

This folder is a **self-contained project**. It shares nothing with:

- the **ADEN-CHASE Client Portal** (`tvchpoint-web/aden-chase-portal`), a separate app this site only links to;
- the **AdenChase Labs** static site at the root of this repository, which is untouched.

It has its own dependencies, environment variables and Vercel project.

## Stack

Next.js 16 (App Router, TypeScript) · React 19 · React Three Fiber + Three.js + Drei · @react-three/postprocessing · GSAP ScrollTrigger · Tailwind CSS 4 · Inter Tight (SIL OFL 1.1, self-hosted).

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
      architecture.ts       groups, bevelled glass/metal pieces, energy channels, signal routes,
                            per-scene poses and orbital camera shots
      rig.ts                scene graph + per-frame choreography (poses, emergence, Jade Signal,
                            channels, junction nodes, pointer light, region focus)
      materials.ts          transmissive sapphire glass, structural metal, light strips, channel shader
      tube.ts               energy conduits that follow the moving architecture
      NexusCanvas.tsx       camera choreography, lighting environment, reflective floor, backdrop, bloom
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

- **Architecture.** A twisting tower of thick, bevelled glass floor plates on a metal frame, with a jade "heart". Around it are three wings (Strategy: cantilevered planes; AI Engineering: a glass engine block; Market Growth: ascending volumes), eight satellite monoliths and 3D energy conduits.
- **Materials and light.** Physically based glass (transmission, thickness, sapphire attenuation, clearcoat), metallic structure, emissive cyan light strips, and an image-based lighting environment built from brand-coloured light panels. A key light casts shadows; cyan and sapphire rim lights separate the structure from the night. The floor reflects, and distant monoliths with fog give depth. Bloom is restrained and only catches emissive light.
- **Scenes.** Every group and piece has an explicit pose per scene:
  - Arrival: partially assembled, upper plates still hovering.
  - Discovery: plates separate and fan open, wings pull away, hidden conduits appear.
  - Engineering: plates rotate into alignment and the wings turn into three aligned systems.
  - Growth: satellites rise from the floor and connect.
  - Engagement: the iconic twisted composition, with a conduit leading toward the call to action.
  The camera orbits between shots in spherical coordinates. Everything is a function of smoothed scroll progress, so **scrolling backward retraces exactly the same states**.
- **Pointer.** Orbital parallax plus structure tilt (±6° / ±3.5°, ~350 ms settle), a cyan light that follows the pointer across the glass, and proximity activation of junction nodes.
- **Jade Signal.** A pulse travels inside the conduits along defined routes, carrying a real point light that illuminates the glass it passes, and leaves a residual charge behind it. Unit tests check that every route uses real conduits.
- **Service pillars and discovery lenses.** Hover, focus or tap brightens the matching region's light and glass, or sends the signal along the matching pathway.
- **Reduced motion.** No entrance, drift, parallax or travelling light; the scene's principal conduits are held charged and scene changes are immediate.
- **Mobile / low-power.** No transmission pass (reflective translucent glass instead), no reflections, shadows or bloom, detail pieces dropped, DPR capped at 1.5, adaptive DPR. Rendering pauses off-screen.

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
