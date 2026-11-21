# ADEN-CHASE Strategies: analytics (Phase 1)

Google Analytics 4 is the primary measurement system. Google Search Console reports **search**
performance (impressions, clicks, queries, position): a different thing from GA4's **website
traffic**; never mix the two numbers.

Code: `src/lib/analytics.ts` (configuration, event catalogue, `track()`),
`src/components/analytics/Analytics.tsx` (loader, consent, CTA clicks),
`src/components/insights/ArticleAnalytics.tsx` (article view, reading milestones),
`ShareBar.tsx` (PDF and share), `contact/InquiryForm.tsx` (lead).

## 1. How it behaves

- **Off until configured.** Nothing loads unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` (a `G-…` ID) is set.
  Set it for **Production only**: previews and local builds then never send data.
- **Production host only** (`adenchase.com`, `www.adenchase.com`).
- **Never on `/private/*`** (private assessments state that they use no analytics) or `/editions/*`.
- **Consent Mode v2.** Visitors in the EEA, UK and Switzerland: analytics cookies off by default
  (GA4 receives cookieless, modelled measurement only). Elsewhere: analytics on. Advertising
  storage, ad personalisation and Google signals are off everywhere. No cookie banner exists; if one
  is added later it should call `gtag('consent','update',{analytics_storage:'granted'})`.
- **No personal data.** Events carry only content identifiers (slug, issue, method, CTA label).
- **Page views** (including navigation without a reload) come from GA4 enhanced measurement;
  the site sends none itself, so nothing is double-counted.

## 2. Event catalogue

| Event | When | Parameters |
| --- | --- | --- |
| `page_view` (automatic) | Every page, including client-side navigation | GA4 standard |
| `article_view` | An article is opened (once per view) | `article_slug`, `article_issue`, `article_category`, `content_type` |
| `article_scroll` | 25, 50, 75, 90 % of the article read (each once per view) | `article_slug`, `article_issue`, `percent_scrolled` |
| `pdf_download` | "Download PDF" or "Open PDF" | `article_slug`, `article_issue`, `method` (`download`/`open`) |
| `share` (GA4 recommended) | LinkedIn, WhatsApp, Facebook, Email, native share sheet, or a successful copy-link | `method`, `content_type`, `item_id`, `article_slug`, `article_issue` |
| `cta_click` | Any link to `/contact` (from another page) | `cta_text`, `cta_destination`, `link_location` |
| `generate_lead` (GA4 recommended; mark as **key event**) | Contact form **accepted by the server** (never the button click) | `form_name` |

Note: `generate_lead` means the server accepted the inquiry. Until mail delivery for the contact
form is fixed (separate priority item), an accepted inquiry is not proof that it reached an inbox.

## 3. One-time setup (owner)

**GA4 property** (analytics.google.com, signed in with the ADEN-CHASE Google account):
1. Admin → Create → Property: name `ADEN-CHASE Strategies`, time zone **(GMT-05:00) Jamaica**,
   currency as preferred. Business details as prompted.
2. Data collection → Web stream: URL `https://adenchase.com`, name `adenchase.com`.
3. In the stream → Enhanced measurement → keep **Page views** with *Page changes based on browser
   history events* ON; keep **Outbound clicks** ON; turn **Scrolls**, **File downloads** and
   **Form interactions** OFF (the site sends precise versions of these; leaving them on double-counts
   or counts button clicks as submissions). Site search and video: off (not used).
4. Copy the **Measurement ID** (`G-…`) and send it here (it is public, not a secret).
5. Admin → Data retention → **14 months** (default is 2; needed for month-over-month comparisons).
6. Admin → Custom definitions → Create custom dimensions (event scope): `article_slug`,
   `article_issue`, `article_category`, `cta_text`, `link_location`, `form_name`.
   (`percent_scrolled` and `method` exist already.)
7. Admin → Events / Key events → mark `generate_lead` as a key event once it has appeared.
8. Admin → Data filters: optionally add an "Internal traffic" filter for the office IP.

**Vercel** (adenchase-site → Settings → Environment Variables): `NEXT_PUBLIC_GA_MEASUREMENT_ID`
= the ID, **Production** only. Then redeploy production (the ID is built into the site).

**Google Search Console** (not verified today: no meta tag, no DNS record):
- Simplest, no DNS change: search.google.com/search-console → Add property → **URL prefix**
  `https://adenchase.com/` → *HTML tag*. Copy only the `content` value into Vercel env
  `GOOGLE_SITE_VERIFICATION` (Production), redeploy, then press Verify. Submit
  `https://adenchase.com/sitemap.xml`. Then URL Inspection → the article → Request indexing.
- A **Domain** property (covers every subdomain) needs a DNS TXT record: only with explicit approval.
- Link Search Console to GA4 (GA4 Admin → Product links → Search Console) to see queries in GA4.

## 4. Verifying (after the ID is live)

Open `https://adenchase.com/insights/paradise-shouldnt-come-with-preventable-risks?ga_debug=1`
(the flag sends that one visit to **Admin → DebugView**), scroll, click Download PDF and a share
link; confirm `article_view`, `article_scroll` ×4, `pdf_download`, `share` in DebugView and the visit
in **Reports → Realtime**. Test a campaign link (section 5) and check Realtime → traffic source.

## 5. Campaign links (UTM convention)

Template (lower case, hyphens, no spaces, **no personal names**):

```
https://adenchase.com/insights/<slug>?utm_source=<source>&utm_medium=<medium>&utm_campaign=op-<issue>-<campaign>&utm_content=<promotion>
```

| Channel | `utm_source` | `utm_medium` |
| --- | --- | --- |
| LinkedIn post / article | `linkedin` | `social` (`paid-social` if boosted) |
| Instagram (bio link, story) | `instagram` | `social` |
| Facebook | `facebook` | `social` (`paid-social` if boosted) |
| WhatsApp (chat, broadcast, status) | `whatsapp` | `messaging` |
| Email campaign / newsletter | `newsletter` (or the list name) | `email` |
| Direct stakeholder outreach (individual email/message) | `outreach` | `direct-outreach` |

- `utm_campaign`: `op-001-launch`, `op-001-followup`, … (publication, issue, push).
- `utm_content`: the specific promotion: `post-2026-11-21`, `story-1`, `status-1`, `email-header-link`,
  `stakeholder-batch-a`. Never a recipient's name or email address.

Example (LinkedIn launch post):
`https://adenchase.com/insights/paradise-shouldnt-come-with-preventable-risks?utm_source=linkedin&utm_medium=social&utm_campaign=op-001-launch&utm_content=post-2026-11-21`

GA4 reads these automatically (Reports → Acquisition → Traffic acquisition: session source/medium,
session campaign, manual ad content). The canonical URL is unaffected. Untagged shares (people
sharing the article themselves) appear as their real referrer (e.g. `linkedin.com / referral`) or
as Direct; WhatsApp and many apps send no referrer, so untagged WhatsApp traffic shows as Direct.
Campaign credit should be claimed only for tagged sessions.

## 6. Measurement framework (from the first day of collection; no back-filling)

| View | GA4 | Search Console |
| --- | --- | --- |
| First 24 h / 7 d / 30 d per article | Explore → Free form: dimension `article_slug` (or Page path), metrics Views, Active users, Engaged sessions, Average engagement time, event counts (`article_scroll` by `percent_scrolled`, `pdf_download`, `share`), date range from publication date | Performance → Page = article URL: impressions, clicks, CTR, position |
| Week-over-week / month-over-month | Reports → Engagement → Pages and screens, compare date ranges | Performance → Compare |
| Article vs article | Explore, `article_slug` rows | Page filter |
| Organic vs campaign | Traffic acquisition: session default channel group (Organic Search vs. campaign source/medium) | Organic only |
| New vs returning, geography | Reports → User attributes / Demographics → Country, City | Country filter |
| Reading depth | `article_scroll` counts at 25/50/75/90 ÷ `article_view` | — |
| Conversions | `cta_click` → `generate_lead` (key event) | — |

Record a snapshot (date, metric, value, notes) at 24 h, 7 d and 30 d after each publication.

## 7. Activation log

| Service | Status | Active from |
| --- | --- | --- |
| GA4 tracking code (site) | Built, tested, inert until the Measurement ID is set | — |
| GA4 property / data stream | Awaiting owner setup | — |
| Search Console | Not verified | — |
| Vercel Web Analytics / Speed Insights | Enabled on the project, **not loaded by the site**, so no data | — |

Update this table with the date each service starts receiving real data.

## 8. Vercel Web Analytics: assessment

Not added in Phase 1. GA4 already covers traffic, sources, geography and engagement; a second
counter produces different numbers (different bot filtering, sessions and consent handling) and
invites confusion. Vercel Web Analytics is cookieless, so it would count EEA visitors fully, and
Speed Insights gives real-user Core Web Vitals; both are billed by usage on the Pro plan beyond the
included allowance: check the team's Usage page before enabling. Recommended later only if
real-user performance data (Speed Insights) is wanted.
