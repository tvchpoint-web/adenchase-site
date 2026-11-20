"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { unlock, type UnlockState } from "./actions";

/** The access screen: an access code checked on the server (no secret ever reaches the browser). */
export function AccessGate({ assessmentId, open }: { assessmentId: string; open: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, {});
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <section aria-labelledby="gate-title" className="assessment-step">
      <p className="type-label text-jade">Private assessment</p>
      <h1 id="gate-title" className="type-title mt-4 text-ink">
        This assessment is private.
      </h1>
      {open ? (
        <>
          <p className="mt-5 max-w-[34rem] leading-relaxed text-mist">Please open the invitation link you received, or enter the access code from your invitation.</p>
          <form action={action} className="mt-10 max-w-[26rem]">
            <input type="hidden" name="assessment" value={assessmentId} />
            <label htmlFor="code" className="block text-sm font-medium text-ink">
              Access code
            </label>
            <input
              id="code"
              name="code"
              type="password"
              required
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!state.error}
              aria-describedby={state.error ? "code-error" : undefined}
              className="assessment-field mt-2 w-full px-4 py-3"
            />
            {state.error ? (
              <p id="code-error" role="alert" className="assessment-error mt-3">
                {state.error}
              </p>
            ) : null}
            <button type="submit" disabled={pending || state.ok} className="btn btn-primary mt-6 disabled:cursor-wait disabled:opacity-60">
              {pending || state.ok ? "Opening…" : "Continue"}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-5 max-w-[34rem] leading-relaxed text-mist">This assessment is not open yet. Please check back with your ADEN-CHASE contact.</p>
      )}
    </section>
  );
}
