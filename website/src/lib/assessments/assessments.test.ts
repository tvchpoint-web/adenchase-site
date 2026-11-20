import { afterEach, describe, expect, it, vi } from "vitest";
import { ASSESSMENTS, assessmentById } from "@/lib/assessments";
import { portfolio001 } from "@/lib/assessments/portfolio-001";
import { codeMatches, issueSession, sessionValid } from "@/lib/assessments/access";
import { storeSubmission } from "@/lib/assessments/storage";

const CODE = "harbour-mango-river-lantern";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Pat's assessment definition", () => {
  it("has the approved identity and 12 numbered questions", () => {
    expect(portfolio001.id).toBe("portfolio-001");
    expect(portfolio001.title).toBe("Pat's Property & Legacy Assessment");
    expect(portfolio001.questions).toHaveLength(12);
    expect(portfolio001.questions.map((q) => q.title)).toEqual([
      "Portfolio Overview", "Property Types", "Current Utilization", "Ownership", "Existing Income", "Known Obligations",
      "Property Condition", "Proposed Commercial Development", "Your Father's Vision", "Family Participation", "Legacy Planning", "Your Priorities",
    ]);
    expect(portfolio001.completion.heading).toBe("Thank you, Pat.");
  });

  it("resolves only registered ids (no prototype keys)", () => {
    expect(assessmentById("portfolio-001")).toBe(portfolio001);
    for (const id of ["constructor", "__proto__", "toString", "portfolio-002", ""]) expect(assessmentById(id)).toBeUndefined();
    for (const a of Object.values(ASSESSMENTS)) expect(a.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
});

describe("access control", () => {
  it("is closed until a long enough code is configured", () => {
    vi.stubEnv("ASSESSMENT_PORTFOLIO_001_CODE", "");
    expect(codeMatches(portfolio001, "")).toBe(false);
    expect(issueSession(portfolio001)).toBeNull();
    vi.stubEnv("ASSESSMENT_PORTFOLIO_001_CODE", "short-code");
    expect(codeMatches(portfolio001, "short-code")).toBe(false);
  });

  it("accepts only the configured code", () => {
    vi.stubEnv("ASSESSMENT_PORTFOLIO_001_CODE", CODE);
    expect(codeMatches(portfolio001, CODE)).toBe(true);
    expect(codeMatches(portfolio001, ` ${CODE} `)).toBe(true);
    expect(codeMatches(portfolio001, CODE.toUpperCase())).toBe(false);
    expect(codeMatches(portfolio001, "")).toBe(false);
  });

  it("issues sessions that expire, cannot be forged and end when the code changes", () => {
    vi.stubEnv("ASSESSMENT_PORTFOLIO_001_CODE", CODE);
    const s = issueSession(portfolio001, 1_000)!;
    expect(sessionValid(portfolio001, s.value, 2_000)).toBe(true);
    expect(sessionValid(portfolio001, s.value, 1_000 + 31 * 86_400_000)).toBe(false); // expired
    const [exp, sig] = s.value.split(".");
    expect(sessionValid(portfolio001, `${Number(exp) + 1}.${sig}`, 2_000)).toBe(false); // extended expiry
    expect(sessionValid(portfolio001, `${exp}.x${sig.slice(1)}`, 2_000)).toBe(false); // tampered
    expect(sessionValid(portfolio001, undefined, 2_000)).toBe(false);
    vi.stubEnv("ASSESSMENT_PORTFOLIO_001_CODE", "a-completely-new-code");
    expect(sessionValid(portfolio001, s.value, 2_000)).toBe(false); // revoked
  });
});

describe("storage", () => {
  const sub = { assessmentId: "portfolio-001", submissionId: "00000000-0000-4000-8000-000000000000", submittedAt: "2026-11-20T00:00:00Z", questions: ["1. Q"], answers: ["A"] };

  it("reports not configured without a webhook", async () => {
    vi.stubEnv("ASSESSMENT_SHEETS_WEBHOOK_URL", "");
    expect(await storeSubmission(sub)).toEqual({ ok: false, reason: "not-configured" });
  });

  it("succeeds only when the sheet confirms, and sends the secret server-side", async () => {
    vi.stubEnv("ASSESSMENT_SHEETS_WEBHOOK_URL", "https://script.example/exec");
    vi.stubEnv("ASSESSMENT_SHEETS_SECRET", "s3cret");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, duplicate: false })));
    vi.stubGlobal("fetch", fetchMock);
    expect(await storeSubmission(sub)).toEqual({ ok: true, duplicate: false });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ secret: "s3cret", submissionId: sub.submissionId, answers: ["A"] });

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "unauthorized" }))));
    expect(await storeSubmission(sub)).toEqual({ ok: false, reason: "failed" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>error</html>", { status: 500 })));
    expect(await storeSubmission(sub)).toEqual({ ok: false, reason: "failed" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    expect(await storeSubmission(sub)).toEqual({ ok: false, reason: "failed" });
  });
});

describe("privacy", () => {
  it("keeps private pages out of the sitemap", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    expect(sitemap().some((e) => e.url.includes("/private"))).toBe(false);
  });
});
