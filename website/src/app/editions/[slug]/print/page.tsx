import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/insights/ArticleBody";
import { INSIGHTS, articleBySlug, authorOf, editionFingerprint, formatDate, issueLabel, view } from "@/lib/insights";
import { BARE_PAGE_CSS, qrSvg, templateSlugs } from "@/lib/editorial/templates";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => templateSlugs().map((slug) => ({ slug }));
export async function generateMetadata({ params }: PageProps<"/editions/[slug]/print">): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  // The PDF's document title (Chromium uses the page title).
  return { title: { absolute: a ? `${a.title} — ${INSIGHTS.title}, ${issueLabel(a.issue)} | ${SITE.name}` : SITE.name }, robots: { index: false, follow: false } };
}

/** The edition as a US Letter publication (printed to PDF by `npm run editions`). */
export default async function PrintEdition({ params }: PageProps<"/editions/[slug]/print">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const v = view(a);
  const au = authorOf(a);
  const qr = await qrSvg(v.url);
  const display = v.url.replace("https://", "");
  return (
    <div className="pdf" data-fingerprint={editionFingerprint(a)}>
      <style>{BARE_PAGE_CSS + PRINT_CSS}</style>
      <header className="pdf-band">
        {/* eslint-disable-next-line @next/next/no-img-element -- the official logo (master artwork) */}
        <img src="/brand/aden-chase-logo.png" alt="ADEN-CHASE Strategies" className="pdf-logo" />
        <div className="pdf-masthead">
          <p className="pdf-pub">The Opportunity Perspective</p>
          <p className="pdf-tag">{INSIGHTS.tagline}</p>
        </div>
      </header>
      <p className="pdf-meta">
        <span className="pdf-issue">
          {issueLabel(a.issue)}
          {a.edition ? ` · ${a.edition}` : ""}
        </span>
        <span>{a.category}</span>
        <span>{formatDate(a.date)}</span>
        <span>{v.minutes} min read</span>
      </p>
      <h1 className="pdf-title">{a.title}</h1>
      <p className="pdf-subtitle">{a.subtitle}</p>
      <p className="pdf-byline">
        By {au.name} | {au.organization}
      </p>
      {a.image.approved && a.image.src ? (
        <figure className="pdf-figure">
          {/* eslint-disable-next-line @next/next/no-img-element -- licensed editorial photograph */}
          <img src={a.image.src} alt={a.image.alt} />
          {a.image.credit ? <figcaption>{a.image.credit}</figcaption> : null}
        </figure>
      ) : (
        <figure className="pdf-figure pdf-placeholder" aria-label="Placeholder for the featured photograph">
          <p className="pdf-ph-label">Featured photograph · {a.image.subject}</p>
          <p className="pdf-ph-note">Temporary placeholder: a licensed photograph will replace this panel before publication.</p>
        </figure>
      )}
      <ArticleBody blocks={v.blocks} className="pdf-body" />
      <section className="pdf-end">
        <div className="pdf-sign">
          <p className="pdf-sign-name">{au.name}</p>
          <p>{au.title}</p>
          <p>{au.organization}</p>
          {au.email ? <p>{au.emailVerified ? <a href={`mailto:${au.email}`}>{au.email}</a> : au.email}</p> : null}
          <p>
            <a href="https://adenchase.com">adenchase.com</a>
          </p>
          <p className="pdf-sign-tag">{SITE.statement}</p>
        </div>
        <div className="pdf-qr">
          <div className="pdf-qr-code" dangerouslySetInnerHTML={{ __html: qr }} />
          <p>
            Read online
            <br />
            <a href={v.url}>{display}</a>
          </p>
        </div>
      </section>
    </div>
  );
}

