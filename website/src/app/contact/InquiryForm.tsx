"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInquiry } from "./actions";
import type { InquiryField, InquiryState } from "@/lib/inquiry/schema";
import { INTERESTS } from "@/lib/site";

const initial: InquiryState = { status: "idle" };

const fieldClass =
  "mt-2 block w-full rounded-xl border border-line bg-navy-deep/70 px-4 py-3.5 text-[1rem] text-ink placeholder:text-haze/70 transition-colors duration-200 hover:border-ocean/50 focus:border-ocean focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade aria-invalid:border-[#ff9b9b]";

export function InquiryForm() {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  // Arriving from a discipline page (?interest=…) preselects that interest, if it is a valid option.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("interest");
    const select = document.getElementById("interest") as HTMLSelectElement | null;
    if (wanted && select && !select.value && (INTERESTS as readonly string[]).includes(wanted)) select.value = wanted;
  }, []);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = state.status === "invalid" ? state.errors : {};
  const values = "values" in state ? state.values : {};
  const err = (f: InquiryField) => errors[f];

  useEffect(() => {
    if (state.status === "invalid") {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
    } else if (state.status !== "idle") {
      statusRef.current?.focus();
    }
  }, [state]);

  if (state.status === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-3xl border border-jade/40 bg-navy-deep/70 p-8 outline-none">
        <p className="type-label text-jade">Received</p>
        <p className="type-title mt-4 text-ink">Thank you.</p>
        <p className="mt-4 leading-relaxed text-mist">
          Your request for a strategic introduction has been delivered. We review every inquiry personally and will reply to the email address you provided.
        </p>
      </div>
    );
  }

  // Re-key the form so defaultValues reflect the latest submission after a server round-trip.
  const formKey = "values" in state ? JSON.stringify(state.values) : "initial";

  return (
    <form key={formKey} ref={formRef} action={action} noValidate className="space-y-6" aria-describedby="form-status">
      <div ref={statusRef} id="form-status" tabIndex={-1} aria-live="polite" className="outline-none">
        {state.status === "not-configured" && (
          <Notice tone="info" title="Online submission is not connected yet">
            Your details are valid, but this form is not yet linked to an inbox, so <strong className="font-semibold text-ink">nothing has been sent</strong>. Your text is still in the form below.
          </Notice>
        )}
        {state.status === "error" && (
          <Notice tone="error" title="We couldn’t deliver your request">
            Nothing was lost — your text is still below. Please try again in a moment.
          </Notice>
        )}
        {state.status === "rate-limited" && (
          <Notice tone="error" title="Too many attempts">
            Please wait a few minutes before trying again. Your text is still below.
          </Notice>
        )}
        {state.status === "invalid" && (
          <Notice tone="error" title="A few details need attention">
            Please review the highlighted fields.
          </Notice>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name" error={err("name")}>
          <input id="name" name="name" autoComplete="name" required defaultValue={values.name} className={fieldClass} aria-invalid={!!err("name")} aria-describedby={err("name") ? "name-error" : undefined} />
        </Field>
        <Field id="organization" label="Organization" error={err("organization")}>
          <input id="organization" name="organization" autoComplete="organization" required defaultValue={values.organization} className={fieldClass} aria-invalid={!!err("organization")} aria-describedby={err("organization") ? "organization-error" : undefined} />
        </Field>
        <Field id="email" label="Email" error={err("email")}>
          <input id="email" name="email" type="email" autoComplete="email" required defaultValue={values.email} className={fieldClass} aria-invalid={!!err("email")} aria-describedby={err("email") ? "email-error" : undefined} />
        </Field>
        <Field id="website" label="Business website" optional error={err("website")}>
          <input id="website" name="website" type="text" inputMode="url" autoComplete="url" placeholder="yourcompany.com" defaultValue={values.website} className={fieldClass} aria-invalid={!!err("website")} aria-describedby={err("website") ? "website-error" : undefined} />
        </Field>
      </div>

      <Field id="interest" label="Primary strategic interest" error={err("interest")} chevron>
        <select id="interest" name="interest" required defaultValue={values.interest ?? ""} className={`${fieldClass} appearance-none pr-10`} aria-invalid={!!err("interest")} aria-describedby={err("interest") ? "interest-error" : undefined}>
          <option value="" disabled>
            Select one
          </option>
          {INTERESTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </Field>

      <Field id="message" label="Brief description of the opportunity" error={err("message")} hint="A few sentences is enough — what you are working toward and what is in the way.">
        <textarea id="message" name="message" rows={6} required defaultValue={values.message} className={`${fieldClass} resize-y`} aria-invalid={!!err("message")} aria-describedby={`message-hint${err("message") ? " message-error" : ""}`} />
      </Field>

      {/* Honeypot — hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="fax_number">Fax number</label>
        <input id="fax_number" name="fax_number" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-sm leading-relaxed text-haze">Your details are used only to respond to this inquiry.</p>
        <button type="submit" disabled={pending} className="btn btn-primary justify-center disabled:cursor-wait disabled:opacity-70">
          {pending ? "Sending…" : "Start a Conversation"}
          {!pending && (
            <span aria-hidden className="btn-arrow">
              →
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  hint,
  chevron,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  chevron?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-haze">Optional</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-haze">
          {hint}
        </p>
      )}
      {chevron ? (
        <div className="relative">
          {children}
          <svg aria-hidden width="12" height="8" viewBox="0 0 12 8" fill="none" className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-ocean">
            <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </div>
      ) : (
        children
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#ffb3b3]">
          {error}
        </p>
      )}
    </div>
  );
}

function Notice({ tone, title, children }: { tone: "info" | "error"; title: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone === "info" ? "border-ocean/40 bg-sapphire/15" : "border-[#ff9b9b]/40 bg-[#ff9b9b]/[0.06]"}`}>
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-mist">{children}</p>
    </div>
  );
}
