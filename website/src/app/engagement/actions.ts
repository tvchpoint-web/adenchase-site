"use server";

import { headers } from "next/headers";
import { FIELDS, parseInquiry, type InquiryState } from "@/lib/inquiry/schema";

/**
 * Private Engagement inquiry.
 *
 * Delivery is only attempted when RESEND_API_KEY and INQUIRY_TO are configured
 * for THIS project. Until then the visitor is told plainly that nothing was
 * sent — the form never claims a delivery that did not happen.
 */

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
// Best-effort, per-instance throttle. Adequate for a low-volume inquiry form; not a security boundary.
const recent = new Map<string, number[]>();

function throttled(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > LIMIT;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const values: Record<string, string> = {};
  for (const f of FIELDS) values[f] = String(formData.get(f) ?? "");

  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("fax_number") ?? "").length > 0) return { status: "sent" };

  const parsed = parseInquiry(values);
  if (!parsed.ok) return { status: "invalid", errors: parsed.errors, values };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (throttled(ip)) return { status: "rate-limited", values };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  const from = process.env.INQUIRY_FROM ?? "ADEN-CHASE Strategies <no-reply@adenchase.com>";
  if (!apiKey || !to) return { status: "not-configured", values };

  const d = parsed.data;
  const text = [
    "New strategic introduction request",
    "",
    `Name:          ${d.name}`,
    `Organization:  ${d.organization}`,
    `Email:         ${d.email}`,
    `Website:       ${d.website || "—"}`,
    `Interest:      ${d.interest}`,
    "",
    "Opportunity:",
    d.message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        reply_to: d.email,
        subject: `Strategic introduction — ${d.name}, ${d.organization}`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[inquiry] delivery failed", res.status);
      return { status: "error", values };
    }
    return { status: "sent" };
  } catch (err) {
    console.error("[inquiry] delivery error", err);
    return { status: "error", values };
  }
}
