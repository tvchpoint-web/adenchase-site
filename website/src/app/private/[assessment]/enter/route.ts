import { NextResponse, type NextRequest } from "next/server";
import { assessmentById } from "@/lib/assessments";
import { codeMatches, cookieName, cookieOptions, issueSession } from "@/lib/assessments/access";

/**
 * Invitation link: /private/<id>/enter?code=<access code>. A valid code sets the session cookie;
 * either way the browser is sent on to the clean address (with the access screen if the code was
 * wrong). The hand-off is a tiny page with a relative refresh rather than an HTTP redirect, so the
 * browser stays on the exact host it used and the cookie always applies, and the code does not
 * remain in the address bar.
 */
export async function GET(req: NextRequest, { params }: RouteContext<"/private/[assessment]/enter">) {
  const a = assessmentById((await params).assessment);
  if (!a) return new NextResponse("Not found", { status: 404 });
  const target = `/private/${a.id}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta http-equiv="refresh" content="0;url=${target}"><title>Opening your assessment…</title></head><body style="background:#00103d;color:#f4f8ff;font-family:system-ui,sans-serif;padding:2rem"><p>Opening your assessment… <a href="${target}" style="color:#83fd80">Continue</a></p><script>location.replace(${JSON.stringify(target)})</script></body></html>`;
  const res = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" },
  });
  const session = codeMatches(a, req.nextUrl.searchParams.get("code") ?? "") ? issueSession(a) : null;
  if (session) res.cookies.set(cookieName(a), session.value, cookieOptions(a, session.maxAge));
  return res;
}
