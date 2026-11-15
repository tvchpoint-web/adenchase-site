import Link from "next/link";
import { Reveal } from "@/components/editorial/SplitLines";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { InsightsDescriptor } from "@/components/insights/Descriptor";
import { INSIGHTS, publishedArticles } from "@/lib/insights";

/**
 * Homepage: a restrained introduction to The Opportunity Perspective, with the latest articles
 * once published (up to three). Before the first edition it introduces the column only, and
 * never shows placeholder articles.
 */
export function InsightsPreview() {
  const latest = publishedArticles().slice(0, 3);
  return (
    <section aria-labelledby="insights-preview-title" className="relative border-t border-line">
      <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              {INSIGHTS.label}
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-6 text-ink">
              <span id="insights-preview-title">{INSIGHTS.title}</span>
            </Reveal>
            <Reveal as="p" delay={140} className="type-label mt-4 text-jade">
              <InsightsDescriptor />
            </Reveal>
            <Reveal as="p" delay={200} className="mt-6 text-[1.05rem] leading-relaxed text-mist">
              {INSIGHTS.intro} By {INSIGHTS.author.name}
            </Reveal>
          </div>
          <Reveal delay={240} className="shrink-0">
            <Link href="/insights" className="btn btn-ghost">
              {latest.length ? "All Insights" : "About the column"}
              <span aria-hidden className="btn-arrow">→</span>
            </Link>
          </Reveal>
        </div>
        {latest.length > 0 && (
          <Reveal delay={280} className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
