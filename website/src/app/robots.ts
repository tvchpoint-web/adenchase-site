import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Production is indexable; Vercel previews (and any non-production deployment) are not. */
export default function robots(): MetadataRoute.Robots {
  const production = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";
  if (!production) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/editions/list"] }, sitemap: `${SITE.url}/sitemap.xml` };
}
