# The Opportunity Perspective: discoverability standard

How each edition is made findable by search engines and AI answer engines, honestly. Read this
with `README.md` (publishing) before an edition goes live.

**Principles.** No hidden text, keyword stuffing, misleading metadata, doorway pages or bought
links. Metadata describes what the edition actually says. Opinion is labelled as opinion, proposals as
proposals, and reported facts are attributed to their source. Nobody can guarantee inclusion or
citation by any search or AI system; this standard only removes the obstacles.

---

## 1. What the code already does (every edition, automatically)

| Signal | Where it comes from |
| --- | --- |
| Server-rendered HTML (static, built at deploy) | `src/app/insights/[slug]/page.tsx`, `generateStaticParams` |
| `<title>` = `seoTitle` (or `Title \| ADEN-CHASE Strategies`) | edition file |
| Meta and social description = `description` | edition file |
| One canonical URL `https://adenchase.com/insights/<slug>` | `alternates.canonical` |
| Open Graph `article` (published/modified time, section, tags) and Twitter large card, using the 1200×630 graphic | `generateMetadata` |
| JSON-LD `@graph`: Organization, `OpinionNewsArticle` (or `NewsArticle` for `kind: "report"`), author Person with job title, publisher, Periodical, PDF encoding, about, mentions, keywords, `contentLocation`, citation; BreadcrumbList | `src/lib/editorial/structured-data.ts` |
| Single `<h1>` (approved headline), `<h2>` section headings, breadcrumb `<nav>`, `<article>` | page + `ArticleBody` |
| Sitemap entry with `lastModified = modified ?? date` | `src/app/sitemap.ts` |
| `robots.txt`: all crawlers allowed; only `/editions/list` disallowed | `src/app/robots.ts` |
| Preview and draft protection: `*.vercel.app` hosts send `X-Robots-Tag: noindex, nofollow`; drafts and future-dated editions are never built | `next.config.ts`, `src/lib/insights.ts` |
| PDF and graphics send `X-Robots-Tag: noindex` so the article page, not the PDF, is the indexed version | `next.config.ts` (`/editions/*`) |
| Search-console verification tags, only when the env vars are set | `src/app/layout.tsx` (`GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`) |
| IndexNow key file and submit script (production URLs only) | `public/17d84a5f18e223feee342e280b9f0dec.txt`, `scripts/indexnow.mjs` |

Unit tests (`src/lib/insights.test.ts`) enforce title length (≤ 65), description length (70–170),
unique metadata, the structured-data shape and that a proposal stays framed as a proposal.

---

## 2. Pre-publication checklist (per edition)

**Content**
- [ ] Approved headline, subtitle and body reproduced exactly; never altered for SEO.
- [ ] Opinion is clearly the author's; reported facts are linked to a named, reachable source.
- [ ] Any proposal (e.g. an initiative name) is described as a proposal everywhere: body, description, summary, structured data.
- [ ] No invented statistics, quotes, testimonials or credentials.

**Metadata (edition file)**
- [ ] `seoTitle`: what a searcher would type, plus `| ADEN-CHASE`; ≤ 65 characters; accurate.
- [ ] `description`: one or two plain sentences, 70–170 characters, true to the piece.
- [ ] `kind`: `"perspective"` for opinion/analysis, `"report"` only for straight reporting.
- [ ] `discoverability`: primary topic, secondary topics, search intents and questions the piece genuinely answers; geography; entities (proposals described as such); sources with the date each was checked; `related` slugs once other editions exist.
- [ ] `summary`: drafted with `status: "proposed"`; switched to `"approved"` only after the author approves (only then is it shown).
- [ ] `image`: licensed and approved photograph with descriptive `alt`, or the labelled placeholder.
- [ ] `date` set; `modified` set on any later substantive change.

**Build and checks**
- [ ] `npm run editions` (PDF, graphics, manifest) then `npm run check` passes.
- [ ] `npm run qa` passes (pages, a11y, Lighthouse on the article; CLS ≤ 0.1).
- [ ] View source on the preview: title, description, canonical, one `<h1>`, JSON-LD present.
- [ ] Validate the JSON-LD at <https://validator.schema.org> (paste the page source) and the Rich Results Test once live.
- [ ] Preview stays private (Vercel authentication) and `noindex`; it is never submitted anywhere.

---

## 3. Indexing readiness (one-time account setup, done by the site owner)

