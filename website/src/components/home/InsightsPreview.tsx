import Link from "next/link";
import { Reveal } from "@/components/editorial/SplitLines";
import { EditionMeta } from "@/components/insights/EditionMeta";
import { FeaturedImage } from "@/components/insights/FeaturedImage";
import { INSIGHTS, featuredArticle, view } from "@/lib/insights";

/**
 * Homepage: The Opportunity Perspective, with the featured edition (headline, subtitle and
 * photograph) and a discreet PDF link. Renders nothing until an edition is published.
 */
export function InsightsPreview() {
  const a = featuredArticle();
  if (!a) return null;
  const v = view(a);
  return (
    <section aria-labelledby="insights-preview-title" className="relative border-t border-line">
      <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              {INSIGHTS.label}
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
              <span id="insights-preview-title">{INSIGHTS.title}</span>
            </Reveal>
          </div>
          <Reveal as="p" delay={140} className="type-label text-jade">
            {INSIGHTS.tagline}
          </Reveal>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {a.image.approved && a.image.src ? (
            <Reveal delay={160} className="lg:col-span-6">
              <FeaturedImage image={a.image} sizes="(min-width: 1024px) 45vw, 100vw" />
            </Reveal>
          ) : null}
          <Reveal delay={220} className={a.image.approved && a.image.src ? "lg:col-span-6" : "lg:col-span-8"}>
            <EditionMeta article={a} minutes={v.minutes} />
            <h3 className="type-title mt-6 text-ink">{a.title}</h3>
            <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-mist">{a.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/insights/${a.slug}`} className="btn btn-primary">
                Read the Perspective
                <span aria-hidden className="btn-arrow">→</span>
              </Link>
              <a href={v.assets.pdf} download={v.assets.pdfName} className="link-quiet text-sm underline-offset-4 hover:underline">
                Download PDF
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
