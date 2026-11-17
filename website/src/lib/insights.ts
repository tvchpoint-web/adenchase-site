import { ARTICLES, AUTHORS } from "@/content/insights";
import { parseMarkdown, plainText, readingMinutes, wordCount, type Block } from "@/lib/editorial/markdown";
import { SITE } from "@/lib/site";

/**
 * The Opportunity Perspective — ADEN-CHASE Strategies' editorial publication.
 *
 * One file per edition in src/content/insights/ (see the README there). Everything a reader or a
 * search engine sees — the landing page, the article, the homepage feature, the sitemap, social
 * metadata, the PDF and the promotional graphics — is derived from that single source.
 */

export type ArticleStatus = "draft" | "published";

export interface Author {
  name: string;
  title: string;
  organization: string;
  email?: string;
  /** False until mail to the address is confirmed to be delivered; the address is then not linked. */
  emailVerified?: boolean;
}

export interface EditorialImage {
  /** File in /public (e.g. /photos/editions/001-blue-hole.webp); null while no approved image is on file. */
  src: string | null;
  alt: string;
  /** What the photograph shows (also used on the placeholder). */
  subject: string;
  width?: number;
  height?: number;
  /** Visible credit line, e.g. "Photograph: Jane Doe / Agency". */
  credit: string | null;
  /** Where the image came from (owner, agency page, licence record). */
  source: string | null;
  /** Licence and the uses it covers (website, PDF, social, promotional). */
  licence: string | null;
  /** True only once the owner has approved the image and its licence covers every distribution format. */
  approved: boolean;
}

/** A verified source the edition cites (shown in structured data; links stay in the body). */
export interface SourceReference {
  title: string;
  publisher: string;
  url: string;
  /** ISO date of the source's publication, if known. */
  date?: string;
  /** Confirmed reachable and matching its description (date of the check). */
  verified: string;
}

/** A person, place, organisation or concept the edition is about or mentions. */
export interface RelatedEntity {
  name: string;
  type: "Place" | "Organization" | "Person" | "Thing" | "Event";
  /** Plain description, e.g. "Proposed initiative (not an established programme)". */
  description?: string;
}

/**
 * Discoverability: who the edition serves and how people search for its subject. Used for honest
 * metadata and structured data (never repeated into the visible text or hidden on the page).
 */
export interface Discoverability {
  primaryTopic: string;
  secondaryTopics: string[];
  /** Search intentions the edition genuinely answers (targets, not measured volumes). */
  searchIntents: string[];
  /** Natural-language questions the edition helps answer. */
  questions: string[];
  geography?: { name: string; region?: string; country: string; countryCode: string };
  entities: RelatedEntity[];
  sources: SourceReference[];
  /** Slugs of related published editions (shown only once they exist). */
  related?: string[];
}

/** A short visible standfirst; shown only once approved. */
export interface EditorialSummary {
  text: string;
  status: "proposed" | "approved";
}

export interface Article {
  /** Issue number, unique across the publication (validated by the unit tests). */
  issue: number;
  /** Optional edition label shown with the issue, e.g. "Inaugural Edition". */
  edition?: string;
  /** The URL: /insights/<slug>. Lowercase words joined by hyphens; never change it once published. */
  slug: string;
  title: string;
  subtitle: string;
  /** Meta description and social description (one or two sentences). */
  description: string;
  /** Full <title>; defaults to "<title> | ADEN-CHASE Strategies". */
  seoTitle?: string;
  /** Key into AUTHORS. */
  author: string;
  category: string;
  /** ISO date (YYYY-MM-DD) of publication. Required to publish; may be empty while a draft. */
  date: string;
  /** ISO date of the last substantive change, if any. */
  modified?: string;
  status: ArticleStatus;
  /** The edition featured at the top of the publication (otherwise the newest). */
  featured?: boolean;
  image: EditorialImage;
  /** The body, in the small Markdown dialect of src/lib/editorial/markdown.ts. */
  body: string;
  /** Opinion/analysis (the default for this publication) or straight reporting. */
  kind?: "perspective" | "report";
  summary?: EditorialSummary;
  discoverability?: Discoverability;
}

