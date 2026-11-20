import { createHmac, timingSafeEqual } from "node:crypto";
import type { AssessmentDefinition } from "./types";

/**
 * Access control for a private assessment. The access code lives only in a server environment
 * variable (named by the definition). Entering it, or opening an invitation link that carries it,
 * issues an HttpOnly cookie signed with the code itself, so changing the code revokes every session.
 */
export const SESSION_DAYS = 30;
const MIN_CODE_LENGTH = 12;

export const cookieName = (a: AssessmentDefinition) => `ac_assessment_${a.id.replace(/[^a-z0-9]/g, "_")}`;
export const cookiePath = (a: AssessmentDefinition) => `/private/${a.id}`;

/** The configured code, or null when it is missing or too short to be safe (access is then closed). */
function accessCode(a: AssessmentDefinition): string | null {
  const code = process.env[a.accessCodeEnv]?.trim();
  return code && code.length >= MIN_CODE_LENGTH ? code : null;
}

export const accessConfigured = (a: AssessmentDefinition) => accessCode(a) !== null;

const sign = (code: string, payload: string) => createHmac("sha256", code).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Constant-time check of a submitted code (compares HMACs so length differences don't leak). */
export function codeMatches(a: AssessmentDefinition, submitted: string): boolean {
  const code = accessCode(a);
  if (!code) return false;
  return safeEqual(sign(code, `code:${submitted.trim()}`), sign(code, `code:${code}`));
}

/** A session token: "<expiry ms>.<signature>". */
export function issueSession(a: AssessmentDefinition, now = Date.now()): { value: string; maxAge: number } | null {
  const code = accessCode(a);
  if (!code) return null;
  const exp = now + SESSION_DAYS * 86_400_000;
  return { value: `${exp}.${sign(code, `session:${a.id}:${exp}`)}`, maxAge: SESSION_DAYS * 86_400 };
}

export function sessionValid(a: AssessmentDefinition, value: string | undefined, now = Date.now()): boolean {
  const code = accessCode(a);
  if (!code || !value) return false;
  const [expRaw, sig] = value.split(".");
  const exp = Number(expRaw);
  if (!sig || !Number.isFinite(exp) || exp < now) return false;
  return safeEqual(sig, sign(code, `session:${a.id}:${exp}`));
}

export const cookieOptions = (a: AssessmentDefinition, maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: cookiePath(a),
  maxAge,
});
