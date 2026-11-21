/**
 * Website analytics (Google Analytics 4). See docs/ANALYTICS.md.
 *
 * - Loads only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (Production only) and only on the
 *   production hostname, so previews and local builds never send data.
 * - Never on /private/* (private assessments promise no analytics) or the /editions templates.
 * - Events carry only content identifiers (article slug, issue, share method, CTA label): never
 *   names, email addresses, form contents or other personal information.
 */
const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const GA_ID = /^G-[A-Z0-9]{4,20}$/.test(RAW_ID) ? RAW_ID : null;

/** Hostnames that report to GA4 (the canonical domain; www redirects to it). */
export const TRACKED_HOSTS = ["adenchase.com", "www.adenchase.com"];

export const isTrackedPath = (path: string | null | undefined) => !!path && !path.startsWith("/private") && !path.startsWith("/editions");

/** EEA, UK and Switzerland: analytics cookies stay off (cookieless measurement only) without consent. */
export const CONSENT_REQUIRED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

type ArticleParams = { article_slug: string; article_issue: string };
/** The event catalogue (names and parameters). Keep in step with docs/ANALYTICS.md. */
export type AnalyticsEvents = {
  article_view: ArticleParams & { article_category: string; content_type: string };
  article_scroll: ArticleParams & { percent_scrolled: 25 | 50 | 75 | 90 };
  pdf_download: ArticleParams & { method: "download" | "open" };
  share: ArticleParams & { method: "linkedin" | "whatsapp" | "facebook" | "email" | "copy_link" | "native"; content_type: "article"; item_id: string };
  cta_click: { cta_text: string; cta_destination: string; link_location: string };
  generate_lead: { form_name: "contact_inquiry" };
};

type Gtag = (...args: unknown[]) => void;
type W = Window & { dataLayer?: unknown[]; gtag?: Gtag };

/** Whether this page view reports to GA4 (configured ID, production host, tracked path). */
export const analyticsActiveHere = () =>
  typeof window !== "undefined" && !!GA_ID && TRACKED_HOSTS.includes(window.location.hostname) && isTrackedPath(window.location.pathname);

// Events raised before GA4 is initialised (components mount before the analytics loader) wait
// here and are sent, in order, right after the consent defaults and configuration.
let ready = false;
const early: [string, object][] = [];

/** Sends an event if GA4 is active on this page; otherwise does nothing. */
export function track<K extends keyof AnalyticsEvents>(name: K, params: AnalyticsEvents[K]) {
  if (!analyticsActiveHere()) return;
  const w = window as W;
  if (ready && typeof w.gtag === "function") w.gtag("event", name, params);
  else early.push([name, params]);
}

/** Consent defaults and configuration, then any queued events (once per page load). */
export function initAnalytics(debug: boolean) {
  if (ready || !GA_ID) return;
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag.js expects the arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  const deny = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
  w.gtag("consent", "default", { analytics_storage: "denied", ...deny, region: CONSENT_REQUIRED_REGIONS });
  w.gtag("consent", "default", { analytics_storage: "granted", ...deny });
  w.gtag("js", new Date());
  w.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, ...(debug ? { debug_mode: true } : {}) });
  ready = true;
  for (const [name, params] of early.splice(0)) w.gtag("event", name, params);
}

/** Article identifiers from an article URL and its PDF path (e.g. /editions/001/…). */
export function articleIdsFrom(url: string, pdf: string): ArticleParams {
  const slug = url.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop() ?? "";
  const issue = /\/editions\/(\d{3})\//.exec(pdf)?.[1] ?? "";
  return { article_slug: slug, article_issue: issue };
}
