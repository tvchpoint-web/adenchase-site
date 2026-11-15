import type { MetadataRoute } from "next";
import { publishedArticles } from "@/lib/insights";
import { NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/capabilities", ...NAV.map((n) => n.href)].map((path) => ({ url: `${SITE.url}${path === "/" ? "" : path}` }));
  // Published articles only (drafts never appear).
  const articles = publishedArticles()
    .filter((a) => a.status === "published")
    .map((a) => ({ url: `${SITE.url}/insights/${a.slug}`, lastModified: a.date }));
  return [...pages, ...articles];
}
