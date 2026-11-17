import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INSIGHTS, articleBySlug, authorOf, issueLabel } from "@/lib/insights";
import { BARE_PAGE_CSS, templateSlugs } from "@/lib/editorial/templates";

const FORMATS = { landscape: [1200, 630], portrait: [1080, 1350], story: [1080, 1920] } as const;
type Format = keyof typeof FORMATS;

export const dynamicParams = false;
export const generateStaticParams = () => templateSlugs().flatMap((slug) => (Object.keys(FORMATS) as Format[]).map((format) => ({ slug, format })));
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Promotional graphic for an edition (captured as an image by `npm run editions`): masthead,
 * issue, headline, photograph, author, discreet ADEN-CHASE branding and the web address.
 */
export default async function EditionGraphic({ params }: PageProps<"/editions/[slug]/graphic/[format]">) {
  const { slug, format } = await params;
  const a = articleBySlug(slug);
  if (!a || !(format in FORMATS)) notFound();
  const [w, h] = FORMATS[format as Format];
  const wide = format === "landscape";
  const photo = a.image.approved && a.image.src ? a.image.src : null;
  const titleSize = wide ? 54 : format === "portrait" ? 76 : 88;

  return (
    <div className="g" style={{ width: w, height: h }}>
      <style>{BARE_PAGE_CSS + G_CSS}</style>
      <div className={`g-photo ${photo ? "" : "g-ph"}`} style={wide ? { left: 640, top: 0, width: 560, height: h } : { left: 0, top: 0, width: w, height: format === "portrait" ? 560 : 900 }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- licensed editorial photograph
          <img src={photo} alt="" />
        ) : (
          <p>
            Photograph pending approval
            <br />
            <span>{a.image.subject}</span>
          </p>
        )}
      </div>
      <div className="g-text" style={wide ? { left: 64, top: 56, width: 520, bottom: 52 } : { left: 80, right: 80, top: format === "portrait" ? 620 : 980, bottom: 72 }}>
        <p className="g-pub" style={{ fontSize: wide ? 18 : 27 }}>
          The Opportunity Perspective
        </p>
        <p className="g-issue" style={{ fontSize: wide ? 15 : 22 }}>
          {issueLabel(a.issue)}
          {a.edition ? ` · ${a.edition}` : ""}
        </p>
        <h1 className="g-title" style={{ fontSize: titleSize }}>
          {a.title}
        </h1>
        <p className="g-author" style={{ fontSize: wide ? 20 : 28 }}>
          {authorOf(a).name}
        </p>
        <div className="g-foot">
          {/* eslint-disable-next-line @next/next/no-img-element -- the official logo (colour-to-alpha cut of the master) */}
          <img src="/brand/aden-chase-logo-transparent.png" alt="" style={{ width: wide ? 190 : 250 }} />
          <span style={{ fontSize: wide ? 17 : 24 }}>adenchase.com</span>
        </div>
      </div>
      <span className="g-tagline" style={{ fontSize: wide ? 13 : 18 }}>
        {INSIGHTS.tagline}
      </span>
    </div>
  );
}

const G_CSS = `
html, body { margin: 0; background: #00103D !important; }
.g { position: relative; overflow: hidden; background: #00103D; color: #fff; font-family: var(--font-inter-tight), system-ui, sans-serif; }
.g::before { content: ""; position: absolute; inset: 0; background: radial-gradient(80% 70% at 0% 100%, rgba(0,66,172,0.55), transparent 70%); }
.g-photo { position: absolute; overflow: hidden; }
.g-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.g-ph { display: flex; align-items: flex-end; padding: 36px; box-sizing: border-box; border-left: 1px dashed rgba(0,211,251,0.45); border-bottom: 1px dashed rgba(0,211,251,0.45);
  background: repeating-linear-gradient(135deg, rgba(0,211,251,0.07) 0 1px, transparent 1px 16px), linear-gradient(160deg, #0a2e7a, #010b31); }
.g-ph p { margin: 0; font-size: 18px; letter-spacing: 0.18em; text-transform: uppercase; color: #00D3FB; line-height: 1.6; }
.g-ph p span { letter-spacing: 0; text-transform: none; color: #b4c4e0; font-size: 26px; }
.g-text { position: absolute; display: flex; flex-direction: column; }
.g-pub { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: 0.24em; text-transform: uppercase; color: #fff; }
.g-issue { margin: 10px 0 0; font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase; color: #83FD80; }
.g-title { margin: 28px 0 0; font-weight: 650; line-height: 1.04; letter-spacing: -0.03em; color: #fff; }
.g-author { margin: 22px 0 0; color: #b4c4e0; }
.g-foot { margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid rgba(180,196,224,0.25); padding-top: 18px; }
.g-foot img { display: block; height: auto; }
.g-foot span { color: #b4c4e0; letter-spacing: 0.02em; }
.g-tagline { position: absolute; right: 36px; bottom: 18px; display: none; }
`;
