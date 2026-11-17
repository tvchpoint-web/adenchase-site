import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/insights";
import { isPublished } from "@/lib/insights";
import { NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/capabilities", ...NAV.map((n) => n.href)].map((path) => ({ url: `${SITE.url}${path === "/" ? "" : path}` }));
  // Published articles only (drafts never appear).
  const articles = ARTICLES.filter(isPublished).map((a) => ({ url: `${SITE.url}/insights/${a.slug}`, lastModified: a.modified ?? a.date }));
  return [...pages, ...articles];
}
