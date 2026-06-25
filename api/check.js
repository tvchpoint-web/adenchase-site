// AdenChase Labs — Free AI-Blind Spot Check intake
// Vercel serverless function (Node 18+). Captures a lead, emails Manny the
// submission, and sends the contractor a warm confirmation. No dependencies.
//
// Required env var (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   your AdenChase Resend key (adenchaselabs.com is verified)
// Optional (sensible defaults below):
//   NOTIFY_TO        where leads land so you can act on them   (default: support@adenchaselabs.com)
//   FROM_EMAIL       verified sender                            (default: AdenChase Labs <support@adenchaselabs.com>)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_TO = process.env.NOTIFY_TO || 'support@adenchaselabs.com';
  const FROM_EMAIL = process.env.FROM_EMAIL || 'AdenChase Labs <support@adenchaselabs.com>';

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email is not configured yet.' });
  }

  // Vercel parses JSON bodies automatically; guard for string bodies too.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const name = clean(body.name);
  const website = clean(body.website);
  const trade = clean(body.trade);
  const area = clean(body.area);
  const email = clean(body.email);

  if (!name || !website || !trade || !area || !email) {
    return res.status(400).json({ error: 'Missing one or more required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'That email address does not look right.' });
  }

  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  // 1) Notify Manny — the lead to act on
  const notify = {
    from: FROM_EMAIL,
    to: [NOTIFY_TO],
    reply_to: email,
    subject: `Free check — ${name} (${trade}, ${area})`,
    text:
`New free AI-Blind Spot Check request.

Name:     ${name}
Website:  ${website}
Trade:    ${trade}
Area:     ${area}
Email:    ${email}

Submitted: ${submittedAt} (ET)

— Run the check, then reply with the score + your read (score & verdict only; hold the Top 3 Fixes for the paid Audit).`
  };

  // 2) Confirm the contractor — sets the "within a day" expectation
  const confirm = {
    from: FROM_EMAIL,
    to: [email],
    reply_to: 'support@adenchaselabs.com',
    subject: 'Your free AI Visibility check is on its way',
    text:
`Hi ${name.split(' ')[0] || name},

Got your request — thanks for trusting me with it.

I'll personally run your free AI Visibility check: I'll ask ChatGPT, Gemini, and Perplexity the questions your customers ask before they hire a ${trade.toLowerCase()} in ${area}, and I'll score where you actually stand. You'll have your number, and my honest read on whether you're sitting in the blind spot, within a day.

No cost, no catch. If you've got anything you want me to look at specifically, just reply to this email.

Talk soon,
Manny A.
AdenChase Labs
AI Visibility, not rankings.`
  };

  try {
    const r = await sendEmail(RESEND_API_KEY, notify);
    if (!r.ok) {
      const detail = await safeText(r);
      console.error('[check] notify send failed', r.status, detail);
      return res.status(502).json({ error: 'Could not send the request.' });
    }
    // Confirmation is best-effort — never fail the user's submit over it.
    try {
      const c = await sendEmail(RESEND_API_KEY, confirm);
      if (!c.ok) console.error('[check] confirm send failed', c.status, await safeText(c));
    } catch (e) {
      console.error('[check] confirm threw', e);
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[check] handler threw', e);
    return res.status(500).json({ error: 'Unexpected error.' });
  }
}

function clean(v) {
  return (typeof v === 'string' ? v : '').trim().slice(0, 300);
}

async function sendEmail(key, payload) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

async function safeText(r) {
  try { return await r.text(); } catch { return '(no body)'; }
}