const PRINT_CSS = `
@page { size: Letter; margin: 0.85in 0.95in 0.85in 0.95in; }
html { color-scheme: light !important; background: #fff !important; }
body { background: #fff !important; }
.pdf { color: #0b1633; font-family: var(--font-inter-tight), system-ui, sans-serif; font-size: 10.6pt; line-height: 1.6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pdf a { color: #0042AC; text-decoration: underline; text-decoration-thickness: 0.6pt; text-underline-offset: 2pt; }
.pdf-band { display: flex; align-items: center; justify-content: space-between; gap: 18pt; background: #00103D; padding: 16pt 18pt; }
.pdf-logo { width: 2.05in; height: auto; display: block; }
.pdf-masthead { text-align: right; color: #fff; }
.pdf-pub { font-size: 15pt; font-weight: 650; letter-spacing: -0.01em; line-height: 1.1; }
.pdf-tag { margin-top: 4pt; font-size: 7.4pt; letter-spacing: 0.08em; text-transform: uppercase; color: #83FD80; }
.pdf-meta { margin-top: 20pt; display: flex; flex-wrap: wrap; gap: 4pt 14pt; font-size: 7.4pt; letter-spacing: 0.06em; text-transform: uppercase; color: #4a587a; border-bottom: 0.6pt solid #c9d1e3; padding-bottom: 8pt; }
.pdf-issue { color: #0042AC; font-weight: 650; }
.pdf-title { margin-top: 16pt; font-size: 27pt; line-height: 1.06; font-weight: 650; letter-spacing: -0.025em; color: #00103D; }
.pdf-subtitle { margin-top: 10pt; font-size: 12.6pt; line-height: 1.45; color: #34436a; max-width: 5.6in; }
.pdf-byline { margin-top: 10pt; font-size: 9pt; color: #4a587a; }
.pdf-figure { margin-top: 16pt; break-inside: avoid; }
.pdf-figure img { width: 100%; height: 2.9in; object-fit: cover; display: block; }
.pdf-figure figcaption { margin-top: 4pt; font-size: 7pt; color: #6b7794; }
.pdf-placeholder { height: 2.1in; border: 0.8pt dashed #7f8fb3; background: repeating-linear-gradient(135deg, #f1f4fa 0 1pt, #fff 1pt 9pt); display: flex; flex-direction: column; justify-content: flex-end; padding: 12pt 14pt; }
.pdf-ph-label { font-size: 7.6pt; letter-spacing: 0.06em; text-transform: uppercase; color: #0042AC; font-weight: 650; }
.pdf-ph-note { margin-top: 3pt; font-size: 8.6pt; color: #4a587a; }
.pdf-body { margin: 20pt auto 0; max-width: 5.55in; color: #0b1633; font-size: 10.6pt; line-height: 1.62; }
.pdf-body a { color: #0042AC; }
.pdf-body p, .pdf-body li { orphans: 3; widows: 3; }
.pdf-body > * + * { margin-top: 9pt; }
.pdf-body h2 { margin-top: 20pt; font-size: 13.4pt; line-height: 1.25; font-weight: 650; color: #00103D; letter-spacing: -0.01em; break-after: avoid; page-break-after: avoid; padding-top: 7pt; border-top: 0.6pt solid #c9d1e3; }
.pdf-body h2 + p { break-before: avoid; }
.pdf-body ul { padding-left: 14pt; list-style: disc; }
.pdf-body li + li { margin-top: 3pt; }
.pdf-body ul li::marker { color: #0042AC; }
/* No drop cap in the PDF: a floated first letter is extracted apart from its word, which breaks search and copy. */
.pdf-body > p:first-child::first-letter { float: none; font-size: inherit; line-height: inherit; font-weight: inherit; margin: 0; color: inherit; }
.pdf-end { margin: 24pt auto 0; max-width: 5.55in; display: flex; justify-content: space-between; gap: 20pt; border-top: 1.4pt solid #00103D; padding-top: 12pt; break-inside: avoid; }
.pdf-sign { font-size: 9pt; color: #34436a; line-height: 1.5; }
.pdf-sign-name { font-size: 12pt; font-weight: 650; color: #00103D; }
.pdf-sign-tag { margin-top: 10pt; font-size: 9pt; color: #0042AC; font-weight: 650; }
.pdf-qr { width: 1.35in; text-align: center; font-size: 7.4pt; color: #4a587a; line-height: 1.4; }
.pdf-qr-code svg { width: 1.05in; height: 1.05in; display: block; margin: 0 auto 4pt; }
.pdf-qr a { word-break: break-all; }
`;
