import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

const ROOT = join(__dirname, "..", "..");

describe("publishing rules", () => {
  it("shows only published, dated, non-future editions, newest first", async () => {
    vi.resetModules();
    vi.doMock("@/content/insights", () => {
      const base = { subtitle: "s", description: "d", category: "c", author: "a", body: "x", image: { src: null, alt: "", subject: "", credit: null, source: null, licence: null, approved: false } };
      return {
        AUTHORS: { a: { name: "A", title: "T", organization: "O" } },
        ARTICLES: [
          { ...base, issue: 1, slug: "older", title: "Older", date: "2026-01-05", status: "published" },
          { ...base, issue: 2, slug: "newer", title: "Newer", date: "2026-02-10", status: "published" },
          { ...base, issue: 3, slug: "draft", title: "Draft", date: "", status: "draft" },
          { ...base, issue: 4, slug: "future", title: "Future", date: "2999-01-01", status: "published" },
        ],
      };
    });
    const { publishedArticles, articleBySlug, featuredArticle } = await import("./insights");
    expect(publishedArticles().map((a) => a.slug)).toEqual(["newer", "older"]);
    for (const slug of ["draft", "future"]) expect(articleBySlug(slug)).toBeUndefined();
    expect(featuredArticle()?.slug).toBe("newer");
    vi.doUnmock("@/content/insights");
    vi.resetModules();
  });
});

describe("The Opportunity Perspective editions", () => {
  it("gives every edition a unique issue number and slug, and a known author", async () => {
    const { ARTICLES, AUTHORS } = await import("@/content/insights");
    const issues = ARTICLES.map((a) => a.issue);
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(issues).size, "duplicate issue number").toBe(issues.length);
    expect(new Set(slugs).size, "duplicate slug").toBe(slugs.length);
    for (const a of ARTICLES) {
      expect(AUTHORS[a.author], a.slug).toBeTruthy();
      expect(a.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(Number.isInteger(a.issue) && a.issue > 0).toBe(true);
    }
  });

  it("renders the body without changing a word", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const { parseMarkdown, plainText } = await import("@/lib/editorial/markdown");
    for (const a of ARTICLES) {
      // The body minus its three markup conventions must equal the rendered text exactly.
      const expected = a.body
        .trim()
        .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
        .replace(/^## /gm, "")
        .replace(/^[*-] /gm, "")
        .replace(/\n\s*\n/g, "\n\n");
      expect(plainText(parseMarkdown(a.body))).toBe(expected);
    }
  });

  it("keeps Issue 001's approved wording, structure and source link", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const { parseMarkdown } = await import("@/lib/editorial/markdown");
    const a = ARTICLES.find((x) => x.issue === 1)!;
    expect(a.title).toBe("Paradise Shouldn't Come With Preventable Risks");
    expect(a.subtitle).toBe("An opportunity to strengthen Jamaica's tourism experience through a renewed commitment to water safety.");
    const blocks = parseMarkdown(a.body);
    expect(blocks.filter((b) => b.type === "h2").map((b) => (b as { text: string }).text)).toEqual([
      "Safety as Part of the Experience",
      "Introducing the Jamaica Safe Waters Conversation",
      "An Opportunity for Jamaica to Lead",
      "Seeing Opportunity Differently",
    ]);
    expect(blocks.find((b) => b.type === "ul")).toMatchObject({ items: { length: 7 } });
    expect(a.body).toContain("[recent report of a fatal incident](https://www.jamaicaobserver.com/2026/11/15/us-tourist-drowns-trying-help-mother-blue-hole-st-ann/)");
    expect(a.body.trim().startsWith("Some time ago, I had the pleasure of visiting Blue Hole")).toBe(true);
    expect(a.body.trim().endsWith("And protecting those who come to experience it should be part of what makes it extraordinary.")).toBe(true);
  });

  it("calculates reading time from the actual text", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const { view } = await import("./insights");
    const v = view(ARTICLES[0]);
    expect(v.words).toBeGreaterThan(600);
    expect(v.minutes).toBe(Math.ceil(v.words / 230));
  });

  it("has current generated assets (PDF and graphics) for every published edition", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const { editionFingerprint, isPublished, editionAssets } = await import("./insights");
    const manifestPath = join(ROOT, "public/editions/manifest.json");
    const manifest = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, { fingerprint: string }>) : {};
    for (const a of ARTICLES.filter(isPublished)) {
      const assets = editionAssets(a);
      for (const f of [assets.pdf, assets.landscape, assets.portrait, assets.story]) expect(existsSync(join(ROOT, "public", f)), `${f} missing — run npm run editions`).toBe(true);
      expect(manifest[a.slug]?.fingerprint, `${a.slug} changed since its assets were generated — run npm run editions`).toBe(editionFingerprint(a));
    }
  });
});

