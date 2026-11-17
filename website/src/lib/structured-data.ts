import { DISCIPLINES, INSTITUTIONAL_CAPABILITIES, SEO, SITE, type Capability, type SeoPath } from "@/lib/site";

/**
 * Schema.org data describing the firm, the website and each service page, built only from the
 * approved copy in src/lib/site.ts. Nothing here may claim clients, offices, addresses, phone
 * numbers, credentials, awards or prices the site does not state. (ProfessionalService is not used:
 * search engines treat it as a local business, which requires a public street address.)
 */
export const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;
const abs = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

export const organizationNode = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE.name,
  url: SITE.url,
  logo: { "@type": "ImageObject", url: `${SITE.url}/brand/aden-chase-logo.png`, width: 1397, height: 473 },
  slogan: SITE.statement,
  description: SITE.description,
  knowsAbout: [
    ...DISCIPLINES.map((d) => d.title),
    ...DISCIPLINES.flatMap((d) => d.capabilities.map((c) => c.title)),
    ...INSTITUTIONAL_CAPABILITIES.map((c) => c.title),
  ].filter((v, i, all) => all.indexOf(v) === i),
  contactPoint: { "@type": "ContactPoint", contactType: "Business inquiries", url: abs("/contact") },
};

export function siteJsonLd() {
  const website = { "@type": "WebSite", "@id": WEBSITE_ID, url: SITE.url, name: SITE.name, inLanguage: "en", publisher: { "@id": ORG_ID } };
  return { "@context": "https://schema.org", "@graph": [organizationNode, website] };
}

function crumbs(path: SeoPath, name: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name, item: abs(path) },
    ],
  };
}

/** A service page: what the service is, who provides it, and the capabilities listed on the page. */
export function serviceJsonLd(path: SeoPath, name: string, capabilities: Capability[], audience?: string) {
  const service = {
    "@type": "Service",
    "@id": `${abs(path)}#service`,
    name,
    serviceType: name,
    description: SEO[path].description,
    url: abs(path),
    provider: { "@id": ORG_ID },
    ...(audience ? { audience: { "@type": "Audience", audienceType: audience } } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${name} capabilities`,
      itemListElement: capabilities.map((c) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: c.title, description: c.description } })),
    },
  };
  return { "@context": "https://schema.org", "@graph": [service, crumbs(path, name)] };
}

/** A plain page's breadcrumb (About, Capabilities, Insights, Contact). */
export function pageJsonLd(path: SeoPath, name: string) {
  return { "@context": "https://schema.org", ...crumbs(path, name) };
}
