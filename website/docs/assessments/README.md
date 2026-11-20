# Private assessments: setup and access

One live assessment: **Pat's Property & Legacy Assessment** at `https://adenchase.com/private/portfolio-001`.

| Piece | Where |
| --- | --- |
| Questions, title, introduction, completion message | `src/lib/assessments/portfolio-001.ts` (a new assessment = a new file + one line in `index.ts`) |
| Page | `src/app/private/[assessment]/` |
| Access control (server-checked code, signed HttpOnly cookie, 30 days) | `src/lib/assessments/access.ts` |
| Storage (private Google Sheet via Apps Script) | `src/lib/assessments/storage.ts`, `docs/assessments/google-sheets-apps-script.gs` |
| Not indexed: `noindex, nofollow` (meta + header), `no-store`, `no-referrer`, not in sitemap, `llms.txt` or navigation | page metadata, `next.config.ts` |

## One-time setup (about 10 minutes, free)

You do these steps in your own accounts; no secret is ever put in the code or sent in chat.

1. **Create the response sheet.** In the ADEN-CHASE Google account, create a Google Sheet named
   *ADEN-CHASE Private Assessments*. Leave sharing as *Restricted* (only you).
2. **Add the receiver.** In the sheet: *Extensions → Apps Script*. Delete the sample code and paste
   the whole of `google-sheets-apps-script.gs`. Save.
3. **Set the secret.** In Apps Script: *Project Settings (gear) → Script properties → Add script
   property*: name `SECRET`, value a long random string (40+ characters, e.g. from a password
   manager). Save it in the password manager too: Vercel needs the same value.
4. **Deploy.** *Deploy → New deployment → type: Web app*. *Execute as: Me*; *Who has access:
   Anyone* (the website's server calls it without a Google sign-in; the secret is what protects
   it). *Deploy*, approve the permissions, and copy the **Web app URL** (ends in `/exec`).
5. **Configure Vercel.** Vercel → project *adenchase-site* → *Settings → Environment Variables*.
   Add each for **Production** and **Preview**, marked **Sensitive**:
   - `ASSESSMENT_SHEETS_WEBHOOK_URL` = the Web app URL
   - `ASSESSMENT_SHEETS_SECRET` = the secret from step 3
   - `ASSESSMENT_PORTFOLIO_001_CODE` = Pat's access code: at least 12 characters, e.g. four random
     words joined by hyphens. Shorter codes are refused and the page stays closed.
6. **Redeploy** (environment variables apply to new deployments).
7. **Test it.** Open the invitation link (below), answer one question, submit, and check that a
   `portfolio-001` tab appears in the sheet with the row. Delete the test row.

## Sending Pat the link

- One-tap invitation: `https://adenchase.com/private/portfolio-001/enter?code=<ACCESS CODE>`
  (the code is swapped for a secure cookie and removed from the address bar).
- More private: send `https://adenchase.com/private/portfolio-001` and give the access code
  separately (for example by phone or a separate message).

Access lasts 30 days on that device. To revoke all access, change `ASSESSMENT_PORTFOLIO_001_CODE`
and redeploy.

## Reading Pat's responses

Open the *ADEN-CHASE Private Assessments* sheet → tab **portfolio-001**. One row per submission:
time received (UTC), assessment ID, submission ID, then the 12 answers. Only Google accounts you
share the sheet with can see it; keep it restricted.

## Notes

- Drafts are saved only in Pat's browser on that device until submitted, and cleared after a
  successful submission. They do not sync between devices (the page says so).
- Success is shown only after the sheet confirms the row was written. A failure keeps the draft
  and shows a clear message; a retried submission is stored once (submission ID).
- No analytics, tracking or third-party scripts run on the page. No email is sent.
