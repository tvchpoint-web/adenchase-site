import { describe, expect, it } from "vitest";
import { parseInquiry } from "./schema";

const valid = {
  name: "Alex Morgan",
  organization: "Northwind Co.",
  email: "alex@northwind.example",
  website: "northwind.example",
  interest: "AI Engineering",
  message: "We want to understand where automation could free up our operations team.",
};

describe("inquiry validation", () => {
  it("accepts a complete inquiry and normalises the website", () => {
    const r = parseInquiry(valid);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.website).toBe("https://northwind.example");
  });

  it("allows the website to be blank", () => {
    expect(parseInquiry({ ...valid, website: "" }).ok).toBe(true);
  });

  it("reports one clear message per invalid field", () => {
    const r = parseInquiry({ ...valid, email: "not-an-email", message: "short", interest: "Pricing" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["email", "interest", "message"]);
    }
  });

  it("rejects a website that is not an address", () => {
    expect(parseInquiry({ ...valid, website: "not a site" }).ok).toBe(false);
  });
});
