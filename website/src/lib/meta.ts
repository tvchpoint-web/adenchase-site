import type { Metadata } from "next";
import { SEO, type SeoPath } from "@/lib/site";

/** The social preview: the authentic ADEN-CHASE logo on Midnight Navy (src/app/opengraph-image.png). */
const IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "ADEN-CHASE Strategies — Identifying Opportunity. Engineering Growth." };

/**
 * Page metadata from the SEO table in src/lib/site.ts: the search title, description, one canonical
 * URL, and matching social cards. A page-level openGraph replaces the site default entirely, so the
 * preview image is included here on every page.
 */
export function pageMeta(path: SeoPath): Metadata {
  const { title, description } = SEO[path];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description, images: [IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [IMAGE] },
  };
}
