"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import type { AssessmentDefinition } from "@/lib/assessments/types";
import { submitAssessment } from "./actions";

type Definition = Omit<AssessmentDefinition, "accessCodeEnv">;

const MAX = 8000;
const SITE = "https://adenchase.com";

/* ------------------------------------------------------------ local draft */

interface Draft {
  v: 1;
  answers: string[];
  step: number;
  submissionId: string;
  savedAt: string;
}

const draftKey = (id: string) => `adenchase:assessment:${id}`;

function readDraft(id: string, n: number): Draft | null {
  try {
    const d = JSON.parse(localStorage.getItem(draftKey(id)) ?? "null") as Draft | null;
    if (d?.v !== 1 || !Array.isArray(d.answers) || d.answers.length !== n) return null;
    return { ...d, answers: d.answers.map((x) => (typeof x === "string" ? x.slice(0, MAX) : "")) };
  } catch {
    return null;
  }
}

/** Writes the draft; false when this browser does not allow saving (private mode, blocked storage). */
function writeDraft(id: string, d: Draft): boolean {
  try {
    localStorage.setItem(draftKey(id), JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

function clearDraft(id: string) {
  try {
    localStorage.removeItem(draftKey(id));
  } catch {
    /* nothing to clear */
  }
}

const time = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/* ------------------------------------------------------------ component */

/**
 * The questionnaire: an introduction, one question at a time, a review screen and a confirmation.
 * It renders only in the browser (the draft lives in this browser's storage), so the server never
 * renders a state that would then jump when the saved draft loads.
 */
export function Questionnaire({ a }: { a: Definition }) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!hydrated) return <p className="text-mist">Loading your assessment…</p>;
  return <Flow a={a} />;
}

function Flow({ a }: { a: Definition }) {
  const n = a.questions.length;
  const REVIEW = n + 1;
  const DONE = n + 2;

  const [initial] = useState(() => readDraft(a.id, n));
  const [answers, setAnswers] = useState<string[]>(() => initial?.answers ?? Array<string>(n).fill(""));
  const [submissionId, setSubmissionId] = useState(() => initial?.submissionId ?? crypto.randomUUID());
  const [step, setStep] = useState(0); // 0 introduction · 1..n questions · n+1 review · n+2 done
  const [resumeStep] = useState(() => (initial ? Math.min(Math.max(initial.step, 1), REVIEW) : 0));
  const [savedAt, setSavedAt] = useState<string | null>(initial?.savedAt ?? null);
  const [canSave, setCanSave] = useState(true);
  const [fromReview, setFromReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to each new screen's heading so keyboard and screen-reader users start at the top.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  function persist(nextAnswers: string[], nextStep: number) {
    if (nextStep >= DONE) return;
    const now = new Date().toISOString();
    const ok = writeDraft(a.id, { v: 1, answers: nextAnswers, step: nextStep, submissionId, savedAt: now });
    setCanSave(ok);
    if (ok) setSavedAt(now);
  }

  function go(next: number) {
    setError(null);
    setStep(next);
    persist(answers, next);
  }

  function edit(i: number, value: string) {
    const next = answers.slice();
    next[i] = value.slice(0, MAX);
    setAnswers(next);
    persist(next, step);
  }

  function startOver() {
    clearDraft(a.id);
    setAnswers(Array<string>(n).fill(""));
    setSubmissionId(crypto.randomUUID());
    setSavedAt(null);
    setFromReview(false);
    go(1);
  }

  function submit() {
    if (inFlight.current) return; // one request at a time, however often the button is pressed
    inFlight.current = true;
    setError(null);
    startTransition(async () => {
      const res = await submitAssessment({ assessmentId: a.id, submissionId, answers, website: honeypot.current?.value ?? "" }).catch(() => ({
        ok: false as const,
        error: "We couldn't reach ADEN-CHASE just now. Nothing has been lost: your answers are still saved on this device. Please check your connection and try again.",
      }));
      inFlight.current = false;
      if (res.ok) {
        clearDraft(a.id);
        setStep(DONE);
      } else {
        setError(res.error);
      }
    });
  }

  const answered = answers.filter((x) => x.trim()).length;
  const saveNote = !canSave
    ? "This browser is not allowing answers to be saved, so please complete the assessment in one visit."
    : savedAt
      ? `Saved on this device ${time(savedAt)}.`
      : null;

  /* ---------------------------------------------------------- introduction */
  if (step === 0) {
    return (
      <section aria-labelledby="screen-title" className="assessment-step">
        <p className="type-label text-jade">Private assessment</p>
        <h1 id="screen-title" ref={headingRef} tabIndex={-1} className="type-title mt-4 text-ink outline-none">
          {a.title}
        </h1>
        <p className="type-lede mt-5 text-mist">{a.subtitle}</p>
        {a.introduction.map((p) => (
          <p key={p} className="mt-6 leading-relaxed text-mist">
            {p}
          </p>
        ))}

        <ul className="mt-10 grid gap-3 border-y border-line py-6 text-sm text-mist sm:grid-cols-3">
          <li>
            <span className="block font-semibold text-ink">{n} questions</span>All optional. Skip anything you are unsure about.
          </li>
          <li>
            <span className="block font-semibold text-ink">Saved as you go</span>On this device and browser only; not synced to other devices.
          </li>
          <li>
            <span className="block font-semibold text-ink">Review first</span>Nothing is sent until you submit from the review screen.
          </li>
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {resumeStep ? (
            <>
              <button type="button" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" onClick={() => go(resumeStep)}>
                {resumeStep === REVIEW ? "Continue to review" : `Resume at question ${resumeStep}`}
              </button>
              <button type="button" className="btn btn-ghost disabled:opacity-60" onClick={() => go(1)}>
                Go to question 1
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" onClick={() => go(1)}>
              Begin the assessment
            </button>
          )}
        </div>
        {resumeStep && savedAt ? (
          <p className="mt-4 text-sm text-haze">
            Your answers from {time(savedAt)} were restored from this device ({answered} of {n} answered).{" "}
            <button type="button" className="underline underline-offset-4 hover:text-ink" onClick={startOver}>
              Clear them and start again
            </button>
          </p>
        ) : null}

        <PrivacyNotice />
      </section>
    );
  }

  /* -------------------------------------------------------------- done */
  if (step === DONE) {
    return (
      <section aria-labelledby="screen-title" className="assessment-step" aria-live="polite">
        <p className="type-label text-jade">Received</p>
        <h1 id="screen-title" ref={headingRef} tabIndex={-1} className="type-title mt-4 text-ink outline-none">
          {a.completion.heading}
        </h1>
        {a.completion.paragraphs.map((p, i) => (
          <p key={p} className={i === 0 ? "type-lede mt-6 text-ink" : "mt-5 leading-relaxed text-mist"}>
            {p}
          </p>
        ))}
        <a href={SITE} className="btn btn-primary mt-12">
          Return to ADEN-CHASE Strategies
        </a>
      </section>
    );
  }

  /* ------------------------------------------------------------- review */
  if (step === REVIEW) {
    return (
      <section aria-labelledby="screen-title" className="assessment-step">
        <Progress value={n} total={n} label="Review" />
        <h1 id="screen-title" ref={headingRef} tabIndex={-1} className="type-title mt-8 text-ink outline-none">
          Review your answers
        </h1>
        <p className="mt-4 leading-relaxed text-mist">
          You have answered {answered} of {n} questions. Unanswered questions are fine; you can add information later.
        </p>

        <ol className="mt-10 flex flex-col divide-y divide-line border-y border-line">
          {a.questions.map((q, i) => (
            <li key={q.title} className="py-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-semibold text-ink">
                  <span className="text-haze">{i + 1}.</span> {q.title}
                </h2>
                <button
                  type="button"
                  className="shrink-0 text-sm text-jade underline-offset-4 hover:underline focus-visible:underline"
                  onClick={() => {
                    setFromReview(true);
                    go(i + 1);
                  }}
                  aria-label={`Edit answer ${i + 1}: ${q.title}`}
                >
                  Edit
                </button>
              </div>
              {answers[i].trim() ? (
                <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-mist">{answers[i]}</p>
              ) : (
                <p className="mt-2 text-sm italic text-haze">Not answered</p>
              )}
            </li>
          ))}
        </ol>

        {/* Honeypot: invisible to people and assistive technology; automated form fillers complete it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input ref={honeypot} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        {error ? (
          <p role="alert" className="assessment-error mt-8">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" onClick={submit} disabled={pending || answered === 0} aria-busy={pending}>
            {pending ? "Submitting…" : "Submit assessment"}
          </button>
          <button type="button" className="btn btn-ghost disabled:opacity-60" onClick={() => go(n)} disabled={pending}>
            Back
          </button>
        </div>
        {answered === 0 ? <p className="mt-3 text-sm text-haze">Answer at least one question to submit.</p> : null}
        {saveNote ? <p className="mt-6 text-sm text-haze">{saveNote}</p> : null}
        <PrivacyNotice />
      </section>
    );
  }

  /* ------------------------------------------------------------ question */
  const i = step - 1;
  const q = a.questions[i];
  const value = answers[i];
  const last = step === n;
  const nextLabel = fromReview ? "Save and return to review" : last ? "Review answers" : value.trim() ? "Next" : "Skip for now";
  const next = () => {
    if (fromReview) setFromReview(false);
    go(fromReview || last ? REVIEW : step + 1);
  };

  return (
    <section aria-labelledby="screen-title" className="assessment-step" key={step}>
      <Progress value={step} total={n} label={`Question ${step} of ${n}`} />
      <p className="type-label mt-10 text-jade">Question {step}</p>
      <h1 id="screen-title" ref={headingRef} tabIndex={-1} className="type-title mt-3 text-ink outline-none">
        {q.title}
      </h1>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <label htmlFor={`answer-${step}`} className="block text-[1.125rem] leading-relaxed text-ink">
          {q.prompt}
          {q.followUp ? <span className="mt-2 block">{q.followUp}</span> : null}
        </label>
        {q.helper ? (
          <p id={`helper-${step}`} className="mt-2 text-sm leading-relaxed text-haze">
            {q.helper}
          </p>
        ) : null}
        <textarea
          id={`answer-${step}`}
          name={`answer-${step}`}
          value={value}
          onChange={(e) => edit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              next();
            }
          }}
          rows={8}
          maxLength={MAX}
          aria-describedby={[q.helper ? `helper-${step}` : "", "answer-hint"].filter(Boolean).join(" ")}
          className="assessment-field mt-5 block min-h-[11rem] w-full resize-y px-4 py-3 leading-relaxed"
          placeholder="Optional. Type or paste your answer."
        />
        <p id="answer-hint" className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-haze">
          <span>Optional. Addresses and notes can be pasted in.</span>
          {value.length > MAX * 0.9 ? <span>{MAX - value.length} characters left</span> : null}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {nextLabel}
          </button>
          <button type="button" className="btn btn-ghost disabled:opacity-60" onClick={() => go(step - 1)}>
            Back
          </button>
          {!fromReview && !last && answered > 0 ? (
            <button type="button" className="text-sm text-haze underline-offset-4 hover:text-ink hover:underline" onClick={() => go(REVIEW)}>
              Go to review
            </button>
          ) : null}
        </div>
      </form>
      {saveNote ? <p className="mt-8 text-sm text-haze">{saveNote}</p> : null}
    </section>
  );
}

function Progress({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className="text-haze">{Math.round((value / total) * 100)}%</span>
      </div>
      <div
        className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Assessment progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-valuetext={label}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-sapphire via-ocean to-jade transition-[width] duration-500 ease-out" style={{ width: `${(value / total) * 100}%` }} />
      </div>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <details className="mt-12 border-t border-line pt-6 text-sm text-haze">
      <summary className="cursor-pointer text-mist hover:text-ink">Privacy notice</summary>
      <div className="mt-3 flex flex-col gap-3 leading-relaxed">
        <p>
          Your answers are sent securely (HTTPS) to ADEN-CHASE Strategies, the only recipient. They are used to prepare a preliminary opportunity assessment and to follow up with you, and are not
          sold, published or used for advertising. Access to stored responses is restricted to ADEN-CHASE.
        </p>
        <p>
          Until you submit, your answers are saved only in this browser on this device. On a shared device, use &ldquo;Clear them and start again&rdquo; on the first screen when you have finished.
        </p>
        <p>Please do not include identity documents, title deeds, account numbers or other banking details. To have your answers corrected or deleted, ask your ADEN-CHASE contact.</p>
        <p>This page uses no analytics, advertising or third-party tracking.</p>
      </div>
    </details>
  );
}
