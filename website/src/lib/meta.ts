import type { Metadata } from "next";

/** The social preview: the authentic ADEN-CHASE logo on Midnight Navy (src/app/opengraph-image.png). */
const IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "ADEN-CHASE Strategies — Identifying Opportunity. Engineering Growth." };

/**
 * Page metadata with matching social cards. A page-level openGraph replaces the site default
 * entirely, so the preview image is included here on every page.
 */
export function pageMeta(title: string, description: string, { absolute = false } = {}): Metadata {
  const full = absolute ? title : `${title} | ADEN-CHASE Strategies`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    openGraph: { title: full, description, images: [IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [IMAGE] },
  };
}
