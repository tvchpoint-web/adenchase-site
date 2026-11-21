import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("analytics configuration", () => {
  it("is off unless a valid GA4 Measurement ID is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect((await import("./analytics")).GA_ID).toBeNull();
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "UA-12345-1"); // not a GA4 ID
    expect((await import("./analytics")).GA_ID).toBeNull();
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", " G-ABC123XYZ9 ");
    expect((await import("./analytics")).GA_ID).toBe("G-ABC123XYZ9");
  });

  it("never measures private assessments or edition templates", async () => {
    const { isTrackedPath } = await import("./analytics");
    expect(isTrackedPath("/insights/paradise-shouldnt-come-with-preventable-risks")).toBe(true);
    expect(isTrackedPath("/")).toBe(true);
    expect(isTrackedPath("/private/portfolio-001")).toBe(false);
    expect(isTrackedPath("/private/portfolio-001/enter")).toBe(false);
    expect(isTrackedPath("/editions/x/print")).toBe(false);
  });

  it("derives article identifiers without personal data", async () => {
    const { articleIdsFrom } = await import("./analytics");
    expect(articleIdsFrom("https://adenchase.com/insights/paradise-shouldnt-come-with-preventable-risks?utm_source=x", "/editions/001/ADEN-CHASE-The-Opportunity-Perspective-Issue-001.pdf")).toEqual({
      article_slug: "paradise-shouldnt-come-with-preventable-risks",
      article_issue: "001",
    });
  });
});
