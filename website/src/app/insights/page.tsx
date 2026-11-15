import type { Metadata } from "next";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { CtaBand } from "@/components/site/CtaBand";
import { pageMeta } from "@/lib/meta";
import { InsightsDescriptor } from "@/components/insights/Descriptor";
import { INSIGHTS, publishedArticles } from "@/lib/insights";

export const metadata: Metadata = pageMeta(`${INSIGHTS.title} | Insights`, INSIGHTS.description);

export default function InsightsPage() {
  const [feature, ...rest] = publishedArticles();
  return (
    <main id="main">
      {/* The column's masthead: typographic, like the front of a journal. */}
      <section aria-labelledby="page-title" data-reveal-immediate="" className="relative overflow-hidden">
        <div className="mx-auto max-w-[96rem] px-5 pb-16 pt-36 sm:px-8 lg:px-12 lg:pb-24 lg:pt-44">
          <Reveal as="p" delay={150} className="type-label flex items-center gap-3 text-haze">
            <span aria-hidden className="h-px w-8 bg-jade" />
            {INSIGHTS.label}
          </Reveal>
          <SplitLines as="h1" id="page-title" delay={260} lines={["The Opportunity", "Perspective"]} accent={1} className="type-display mt-7 max-w-[60rem] text-ink" />
          <div className="mt-10 grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
            <Reveal as="p" delay={520} className="type-label text-jade lg:col-span-4">
              <InsightsDescriptor />
            </Reveal>
            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal as="p" delay={600} className="type-lede text-mist">
                {INSIGHTS.intro}
              </Reveal>
              <Reveal as="p" delay={680} className="mt-5 leading-relaxed text-mist">
                {INSIGHTS.purpose}
              </Reveal>
              <Reveal as="p" delay={740} className="mt-8 text-sm text-haze">
                By <span className="text-ink">{INSIGHTS.author.name}</span> · {INSIGHTS.author.role}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Articles" className="relative border-t border-line">
        <div className="mx-auto max-w-[96rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          {feature ? (
            <>
              <Reveal>
                <ArticleCard article={feature} feature headingLevel="h2" />
              </Reveal>
              {rest.length > 0 && (
                <Reveal delay={80} className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((a) => (
                    <ArticleCard key={a.slug} article={a} headingLevel="h2" />
                  ))}
                </Reveal>
              )}
            </>
          ) : (
            <Reveal className="rounded-3xl border border-line bg-navy-deep/50 px-6 py-14 text-center sm:px-12">
              <p className="type-label text-jade">First edition</p>
              <h2 className="type-title mt-5 text-ink">In preparation.</h2>
              <p className="mx-auto mt-5 max-w-[34rem] leading-relaxed text-mist">The first essays of The Opportunity Perspective are being prepared. New editions are planned weekly.</p>
            </Reveal>
          )}
        </div>
      </section>

      <CtaBand title="Have an opportunity worth examining?" copy="Every article begins with a question about where meaningful improvement is possible. If yours is one of them, start a conversation." />
    </main>
  );
}