export const INSIGHTS = {
  label: "Insights",
  title: "The Opportunity Perspective",
  tagline: "Ideas. Observations. Opportunities.",
  description: "Ideas, observations, and practical thinking on business, technology, opportunity, and progress.",
  about:
    "The Opportunity Perspective is an editorial platform within ADEN-CHASE Strategies, exploring situations, emerging trends, and opportunities through a constructive strategic lens.",
  publisher: SITE.name,
} as const;

const today = () => new Date().toISOString().slice(0, 10);

/** Drafts are visible only in local development (`npm run dev`), never in a build or preview. */
const showDrafts = process.env.NODE_ENV === "development";

export function isPublished(a: Pick<Article, "status" | "date">) {
  return a.status === "published" && /^\d{4}-\d{2}-\d{2}$/.test(a.date) && a.date <= today();
}

const byNewest = (a: Article, b: Article) => (b.date || "9999").localeCompare(a.date || "9999") || b.issue - a.issue;

/** Editions a visitor can see, newest first. */
export function publishedArticles(): Article[] {
  return ARTICLES.filter((a) => isPublished(a) || (showDrafts && a.status === "draft")).sort(byNewest);
}

export function articleBySlug(slug: string): Article | undefined {
  return publishedArticles().find((a) => a.slug === slug);
}

/** The edition at the top of the publication: the one marked featured, otherwise the newest. */
export function featuredArticle(): Article | undefined {
  const all = publishedArticles();
  return all.find((a) => a.featured) ?? all[0];
}

/** Categories that have at least one visible edition (only these are ever shown). */
export function publishedCategories(): string[] {
  return [...new Set(publishedArticles().map((a) => a.category))];
}

export function authorOf(a: Pick<Article, "author">): Author {
  const au = AUTHORS[a.author];
  if (!au) throw new Error(`Unknown author "${a.author}"`);
  return au;
}

export const issueLabel = (n: number) => `Issue ${String(n).padStart(3, "0")}`;

/* -------------------------------------------------------------- derived */

export type EditionView = Article & {
  blocks: Block[];
  words: number;
  minutes: number;
  url: string;
  assets: { pdf: string; pdfName: string; landscape: string; portrait: string; story: string };
};

/** Public asset locations for an edition (generated by `npm run editions`; see README.md). */
export function editionAssets(a: Pick<Article, "issue">) {
  const n = String(a.issue).padStart(3, "0");
  const base = `/editions/${n}`;
  const pdfName = `ADEN-CHASE-The-Opportunity-Perspective-Issue-${n}.pdf`;
  return {
    pdf: `${base}/${pdfName}`,
    pdfName,
    landscape: `${base}/opportunity-perspective-${n}-1200x630.jpg`,
    portrait: `${base}/opportunity-perspective-${n}-1080x1350.jpg`,
    story: `${base}/opportunity-perspective-${n}-1080x1920.jpg`,
  };
}

export function view(a: Article): EditionView {
  const blocks = parseMarkdown(a.body);
  const words = wordCount(`${a.title} ${a.subtitle} ${plainText(blocks)}`);
  return { ...a, blocks, words, minutes: readingMinutes(words), url: `${SITE.url}/insights/${a.slug}`, assets: editionAssets(a) };
}

export function formatDate(iso: string) {
  if (!iso) return "Draft";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * A fingerprint of everything the generated assets show. `npm run editions` records it next to
 * the PDF and graphics; a unit test fails if an edition changes without its assets being rebuilt.
 */
/** Bump when the PDF or graphic templates change, so every edition's assets must be regenerated. */
export const EDITION_TEMPLATE_VERSION = 1;

export function editionFingerprint(a: Article): string {
  const au = authorOf(a);
  const s = JSON.stringify([EDITION_TEMPLATE_VERSION, a.issue, a.edition, a.slug, a.title, a.subtitle, a.category, a.date, a.body, a.image, au]);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0") + ":" + s.length.toString(16);
}
