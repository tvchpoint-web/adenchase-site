# Review role checklists

Each role ends with a short verdict: **Ship**, **Revise** (with the specific changes) or **Rethink**.
Keep findings concrete: name the element, the viewport and what to change. "Feels off" is not a finding.

## 1. Creative Director (before building)
- Does the idea express this client's positioning, or could it belong to anyone?
- Is there one clear, bold move per section, with everything around it quiet?
- Is the imagery genuine and high quality: photographic, believable materials, correct grading into the palette?
- Is the imagery free of legible third-party brands (signage, logos), especially anything resembling the client's name?
- Is the brand applied exactly: logo authentic, palette exact, descriptor and tagline worded correctly?
- Does anything read as template, filler, or an AI-generic aesthetic?
- Does the page tell a story from the first viewport to the call to action?

## 2. UI/UX Designer
- **Hierarchy:** can a visitor tell what matters within 3 seconds at each size?
- **Typography:**
  - one family, used on a consistent scale;
  - measure of 45–75 characters;
  - balanced headings and no orphans in display type;
  - labels tracked;
  - no faux bold or italic, and no fallback fonts.
- **Alignment:** a shared grid with consistent gutters; repeated elements share edges, baselines and padding.
- **Mobile:**
  - a considered layout rather than a shrunken desktop one;
  - tap targets of at least 44px;
  - no sideways scroll;
  - the first viewport is meaningful.
- **Navigation:** the current section is clear, the menu works by keyboard and touch, and focus is visible.
- **Content:** no clipped, overlapping or truncated text; images are cropped deliberately.

## 3. Motion Designer
- What does each animation communicate? Remove any that only decorate.
- **Choreography:**
  - entrances are sequenced, not simultaneous;
  - easing is consistent;
  - durations suit the distance travelled;
  - nothing competes with reading.
- **Scroll-linked motion:**
  - tied to scroll progress;
  - retraces exactly in reverse;
  - smoothing is time-based, never per-frame;
  - no jumps at section boundaries.
- **Performance:** only transform, opacity, clip or mask on small layers; no layout thrash; no full-screen filters or blends.
- **Reduced motion:** the final states are shown at rest and nothing moves on its own.
- **Light and reveal effects:** soft falloff with no hard edges, believable material response, and content is never obscured.

## 4. Frontend Engineer
- Framework conventions: server components by default, client code only where interaction needs it, no hydration mismatches.
- Responsive by construction, using fluid type and spacing and layout containers rather than per-device hacks.
- Images are sized for their use, with phone variants, no layout shift, and decorative heavy assets loaded after first paint.
- Lint, type checks and tests are clean, with no disabled rules unless justified in a comment.

## 5. Visual QA Reviewer (after building, on evidence)
- Review every screenshot: each route at desktop, tablet and mobile, full page.
- Review the motion frames and video: opening, scroll sequence, reveal effects, reverse.
- Compare against the brief and the approved references, and list every deviation.
- Check:
  - overlap;
  - alignment drift;
  - inconsistent spacing;
  - type wrapping badly;
  - image quality and cropping;
  - brand accuracy, including **zooming into photographs for third-party signage or logos**;
  - empty or broken states.
- State plainly what was **not** reviewed: other browsers, real devices, the live preview.

## 6. Performance & Accessibility Reviewer
- Lighthouse:
  - CLS ≤ 0.1;
  - LCP within budget, with the LCP element identified;
  - TBT within budget;
  - accessibility score ≥ 90.
- axe with WCAG 2.2 A/AA shows no serious or critical violations. Contrast is at least 4.5:1 for body text and 3:1 for large text and UI.
- Keyboard: a skip link, logical order, visible focus, and no traps. Headings are semantic, and alt text is meaningful or explicitly decorative.
- Lab numbers from a GPU-less sandbox are indicative only. Flag what needs real-device confirmation.

## 7. Code Reviewer
- Run `/code-review` on the diff. Run `/simplify` for reuse and efficiency, and `/security-review` when forms, headers, APIs or dependencies change.
- Fix the findings, then rerun the QA harness. A fix that makes QA fail is a regression.