describe("discoverability", () => {
  it("gives every published edition unique, honest search metadata", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const titles = ARTICLES.map((a) => a.seoTitle ?? a.title);
    const descs = ARTICLES.map((a) => a.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
    for (const a of ARTICLES) {
      expect((a.seoTitle ?? a.title).length, a.slug).toBeLessThanOrEqual(65);
      expect(a.description.length, a.slug).toBeGreaterThan(70);
      expect(a.description.length, a.slug).toBeLessThanOrEqual(170);
    }
    const i1 = ARTICLES.find((a) => a.issue === 1)!;
    expect(i1.seoTitle).toBe("Blue Hole Jamaica: Tourism & Water Safety | ADEN-CHASE");
    expect(i1.description).toBe(
      "Following the recent Blue Hole accident in Jamaica, Emmanuel Adenaike, Sr. explores water safety, visitor protection and the proposed Jamaica Safe Waters initiative.",
    );
  });

  it("builds Article, publisher and breadcrumb structured data from the edition", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const { editionJsonLd } = await import("@/lib/editorial/structured-data");
    const ld = editionJsonLd(ARTICLES.find((a) => a.issue === 1)!) as { "@graph": Record<string, unknown>[] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- free-form JSON-LD under test
    const [org, article, crumbs] = ld["@graph"] as Record<string, any>[];
    expect(org["@type"]).toBe("Organization");
    expect(article["@type"]).toBe("OpinionNewsArticle"); // analysis, not straight news
    expect(article.headline).toBe("Paradise Shouldn't Come With Preventable Risks");
    expect(article.url).toBe("https://adenchase.com/insights/paradise-shouldnt-come-with-preventable-risks");
    expect(article.author).toMatchObject({ name: "Emmanuel Adenaike, Sr.", jobTitle: "Strategic Development Advisor" });
    expect(article.citation[0].url).toBe("https://www.jamaicaobserver.com/2026/11/15/us-tourist-drowns-trying-help-mother-blue-hole-st-ann/");
    expect(JSON.stringify(article.mentions)).toMatch(/Jamaica Safe Waters.*[Pp]roposed/);
    // The specific Blue Hole: near Ocho Rios, St. Ann (as the cited report locates it), one linked Place.
    expect(article.contentLocation).toMatchObject({ "@id": `${article.url}#location`, name: "Blue Hole", alternateName: expect.arrayContaining(["Island Gully Falls"]) });
    expect(article.contentLocation.description).toMatch(/near Ocho Rios, St\. Ann, Jamaica/);
    expect(article.contentLocation.address).toMatchObject({ addressRegion: "St. Ann", addressCountry: "JM" });
    expect(article.contentLocation.containedInPlace).toMatchObject({ name: "Saint Ann Parish", containedInPlace: { name: "Jamaica" } });
    expect(article.about).toContainEqual({ "@id": `${article.url}#location` });
    expect(JSON.stringify(ld)).not.toMatch(/St\.? Mary|Portland|Westmoreland/); // no unsupported locations
    // The approved featured photograph is listed first, with its CC BY licence and credit.
    expect(article.image[0]).toMatchObject({ url: "https://adenchase.com/photos/editions/001-blue-hole.jpg", width: 1319, height: 740, license: "https://creativecommons.org/licenses/by/2.0/", creator: { name: "nigel burgher" } });
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement).toHaveLength(3);
  });

  it("keeps the Jamaica Safe Waters idea framed as a proposal wherever it is described", async () => {
    const { ARTICLES } = await import("@/content/insights");
    const a = ARTICLES.find((x) => x.issue === 1)!;
    expect(a.body).toContain("provisionally called Jamaica Safe Waters");
    expect(a.description).toContain("proposed Jamaica Safe Waters initiative");
    expect(a.summary?.text ?? "").toMatch(/provisionally called Jamaica Safe Waters/);
  });
});
