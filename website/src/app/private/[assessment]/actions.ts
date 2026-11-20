"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { MAX_ANSWER_LENGTH, assessmentById } from "@/lib/assessments";
import { codeMatches, cookieName, cookieOptions, issueSession, sessionValid } from "@/lib/assessments/access";
import { storeSubmission } from "@/lib/assessments/storage";

/* ------------------------------------------------------------------ access */

export type UnlockState = { error?: string; ok?: boolean };

// Best-effort brake on repeated wrong codes (per server instance). Codes are long and random, so
// guessing is impractical anyway; this just makes scripted attempts slow and noisy.
const attempts = new Map<string, { n: number; until: number }>();
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function unlock(_prev: UnlockState, form: FormData): Promise<UnlockState> {
  const a = assessmentById(String(form.get("assessment") ?? ""));
  if (!a) return { error: "This assessment is not available." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${a.id}:${ip}`;
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && rec.until > now) return { error: "Too many attempts. Please wait a few minutes and try again." };

  const code = String(form.get("code") ?? "").slice(0, 200);
  if (!codeMatches(a, code)) {
    const n = (rec?.n ?? 0) + 1;
    attempts.set(key, { n, until: n >= 5 ? now + 10 * 60_000 : 0 });
    await pause(600);
    return { error: "That access code was not recognised. Please check it and try again." };
  }
  attempts.delete(key);
  const session = issueSession(a);
  if (!session) return { error: "This assessment is not available." };
  (await cookies()).set(cookieName(a), session.value, cookieOptions(a, session.maxAge));
  return { ok: true };
}

/* -------------------------------------------------------------- submission */

const Submission = z.object({
  assessmentId: z.string().max(64),
  submissionId: z.uuid(),
  answers: z.array(z.string().max(MAX_ANSWER_LENGTH)),
  /** Honeypot: hidden from people, so it must be empty. */
  website: z.string().max(0),
});

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitAssessment(input: unknown): Promise<SubmitResult> {
  const parsed = Submission.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Your answers could not be checked. Please review them and try again." };
  const { assessmentId, submissionId, answers } = parsed.data;
  const a = assessmentById(assessmentId);
  if (!a) return { ok: false, error: "This assessment is not available." };
  if (!sessionValid(a, (await cookies()).get(cookieName(a))?.value)) {
    return { ok: false, error: "Your access has expired. Please reopen your invitation link (your answers are still saved on this device)." };
  }
  if (answers.length !== a.questions.length) return { ok: false, error: "Your answers could not be checked. Please review them and try again." };
  const clean = answers.map((s) => s.replace(/\r\n?/g, "\n").trim());
  if (!clean.some(Boolean)) return { ok: false, error: "Please answer at least one question before submitting." };

  const stored = await storeSubmission({
    assessmentId: a.id,
    submissionId,
    submittedAt: new Date().toISOString(),
    questions: a.questions.map((q, i) => `${i + 1}. ${q.title}`),
    answers: clean,
  });
  if (stored.ok) return { ok: true };
  return {
    ok: false,
    error:
      stored.reason === "not-configured"
        ? "Submissions are not open yet. Your answers are saved on this device; please try again later."
        : "We couldn't save your answers just now. Nothing has been lost: they are still saved on this device. Please try again in a moment.",
  };
}
