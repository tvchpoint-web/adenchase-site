import { plainText, wordCount } from "@/lib/editorial/markdown";
import { INSIGHTS, authorOf, type Article, type EditionView, type RelatedEntity, view } from "@/lib/insights";
import { SITE } from "@/lib/site";
import { organizationNode } from "@/lib/structured-data";

/**
 * Schema.org data for an edition: the article (an opinion piece for perspectives, so readers and
 * machines can tell analysis from reporting), its author and publisher, what it is about, where,
 * the sources it cites, and the breadcrumb trail. Built only from the edition's own fields.
 */
const entity = (e: RelatedEntity) => ({ "@type": e.type, name: e.name, ...(e.description ? { description: e.description } : {}) });

export function editionJsonLd(a: Article, v: EditionView = view(a)) {
  const au = authorOf(a);
  const d = a.discoverability;
  const g = d?.geography;
  // One Place for the location: described once (contentLocation) and referenced from `about`.
  const place = g
    ? {
        "@type": "Place",
        "@id": `${v.url}#location`,
        name: g.name,
        ...(g.alternateNames?.length ? { alternateName: g.alternateNames } : {}),
        ...(g.description ? { description: g.description } : {}),
        address: { "@type": "PostalAddress", ...(g.region ? { addressRegion: g.region } : {}), addressCountry: g.countryCode },
        containedInPlace: g.regionName
          ? { "@type": "AdministrativeArea", name: g.regionName, containedInPlace: { "@type": "Country", name: g.country } }
          : { "@type": "Country", name: g.country },
      }
    : null;
  const org = organizationNode;
  const article = {
    "@type": a.kind === "report" ? "NewsArticle" : "OpinionNewsArticle",
    "@id": `${v.url}#article`,
    headline: a.title,
    alternativeHeadline: a.subtitle,
    description: a.description,
    url: v.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": v.url },
    datePublished: a.date,
    dateModified: a.modified ?? a.date,
    inLanguage: "en",
    isAccessibleForFree: true,
    articleSection: a.category,
    wordCount: wordCount(plainText(v.blocks)), // body only
    timeRequired: `PT${v.minutes}M`,
    image: [
      // The approved featured photograph (online article), with its licence and credit for image search.
      ...(a.image.approved && a.image.src
        ? [
            {
              "@type": "ImageObject",
              url: `${SITE.url}${a.image.src}`,
              ...(a.image.width && a.image.height ? { width: a.image.width, height: a.image.height } : {}),
              caption: a.image.alt,
              ...(a.image.attribution
                ? {
                    creditText: `${a.image.attribution.author} (${a.image.attribution.licence})`,
                    creator: { "@type": "Person", name: a.image.attribution.author, ...(a.image.attribution.authorUrl ? { url: a.image.attribution.authorUrl } : {}) },
                    license: a.image.attribution.licenceUrl,
                    acquireLicensePage: a.image.attribution.sourceUrl,
                  }
                : {}),
            },
          ]
        : []),
      { "@type": "ImageObject", url: `${SITE.url}${v.assets.landscape}`, width: 1200, height: 630 },
      { "@type": "ImageObject", url: `${SITE.url}${v.assets.portrait}`, width: 1080, height: 1350 },
    ],
    author: { "@type": "Person", name: au.name, jobTitle: au.title, worksFor: { "@id": org["@id"] } },
    publisher: { "@id": org["@id"] },
    isPartOf: { "@type": "Periodical", name: INSIGHTS.title, publisher: { "@id": org["@id"] }, url: `${SITE.url}/insights` },
    encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: `${SITE.url}${v.assets.pdf}` },
    ...(d
      ? {
          about: [{ "@type": "Thing", name: d.primaryTopic }, ...(place ? [{ "@id": place["@id"] }] : []), ...d.entities.filter((e) => e.type === "Place").map(entity)],
          mentions: d.entities.filter((e) => e.type !== "Place").map(entity),
          keywords: [d.primaryTopic, ...d.secondaryTopics].join(", "),
          ...(place ? { contentLocation: place } : {}),
          citation: d.sources.map((s) => ({ "@type": "NewsArticle", headline: s.title, url: s.url, publisher: { "@type": "Organization", name: s.publisher }, ...(s.date ? { datePublished: s.date } : {}) })),
        }
      : {}),
  };
  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: INSIGHTS.title, item: `${SITE.url}/insights` },
      { "@type": "ListItem", position: 3, name: a.title, item: v.url },
    ],
  };
  return { "@context": "https://schema.org", "@graph": [org, article, breadcrumbs] };
}