Nothing here is configured yet. These steps need the owner's own Google and Microsoft accounts;
the codebase never stores verification secrets in source.

**Google Search Console**
1. Go to <https://search.google.com/search-console> → *Add property*.
2. Preferred: **Domain** property `adenchase.com` (covers `www` and all paths). Google shows a TXT record; add it in GoDaddy DNS yourself (this project does not change DNS), then *Verify*.
3. Alternative without DNS: **URL-prefix** property `https://adenchase.com/` → *HTML tag* method. Copy only the `content` value, set it as the Vercel **Production** environment variable `GOOGLE_SITE_VERIFICATION`, redeploy production (with approval), then *Verify*.
4. *Sitemaps* → submit `https://adenchase.com/sitemap.xml`.

**Bing Webmaster Tools** (also feeds Microsoft Copilot and DuckDuckGo results)
1. <https://www.bing.com/webmasters> → *Import from Google Search Console* (fastest, once Google is verified), or add the site and use the *HTML meta tag* method: set the value as `BING_SITE_VERIFICATION` (Production) and redeploy.
2. Submit `https://adenchase.com/sitemap.xml`.

**IndexNow** (Bing, Yandex, Seznam, Naver; Google does not use it). The key file is already public
at `https://adenchase.com/17d84a5f18e223feee342e280b9f0dec.txt` once the branch is in production.

---

## 4. Post-publication checklist (each edition, after it is live in production)

- [ ] Open the live URL; confirm HTTPS, no `noindex` (`curl -sI <url> | grep -i robots` returns nothing), canonical correct.
- [ ] Rich Results Test on the live URL: Article and Breadcrumb detected, no errors.
- [ ] Google Search Console → *URL Inspection* → the article URL → *Request indexing*. Repeat for `/insights`.
- [ ] Bing Webmaster Tools → *URL Submission*, or run `npm run indexnow -- https://adenchase.com/insights/<slug> https://adenchase.com/insights` (refuses any non-production URL).
- [ ] Share the live URL (never a preview) on LinkedIn and the other channels; check the card renders with the LinkedIn Post Inspector.
- [ ] After 1–2 weeks: check *Pages* (indexed?) and *Performance* (queries) in both consoles.

---

## 5. AI crawlers

`robots.txt` currently allows every crawler, including AI **search/answer** crawlers and AI
**training** crawlers. Changing training permissions is the owner's decision; do not edit
`src/app/robots.ts` for it without approval.

| Operator | Search / user-triggered (keep allowed for citation) | Training / model use (owner's policy decision) |
| --- | --- | --- |
| Google | `Googlebot` (Search, AI Overviews, AI Mode) | `Google-Extended` (Gemini training and grounding; not a Search signal) |
| Microsoft | `Bingbot` (Bing and Copilot) | — (no separate token) |
| OpenAI | `OAI-SearchBot`, `ChatGPT-User` | `GPTBot` |
| Anthropic | `Claude-SearchBot`, `Claude-User` | `ClaudeBot` |
| Perplexity | `PerplexityBot`, `Perplexity-User` | — |
| Apple | `Applebot` | `Applebot-Extended` |
| Common Crawl | — | `CCBot` |

Tokens change; re-check each operator's official crawler documentation before relying on this
table. Blocking a search crawler removes the site from that engine's answers; blocking a training
crawler does not.

There is no Vercel firewall or bot-protection rule blocking any of these today. If bot protection
is ever enabled, allow the verified search crawlers above.

---

## 6. Measurement (reuse existing tools; nothing invasive)

| Question | Source | Status |
| --- | --- | --- |
| Is the edition indexed? Which queries show it? Clicks, impressions, position | Google Search Console, Bing Webmaster Tools | Needs verification (section 3) |
| Visits, referrers (incl. `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai`, `utm_source=chatgpt.com`) | Vercel Web Analytics (cookieless; enabled on the project) | Needs approval to add the `@vercel/analytics` component |
| Real-user Core Web Vitals | Vercel Speed Insights (enabled on the project) | Needs approval to add `@vercel/speed-insights` |
| PDF downloads, share clicks | Vercel Web Analytics custom events | Needs the above approval (custom events may need a paid plan) |
| Is the edition cited in AI answers? | Monthly manual check: ask the edition's questions in ChatGPT search, Perplexity, Copilot, Gemini, Google AI Mode; record whether and how it is cited | Manual |

Record results per edition (date, indexed yes/no, top queries, AI citations seen) so later
editions can be compared.
