# ADEN-CHASE Strategies: search and AI visibility

The site-wide standard for being found, accurately, in search engines and AI answer engines.
Edition-level rules for The Opportunity Perspective are in
`src/content/insights/DISCOVERABILITY.md`.

**Principles.** Metadata only says what the page itself says. No hidden text, keyword stuffing,
doorway pages, bought links, invented clients, offices, credentials, statistics or claims. No
promise of rankings, indexing speed or AI citations.

---

## 1. Where things live

| What | Where |
| --- | --- |
| Search title and description for every page | `SEO` in `src/lib/site.ts` (tests: `src/lib/seo.test.ts`) |
| Canonical URL, Open Graph, Twitter card | `pageMeta(path)` in `src/lib/meta.ts` |
| Organization + WebSite structured data (every page) | `src/lib/structured-data.ts`, rendered in `src/app/layout.tsx` |
| Service structured data (Business Development, AI Engineering, Market Growth, Government & Institutions) | `serviceJsonLd`, rendered by `DisciplinePage` and the Government page |
| Breadcrumb structured data | `pageJsonLd` / `serviceJsonLd`; the article has its own |
| Article, author, publisher structured data | `src/lib/editorial/structured-data.ts` |
| `/llms.txt` (plain-language site summary for AI tools; supplementary only) | `src/app/llms.txt/route.ts`, generated from the same copy |
| Sitemap, robots | `src/app/sitemap.ts`, `src/app/robots.ts` |
| Preview `noindex` | `next.config.ts` (every `*.vercel.app` host) |
| Verification tags | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` env vars (`src/app/layout.tsx`) |

`ProfessionalService` is deliberately not used: search engines treat it as a local business, which
needs a public street address the firm has not published. Add it only with a real, approved address.

---

## 2. Keyword clusters mapped to pages

**Data status.** No keyword-volume tool (Google Search Console, Google Ads Keyword Planner, Bing
Webmaster Tools, or a paid tool) is connected yet, so **no search volumes, competition or ranking
figures are stated here**. Every term below is a *proposed opportunity* chosen for relevance to what
the page already says. Replace "proposed" with measured data once Search Console has 4–8 weeks of
impressions (section 5).

| Cluster | Page (one primary home per cluster) | Supported now | Proposed terms (variations, not repetitions) |
| --- | --- | --- | --- |
| Strategy & business development | `/business-development` (+ `/about`, `/capabilities`) | Yes | business development consulting; strategic development advisory; business growth strategy; strategic opportunity identification; revenue growth strategy; strategic partnerships; market expansion consulting; corporate strategy consulting |
| AI engineering & modernization | `/ai-engineering` | Yes | AI consulting; AI engineering; AI implementation strategy; AI automation / workflow automation consulting; AI solutions for businesses; AI business transformation; AI assistants for business; digital modernization |
| AI search visibility (GEO / LLM search) | `/market-growth` (capability: AI Search & Discovery Visibility) and `/ai-engineering` (AI Discovery & Visibility) | Yes | AI visibility optimization; generative engine optimization; LLM search optimization; AI search visibility |
| Government & institutional | `/government-institutions` | Yes | government strategic consulting; government digital modernization; AI solutions for government; public-sector innovation; public-private partnerships; institutional development consulting; government innovation advisory |
| Market growth & international expansion | `/market-growth`, `/business-development` (International Market Entry) | Yes | international market entry; market growth advisory; market intelligence consulting; international business development |
| Tourism & destination development | `/insights/paradise-shouldnt-come-with-preventable-risks`; homepage "Hospitality & Destination Businesses" | **Partly**: one audience line and one editorial; no service page | tourism safety strategy; destination development; tourism experience development |

**Gaps that need an owner decision (not implemented, to avoid unsupported claims):**

1. **Geography.** The site never says where the firm operates. "Jamaica", "Caribbean" and
   "GovTech consulting Caribbean" cannot rank for a page that does not mention them, and adding
   them to metadata alone would be misleading. Proposed fix, for approval: one factual sentence on
   `/about` (for example, *"ADEN-CHASE Strategies works with organizations in Jamaica, across the
   Caribbean and internationally."*, worded as the firm confirms) plus `areaServed` in the
   Organization structured data.
2. **Tourism & destination development.** Covered by one audience line and Issue 001 only. If it
   is a real service line, an approved section (or page) describing it is needed before targeting
   "tourism development consulting", "Caribbean tourism consulting", "destination intelligence",
   "tourism analytics" or "sustainable tourism development".
3. **People.** No founder or team page. An approved short profile of Emmanuel Adenaike, Sr.
   (Strategic Development Advisor) would strengthen author and organisation understanding (E-E-A-T)
   for both search and AI systems. Credentials must come from him, not be inferred.
4. **Profiles (`sameAs`).** Add the firm's official LinkedIn (and other) profile URLs once they
   exist, so engines can connect the entity.

**Natural-language questions** the site already answers (useful for AEO; answer them plainly on
the page where they belong, never in hidden FAQ blocks): *What does ADEN-CHASE Strategies do? What
is business development consulting? How can AI improve business operations? How can government
institutions modernize digital services? How do I make my business visible in AI search? How do I
contact ADEN-CHASE Strategies?*

---

## 3. AI crawlers

`robots.txt` allows every crawler. Search/answer crawlers (Googlebot, Bingbot, OAI-SearchBot,
ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot) and training
crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot, Applebot-Extended) are both allowed today.
Changing training permissions is the owner's decision. The table and caveats are in
`src/content/insights/DISCOVERABILITY.md` §5. No Vercel firewall or bot rule blocks any crawler.

---

## 4. Indexing

One-time setup (owner): Google Search Console and Bing Webmaster Tools verification, then submit
`https://adenchase.com/sitemap.xml`. Steps: `src/content/insights/DISCOVERABILITY.md` §3.
After each production release: URL Inspection → Request indexing for changed pages, and
`npm run indexnow -- <production URLs>`.

---

## 5. Measurement framework (baseline, then monthly)

Record a baseline in the first week after verification, then the same figures on the first
working day of each month.

| Metric | Source | Status |
| --- | --- | --- |
| Indexed pages (vs. sitemap: 10 URLs today) | GSC *Pages*; Bing *Index explorer* | Needs verification |
| Impressions, clicks, CTR, average position (site, per page, per query) | GSC *Performance*; Bing *Search performance* | Needs verification |
| Query performance per keyword cluster (section 2) | GSC *Performance*, filter by query regex per cluster | Needs verification |
| Visits and referrers, including AI referrals (`chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai`, `utm_source=chatgpt.com`) | Vercel Web Analytics (cookieless, enabled on the project) | Needs approval to add the component |
| Real-user Core Web Vitals | Vercel Speed Insights | Needs approval to add the component |
| Editorial readership (article views), PDF downloads, share clicks | Vercel Web Analytics page views and custom events | Needs the above approval |
| Contact inquiries and their source page; lead conversion (inquiry → conversation → engagement) | The inquiry store (pending: see the storage decision) with its status field | Pending storage |
| Observed AI citations | Monthly manual check: ask the questions in section 2 in ChatGPT search, Perplexity, Copilot, Gemini, Google AI Mode and Claude with web search; record whether ADEN-CHASE is cited and which URL | Manual |

Keep the log as a simple monthly table (date, metric, value, notes) so trends are comparable.
