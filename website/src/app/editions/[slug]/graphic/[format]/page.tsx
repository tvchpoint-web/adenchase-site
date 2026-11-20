import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INSIGHTS, articleBySlug, authorOf, issueLabel } from "@/lib/insights";
import { BARE_PAGE_CSS, templateSlugs } from "@/lib/editorial/templates";

const FORMATS = { landscape: [1200, 630], portrait: [1080, 1350], story: [1080, 1920] } as const;
type Format = keyof typeof FORMATS;

/**
 * Per-format scale. Sizes are chosen so the headline stays legible where previews are smallest:
 * a 1200×630 link card is shown about 350px wide on a phone, so its 78px headline reads at ~23px.
 * The story format keeps text inside Instagram/WhatsApp's top and bottom interface zones.
 */
const SCALE: Record<Format, { pad: [number, number, number, number]; mast: number; rule: number; title: number; byline: number; logo: number; url: number }> = {
  landscape: { pad: [58, 68, 50, 68], mast: 19, rule: 3, title: 78, byline: 21, logo: 200, url: 19 },
  portrait: { pad: [96, 92, 84, 92], mast: 27, rule: 4, title: 112, byline: 30, logo: 290, url: 27 },
  story: { pad: [250, 88, 260, 88], mast: 29, rule: 4, title: 112, byline: 32, logo: 310, url: 29 },
};

export const dynamicParams = false;
export const generateStaticParams = () => templateSlugs().flatMap((slug) => (Object.keys(FORMATS) as Format[]).map((format) => ({ slug, format })));
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Social-sharing graphic for an edition (captured as an image by `npm run editions`): a text-only
 * editorial card — masthead and issue, the headline, the author, and the official ADEN-CHASE
 * artwork with the web address. No photograph (the featured photograph is for the online article).
 */
export default async function EditionGraphic({ params }: PageProps<"/editions/[slug]/graphic/[format]">) {
  const { slug, format } = await params;
  const a = articleBySlug(slug);
  if (!a || !(format in FORMATS)) notFound();
  const f = format as Format;
  const [w, h] = FORMATS[f];
  const s = SCALE[f];
  const author = authorOf(a);

  return (
    <div className="g" style={{ width: w, height: h, padding: s.pad.map((v) => `${v}px`).join(" ") }}>
      <style>{BARE_PAGE_CSS + G_CSS}</style>
      <header className="g-mast" style={{ fontSize: s.mast }}>
        <span>{INSIGHTS.title}</span>
        <span className="g-sep" aria-hidden="true">
          |
        </span>
        <span className="g-issue">{issueLabel(a.issue)}</span>
      </header>
      <span className="g-rule" style={{ height: s.rule, width: s.mast * 3 }} />

      <main className="g-body">
        <h1 className="g-title" style={{ fontSize: s.title, textWrap: f === "landscape" ? "balance" : "pretty" }}>
          {a.title}
        </h1>
        <p className="g-byline" style={{ fontSize: s.byline }}>
          {author.name}
          <span className="g-dot"> · </span>
          {author.title}
        </p>
      </main>

      <footer className="g-foot">
        {/* eslint-disable-next-line @next/next/no-img-element -- the official logo (colour-to-alpha cut of the master artwork) */}
        <img src="/brand/aden-chase-logo-transparent.png" alt="" style={{ width: s.logo }} />
        <span style={{ fontSize: s.url }}>adenchase.com</span>
      </footer>
    </div>
  );
}

const G_CSS = `
html, body { margin: 0; background: #00103D !important; }
.g { position: relative; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; color: #fff;
  font-family: var(--font-inter-tight), system-ui, sans-serif;
  background:
    radial-gradient(70% 60% at 0% 100%, rgba(0,66,172,0.55), transparent 72%),
    radial-gradient(45% 40% at 100% 0%, rgba(0,211,251,0.08), transparent 70%),
    #00103D; }
.g > * { position: relative; }
.g-mast { display: flex; align-items: baseline; gap: 0.7em; margin: 0; font-weight: 650; letter-spacing: 0.22em; text-transform: uppercase; line-height: 1; }
.g-sep { color: rgba(180,196,224,0.55); letter-spacing: 0; font-weight: 400; }
.g-issue { color: #83FD80; }
.g-rule { display: block; margin-top: 0.9em; background: #83FD80; border-radius: 1px; }
.g-body { margin: auto 0; padding: 0.4em 0; }
.g-title { margin: 0; font-weight: 650; line-height: 1.02; letter-spacing: -0.035em; color: #fff; }
.g-byline { margin: 0.9em 0 0; color: #b4c4e0; line-height: 1.3; letter-spacing: 0.005em; }
.g-dot { color: rgba(180,196,224,0.55); }
.g-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; border-top: 1px solid rgba(180,196,224,0.22); padding-top: 0.9em; font-size: 20px; }
.g-foot img { display: block; height: auto; }
.g-foot span { color: #b4c4e0; letter-spacing: 0.02em; line-height: 1; }
`;
