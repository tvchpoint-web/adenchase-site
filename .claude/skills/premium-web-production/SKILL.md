---
name: premium-web-production
description: "Production standard for premium, agency-level marketing and corporate websites (ADEN-CHASE and future client sites). Covers a multi-disciplinary review sequence (creative direction, UI/UX, motion, engineering, visual QA, performance and accessibility, code review), mandatory screenshot-based visual verification at desktop, tablet and mobile, brand-safety rules for logos, palettes and claims, and preview-only deployment. Use this skill whenever you are about to change anything visible on a client website: a section, layout, typography, imagery, animation or scroll choreography, copy, a redesign or a visual polish pass. Also use it when asked to review, critique or QA a site's design or motion, or to set up a new client website project — even if the request doesn't say 'premium' or 'review'."
---

# Premium web production

Clients for this kind of site are paying for work that looks bespoke and holds up under scrutiny on
every screen. The two failure modes that cost the most are both preventable:

1. **Generic output.** Template layouts, flat diagrams and decorative motion read as cheap, however tidy the code is.
2. **Unverified output.** Changes that pass tests but look wrong: overlapping elements, broken
   mobile layouts, janky scroll, an altered logo. These erode trust in every later delivery.

This skill exists to prevent both. It sets out the order of work and the evidence required before anything is called done.

## First: load the project profile

Each client project carries its own profile in its `CLAUDE.md`, covering:
- palette and tokens, typography, and logo files and rules;
- the descriptor or tagline;
- isolation rules: which other projects must not be touched;
- the deployment procedure;
- the QA commands.

Read it before planning. The profile always overrides the general guidance here. If a project has no profile yet, create one with the user before designing anything; `references/qa-harness.md` lists what it needs.

## The review sequence

Apply the roles that are relevant, in this order, for every significant change. Each role is a
distinct pass with its own question. Where the project defines a subagent for a role (look in
`.claude/agents/`), run it; otherwise do the pass yourself and say so. Detailed checklists for every role are in `references/review-roles.md`.

| # | Role | The question it answers | Typical tool |
| --- | --- | --- | --- |
| 1 | Creative Director | Is the concept distinctive, on brand, and worth building? | `creative-director` agent; `frontend-design` / `design-critique` skills when installed |
| 2 | UI/UX Designer | Do layout, hierarchy, typography and usability hold at every size? | `uiux-designer` agent |
| 3 | Motion Designer | Does every movement communicate, feel smooth, and reverse cleanly? | `motion-designer` agent |
| 4 | Frontend Engineer | Is it built cleanly, responsively and performantly? | main session; framework best-practice skills when installed |
| 5 | Visual QA Reviewer | Do the actual screenshots and frames match the brief and the references? | `visual-qa-reviewer` agent on QA output |
| 6 | Performance & Accessibility | Is it fast, stable, and usable by everyone? | `perf-a11y-reviewer` agent; Lighthouse and axe via the QA harness |
| 7 | Code Reviewer | Is the implementation correct, simple, and free of regressions? | `/code-review`, `/simplify`; `/security-review` when forms, headers, APIs or dependencies change |

Roles 1–3 run **before** code is written, against current screenshots and the brief, so problems are
caught when they are cheap. Roles 5–7 run **after**, against evidence.

Be honest about which passes ran. Saying a review happened when it did not is worse than skipping
it, because the user then trusts an unchecked result.

## Visual verification is mandatory

Passing type checks and unit tests says nothing about whether a page looks right. Before calling any visible change done:

1. Run the project's QA harness (for example `npm run qa`). It must pass; never weaken a threshold to get there.
2. **Look at the evidence yourself.** Open the screenshots at desktop, tablet and mobile, and the
   motion frames or video. Compare them with the brief and the approved references. Check alignment,
   type, spacing, imagery quality, overlap, and what shows in the first viewport.
3. Check reverse scrolling and reduced-motion behaviour for anything scroll-linked.
4. Note what could not be verified in this environment, such as Safari/WebKit, real devices, GPU
   smoothness or the deployed preview, and say so in the report rather than implying it was checked.

## Brand safety

- **Logos are artwork, not design elements.** Use only the client's files and layers cut from them.
  Never redraw, re-typeset or approximate a logo. Never modify the master file; guard it with a hash test.
- **Use the palette exactly.** Introduce no new hues; derive tints from the palette tokens.
- **Make no invented claims.** No fabricated statistics, testimonials, client names or results. Label illustrative examples as illustrative. Never tell visitors a form was delivered unless delivery is wired up and tested.
- **Record photography rights.** Every image goes into a credits file with its source and licence status. Avoid prominent faces unless the client supplies released images.
- **No third-party brands in imagery.** Zoom into every photo for legible signage, logos and product names. A brand resembling the client's own name is a blocker, because it implies an association that does not exist.

## Design bar

Aim for photographic, editorial, dimensional work: one bold idea per section, generous space, a clear hierarchy, and purposeful motion.

Reject:
- SaaS templates;
- icon-grid filler;
- hub-and-spoke "AI" diagrams;
- illustrated circuitry;
- gradient blobs;
- decoration without meaning.

Motion must communicate progression, connection or cause and effect. It must be reversible when scroll-linked, frame-rate independent, compositor-friendly (transform, opacity, small clip or mask layers; never full-screen filters), and quiet under `prefers-reduced-motion`.

## Delivery

- Deploy **previews only**. Never touch production, DNS or other projects without explicit approval in the conversation.
- End every substantial change with a report:
  - the preview URL;
  - what changed;
  - what was verified, and how (QA verdict, screens reviewed);
  - what could not be verified;
  - which roles and skills actually ran;
  - open issues.
