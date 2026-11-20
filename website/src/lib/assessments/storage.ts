/**
 * Where submissions are stored: a private Google Sheet owned by ADEN-CHASE, written by a small
 * Google Apps Script web app (docs/assessments/google-sheets-apps-script.gs). Only this server calls
 * it, with a shared secret; the browser never sees the URL or the secret.
 *
 * Configuration (Vercel → Project → Settings → Environment Variables, server-only):
 *   ASSESSMENT_SHEETS_WEBHOOK_URL  the Apps Script web app URL (…/exec)
 *   ASSESSMENT_SHEETS_SECRET       a long random string, the same value as SECRET in the script
 */
export interface StoredSubmission {
  assessmentId: string;
  /** Generated once per draft, so a retried or double-clicked submission is stored only once. */
  submissionId: string;
  submittedAt: string;
  questions: string[];
  answers: string[];
}

export type StoreResult = { ok: true; duplicate: boolean } | { ok: false; reason: "not-configured" | "failed" };

export const storageConfigured = () => !!(process.env.ASSESSMENT_SHEETS_WEBHOOK_URL && process.env.ASSESSMENT_SHEETS_SECRET);

export async function storeSubmission(s: StoredSubmission): Promise<StoreResult> {
  const url = process.env.ASSESSMENT_SHEETS_WEBHOOK_URL;
  const secret = process.env.ASSESSMENT_SHEETS_SECRET;
  if (!url || !secret) return { ok: false, reason: "not-configured" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, ...s }),
      redirect: "follow", // Apps Script answers via a redirect to googleusercontent.com
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; duplicate?: boolean } | null;
    // Success only when the sheet itself confirms the row was written (or already present).
    if (res.ok && body?.ok === true) return { ok: true, duplicate: !!body.duplicate };
    console.error(`[assessment] store failed for ${s.assessmentId}: HTTP ${res.status}`);
    return { ok: false, reason: "failed" };
  } catch (e) {
    console.error(`[assessment] store error for ${s.assessmentId}: ${(e as Error).name}`);
    return { ok: false, reason: "failed" };
  }
}
