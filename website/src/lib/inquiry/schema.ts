import { z } from "zod";
import { INTERESTS } from "@/lib/site";

const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, min <= 1 ? `Please enter your ${label}.` : `Please add a little more detail (at least ${min} characters).`)
    .max(max, `Please keep this under ${max} characters.`);

/** Accepts "example.com" or a full URL; stores a normalised https URL. Empty is allowed. */
const website = z
  .string()
  .trim()
  .max(300, "That address looks too long.")
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return /\./.test(u.hostname);
    } catch {
      return false;
    }
  }, "Please enter a valid website address, or leave it blank.");

export const inquirySchema = z.object({
  name: text(1, 120, "name"),
  organization: text(1, 160, "organization"),
  email: z.string().trim().max(254).email("Please enter a valid email address."),
  website,
  interest: z.enum(INTERESTS, { message: "Please choose a primary strategic interest." }),
  message: text(20, 4000, "description"),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryField = keyof Inquiry;

export type InquiryState =
  | { status: "idle" }
  | { status: "invalid"; errors: Partial<Record<InquiryField, string>>; values: Record<string, string> }
  | { status: "not-configured"; values: Record<string, string> }
  | { status: "rate-limited"; values: Record<string, string> }
  | { status: "error"; values: Record<string, string> }
  | { status: "sent" };

export const FIELDS: InquiryField[] = ["name", "organization", "email", "website", "interest", "message"];

export function parseInquiry(raw: Record<string, string>) {
  const result = inquirySchema.safeParse(raw);
  if (result.success) return { ok: true as const, data: result.data };
  const errors: Partial<Record<InquiryField, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as InquiryField;
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false as const, errors };
}
