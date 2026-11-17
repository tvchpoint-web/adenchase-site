import { DISCIPLINES, INSTITUTIONAL_CAPABILITIES, SEO, SITE } from "@/lib/site";
import { INSIGHTS, authorOf, publishedArticles } from "@/lib/insights";

/**
 * /llms.txt: a plain-language summary of the site with links, following the llms.txt proposal
 * (https://llmstxt.org). It is a supplementary convenience for AI tools, not a ranking mechanism and
 * no guarantee of inclusion. Generated from the same approved copy as the pages, so it cannot drift.
 */
export const dynamic = "force-static";

const url = (path: string) => `${SITE.url}${path}`;

export function GET() {
  const articles = publishedArticles().filter((a) => a.status === "published");
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} is a strategic consultancy. Tagline: "${SITE.statement}" Its three connected disciplines are ${SITE.disciplines.replace(/ • /g, ", ").replace(/, (?=[^,]*$)/, " and ")}. It works with businesses and enterprises, professional services firms, brands, hospitality and destination businesses, and government and public-sector institutions. Engagements are tailored; the site lists no fixed packages or prices.`,
    "",
    "## Disciplines",
    "",
    ...DISCIPLINES.map((d) => `- [${d.title}](${url(d.href)}): ${SEO[d.href].description} Capabilities: ${d.capabilities.map((c) => c.title).join("; ")}.`),
    `- [Government & Institutions](${url("/government-institutions")}): ${SEO["/government-institutions"].description} An application of the three disciplines. Capabilities: ${INSTITUTIONAL_CAPABILITIES.map((c) => c.title).join("; ")}.`,
    "",
    "## Company",
    "",
    `- [About](${url("/about")}): ${SEO["/about"].description}`,
    `- [Capabilities](${url("/capabilities")}): ${SEO["/capabilities"].description}`,
    `- [Contact](${url("/contact")}): How to start a conversation or request a private consultation.`,
    "",
    `## ${INSIGHTS.title} (editorial)`,
    "",
    `- [${INSIGHTS.title}](${url("/insights")}): ${INSIGHTS.about}`,
    ...articles.map((a) => `- [${a.title}](${url(`/insights/${a.slug}`)}): ${a.description} By ${authorOf(a).name}, ${authorOf(a).title}, ${authorOf(a).organization}. Published ${a.date}. Opinion and analysis.`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
