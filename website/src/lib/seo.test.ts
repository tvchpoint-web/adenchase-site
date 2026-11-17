import { describe, expect, it } from "vitest";
import { NAV, SEO } from "@/lib/site";
import { organizationNode, pageJsonLd, serviceJsonLd, siteJsonLd } from "@/lib/structured-data";
import { DISCIPLINES, INSTITUTIONAL_CAPABILITIES } from "@/lib/site";

describe("search metadata", () => {
  it("covers every public page with a unique, honest title and description", () => {
    const paths = ["/", "/capabilities", ...NAV.map((n) => n.href)];
    for (const p of paths) expect(SEO, p).toHaveProperty([p]);
    const entries = Object.values(SEO);
    expect(new Set(entries.map((e) => e.title)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.description)).size).toBe(entries.length);
    for (const [p, e] of Object.entries(SEO)) {
      expect(e.title.length, p).toBeLessThanOrEqual(65);
      expect(e.title, p).toContain("ADEN-CHASE");
      expect(e.description.length, p).toBeGreaterThanOrEqual(70);
      expect(e.description.length, p).toBeLessThanOrEqual(170);
    }
  });
});

describe("site structured data", () => {
  const all = JSON.stringify([
    siteJsonLd(),
    ...DISCIPLINES.map((d) => serviceJsonLd(d.href, d.title, d.capabilities)),
    serviceJsonLd("/government-institutions", "Government & Institutions", INSTITUTIONAL_CAPABILITIES),
    pageJsonLd("/about", "About"),
  ]);

  it("describes the organisation from approved copy only", () => {
    expect(organizationNode.name).toBe("ADEN-CHASE Strategies");
    expect(organizationNode.slogan).toBe("Identifying Opportunity. Engineering Growth.");
    expect(organizationNode.knowsAbout).toEqual(expect.arrayContaining(["Business Development", "AI Engineering", "Market Growth"]));
  });

  it("never claims facts the site does not state", () => {
    // No invented address, phone, ratings, reviews, awards, clients, founders, prices or locations.
    for (const field of ["address", "telephone", "aggregateRating", "review", "award", "founder", "price", "areaServed", "sameAs", "member", "employee"]) {
      expect(all, field).not.toContain(`"${field}"`);
    }
  });

  it("links every service to the one organisation", () => {
    for (const d of DISCIPLINES) {
      const s = serviceJsonLd(d.href, d.title, d.capabilities)["@graph"][0] as Record<string, unknown>;
      expect(s.provider).toEqual({ "@id": "https://adenchase.com/#organization" });
      expect(s.url).toBe(`https://adenchase.com${d.href}`);
    }
  });
});
