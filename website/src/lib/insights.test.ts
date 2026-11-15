import { describe, expect, it, vi } from "vitest";

vi.mock("@/content/insights", () => {
  const Body = () => null;
  const base = { excerpt: "e", category: "c", Body };
  return {
    ARTICLES: [
      { ...base, slug: "older", title: "Older", date: "2026-01-05", status: "published" },
      { ...base, slug: "newer", title: "Newer", date: "2026-02-10", status: "published" },
      { ...base, slug: "draft", title: "Draft", date: "", status: "draft" },
      { ...base, slug: "future", title: "Future", date: "2999-01-01", status: "published" },
      { ...base, slug: "undated", title: "Undated", date: "", status: "published" },
    ],
  };
});

describe("insights publishing", () => {
  it("shows only published, dated, non-future articles, newest first", async () => {
    const { publishedArticles } = await import("./insights");
    expect(publishedArticles().map((a) => a.slug)).toEqual(["newer", "older"]);
  });

  it("never resolves a draft, future or undated article by its URL", async () => {
    const { articleBySlug } = await import("./insights");
    for (const slug of ["draft", "future", "undated"]) expect(articleBySlug(slug)).toBeUndefined();
    expect(articleBySlug("newer")?.title).toBe("Newer");
  });

  it("credits the column's author by default", async () => {
    const { authorOf, publishedArticles } = await import("./insights");
    expect(authorOf(publishedArticles()[0])).toEqual({ name: "Emmanuel Adenaike, Sr.", role: "ADEN-CHASE Strategies" });
  });
});

describe("the inaugural article", () => {
  it("stays a draft until its approved copy is supplied", async () => {
    vi.resetModules();
    vi.doUnmock("@/content/insights");
    const { article } = await import("@/content/insights/jamaica-safe-waters");
    expect(article.status).toBe("draft");
  });
});
