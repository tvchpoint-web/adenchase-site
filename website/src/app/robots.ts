import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Previews are kept out of search by the X-Robots-Tag header on *.vercel.app hosts (next.config.ts). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/editions/list"] }, sitemap: `${SITE.url}/sitemap.xml` };
}
