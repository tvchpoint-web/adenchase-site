import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/editorial/SplitLines";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { EditionMeta } from "@/components/insights/EditionMeta";
import { FeaturedImage } from "@/components/insights/FeaturedImage";
import { ShareBar } from "@/components/insights/ShareBar";
import { pageMeta } from "@/lib/meta";
import { INSIGHTS, authorOf, featuredArticle, publishedArticles, publishedCategories, view } from "@/lib/insights";

export const metadata: Metadata = pageMeta(`${INSIGHTS.title} | Insights`, `${INSIGHTS.description} ${INSIGHTS.about}`);

export default function InsightsPage() {
  const featured = featuredArticle();
  const f = featured ? view(featured) : null;
  const rest = publishedArticles().filter((a) => a.slug !== featured?.slug);
  const categories = publishedCategories();
  const inaugural = featured?.issue === 1 && rest.length === 0;

  return (
    <main id="main">
      {/* Masthead */}
      <header data-reveal-immediate="" className="mx-auto max-w-[96rem] px-5 pt-32 sm:px-8 lg:px-12 lg:pt-40">
        <div className="border-y border-line py-8 text-center sm:py-10">
          <p className="type-label text-haze">{INSIGHTS.publisher}</p>
          <h1 className="editorial-masthead mt-4 text-ink">The Opportunity Perspective</h1>
          <p className="type-label mt-5 text-jade">{INSIGHTS.tagline}</p>
        </div>
        <div className="grid gap-6 py-8 lg:grid-cols-12">
          <p className="type-lede text-mist lg:col-span-6">{INSIGHTS.description}</p>
          <p className="leading-relaxed text-mist lg:col-span-5 lg:col-start-8">{INSIGHTS.about}</p>
        </div>
      </header>

      {f && featured ? (
        <section aria-labelledby="featured-title" className="mx-auto max-w-[96rem] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="border-t-2 border-ink pt-5">
            <p className="type-label text-ink">{inaugural ? "Inaugural edition" : "Featured"}</p>
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-7">
              <Link href={`/insights/${f.slug}`} tabIndex={-1} aria-hidden className="block">
                <FeaturedImage image={f.image} priority />
              </Link>
            </Reveal>
            <div className="lg:col-span-5">
              <EditionMeta article={featured} minutes={f.minutes} />
              <h2 id="featured-title" className="mt-6 text-[clamp(2rem,1.2rem+2.4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink">
                <Link href={`/insights/${f.slug}`} className="outline-none hover:text-jade focus-visible:underline">
                  {f.title}
                </Link>
              </h2>
              <p className="type-lede mt-6 text-mist">{f.subtitle}</p>
              <p className="mt-6 text-sm text-haze">
                By <span className="text-ink">{authorOf(f).name}</span> · {authorOf(f).organization}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href={`/insights/${f.slug}`} className="btn btn-primary">
                  Read Article
                  <span aria-hidden className="btn-arrow">→</span>
                </Link>
              </div>
              <ShareBar url={f.url} title={f.title} pdf={f.assets.pdf} pdfName={f.assets.pdfName} className="mt-6 border-t border-line pt-5" />
            </div>
          </div>
        </section>
      ) : (
        <section aria-label="Editions" className="mx-auto max-w-[96rem] px-5 pb-24 sm:px-8 lg:px-12">
          <p className="border-t border-line pt-8 text-mist">The first edition is in preparation.</p>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="archive-title" className="mx-auto max-w-[96rem] px-5 pb-24 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink pt-5">
            <h2 id="archive-title" className="type-label text-ink">
              Previous editions
            </h2>
            {categories.length > 1 && (
              <ul className="flex flex-wrap gap-2 text-sm text-mist" aria-label="Categories">
                {categories.map((c) => (
                  <li key={c} className="border border-line px-2.5 py-1">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {rest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </section>
      )}
    </main>
  );
}
