import type { ComponentType } from "react";
import { ARTICLES } from "@/content/insights";

/**
 * Insights: "The Opportunity Perspective", a recurring editorial column.
 *
 * Every article is one file in src/content/insights/ (see the README there) registered in
 * src/content/insights/index.ts. Pages, the homepage preview, the sitemap and social metadata all
 * read from here, so adding an article never touches a page component.
 */

export type ArticleStatus = "draft" | "published";

export interface Article {
  /** The URL: /insights/<slug>. Lowercase words joined by hyphens; never change it once published. */
  slug: string;
  title: string;
  /** One or two sentences: the subtitle on the article and the excerpt on cards and social previews. */
  excerpt: string;
  /** ISO date (YYYY-MM-DD) of publication. Required to publish; may be empty while a draft. */
  date: string;
  category: string;
  status: ArticleStatus;
  author?: { name: string; role: string };
  /** Optional featured image: a file in /public, with real alt text and its credit. */
  image?: { src: string; alt: string; width: number; height: number; credit?: string };
  /** The article body: headings, paragraphs, quotations and links, using the Prose components. */
  Body: ComponentType;
}

export const INSIGHTS = {
  label: "Insights",
  title: "The Opportunity Perspective",
  descriptor: "Business • Technology • Innovation • Growth",
  author: { name: "Emmanuel Adenaike, Sr.", role: "ADEN-CHASE Strategies" },
  intro:
    "A recurring column of original observations, thoughtful analysis, and practical perspectives on business, technology, innovation, institutional challenges, and emerging opportunities.",
  purpose:
    "Not a news feed and not promotion: independent thinking about where meaningful improvement is possible, and how to pursue it.",
  description:
    "The Opportunity Perspective by Emmanuel Adenaike, Sr.: original analysis and practical perspectives on business, technology, innovation, and growth.",
} as const;

const today = () => new Date().toISOString().slice(0, 10);

/** Drafts are visible only in local development (`npm run dev`), never in a build or preview. */
const showDrafts = process.env.NODE_ENV === "development";

export function isPublished(a: Article) {
  return a.status === "published" && /^\d{4}-\d{2}-\d{2}$/.test(a.date) && a.date <= today();
}

/** Articles a visitor can see, newest first. */
export function publishedArticles(): Article[] {
  return ARTICLES.filter((a) => isPublished(a) || (showDrafts && a.status === "draft")).sort((a, b) => (b.date || "9999").localeCompare(a.date || "9999"));
}

export function articleBySlug(slug: string): Article | undefined {
  return publishedArticles().find((a) => a.slug === slug);
}

export function authorOf(a: Article) {
  return a.author ?? INSIGHTS.author;
}

export function formatDate(iso: string) {
  if (!iso) return "Draft";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
