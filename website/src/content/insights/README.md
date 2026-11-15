# Publishing an Insights article

Insights hosts **The Opportunity Perspective** by Emmanuel Adenaike, Sr. Each article is a single
file in this folder; no page component changes are needed.

1. Copy `jamaica-safe-waters.tsx` to `<slug>.tsx`. The slug becomes the URL `/insights/<slug>`, so use
   lowercase words joined by hyphens, and never change it once the article is published.
2. Fill in the article fields:
   - `title`
   - `excerpt`: one or two sentences, used as the subtitle, on cards and in social previews
   - `category`
   - `date` (`YYYY-MM-DD`)
   - optional `image` (add the file to `public/photos/` and list it in `public/photos/CREDITS.md`)
3. Write the body with the Prose components from `@/components/insights/Prose`:

   | Component | Use |
   | --- | --- |
   | `<P>` | Paragraph |
   | `<H2>` | Section heading |
   | `<H3>` | Sub-heading |
   | `<Quote cite="…">` | Pull quotation |
   | `<A href="…">` | Link; external links open safely |
   | `<UL>` / `<OL>` with `<LI>` | Lists |

4. Register it with one line in `index.ts`.
5. Keep `status: "draft"` while editing. Drafts are visible only in `npm run dev`; they never appear in
   a build, a preview, the listing, the homepage or the sitemap.
6. To publish, set `status: "published"` and a `date`. An article dated in the future stays hidden
   until that date, at the next deployment.

Every published article automatically gets its URL, social sharing links, search and Open Graph
metadata, structured article data (JSON-LD), a sitemap entry and a homepage preview card.
