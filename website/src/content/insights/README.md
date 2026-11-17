# The Opportunity Perspective: publishing an edition

The Opportunity Perspective is published by ADEN-CHASE Strategies at `/insights`. Each edition is
one file in this folder. Everything else is generated from that file, so it is written once and
distributed everywhere:

- the article at `/insights/<slug>`;
- the landing page and the homepage feature;
- the sitemap and the search and social metadata (Open Graph and Article structured data);
- the PDF, US Letter;
- three graphics: 1200×630 for LinkedIn, Facebook and link previews; 1080×1350 for Instagram; 1080×1920 for Stories and WhatsApp Status.

## Add a new edition

1. **Copy the file.** Copy `001-paradise-shouldnt-come-with-preventable-risks.ts` to `NNN-<slug>.ts`.
2. **Fill in the fields.**
   - `issue`: the next number. It must be unique; the tests refuse duplicates.
   - `slug`: lowercase words joined by hyphens. It becomes the URL. Never change it after publishing.
   - `title` and `subtitle`.
   - `description`: one or two sentences for search and social previews.
   - `category`: only categories with published editions are ever shown.
   - `author`: a key in `AUTHORS` in `index.ts`.
   - `date`: `YYYY-MM-DD`.
   - `modified`: optional, for later corrections.
   - `featured: true` puts the edition at the top. Otherwise the newest edition leads.
3. **Write the body.** Use plain text between the backticks:
   - a blank line between paragraphs;
   - `## Heading` for a section heading;
   - `* item` for a bulleted list;
   - `[text](https://…)` for a link.

   Nothing else is interpreted, and the wording is never altered.
4. **Register it.** Add one line in `index.ts`.
5. **Keep it a draft while editing.** Leave `status: "draft"` and work in `npm run dev`, where drafts are visible. Drafts are never built: no page, no PDF, no graphics, no sitemap entry. Their URLs return 404.
6. **Publish.**
   - Set `status: "published"`.
   - Run `npm run editions`. This generates the PDF and the three graphics in `public/editions/NNN/` and records them in `manifest.json`.
   - Run `npm run check`. The tests fail if an edition has changed since its assets were generated.
   - Commit, deploy a preview, review it, then promote it.

An edition dated in the future stays hidden until that date, at the next deployment.

## Images and rights

- Use only an owner-provided photograph or a properly licensed one.
- The licence must cover the website, the PDF, social graphics and promotional use.
- Never use news photography without permission.
- Never use a photograph of a different place labelled as this one.
- Never use an image with someone else's watermark or badge.

To set an image:

1. Put the file in `public/photos/editions/`. Use WebP for the web, about 2000 px wide.
2. List it in `public/photos/CREDITS.md`.
3. Fill in `image` in the edition file:
   - `src`, `width` and `height`;
   - `alt`;
   - `credit` (the visible credit line);
   - `source`;
   - `licence`;
   - `approved: true`, only once the owner has approved it.

Until `approved` is true, the article, the PDF and the graphics show a clearly labelled placeholder.
After setting the image, run `npm run editions` again.

## Authors

Authors live in `AUTHORS` in `index.ts`: name, professional title and organisation. Never invent
credentials or biography.

An email address is shown in the signature. It is linked only when `emailVerified: true`, which means
mail to that address has been confirmed to arrive.
