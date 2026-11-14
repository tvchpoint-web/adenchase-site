import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/capabilities", ...NAV.map((n) => n.href)].map((path) => ({ url: `${SITE.url}${path === "/" ? "" : path}` }));
}
