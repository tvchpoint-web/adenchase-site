import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/insights/ArticleBody";
import { AuthorSignature } from "@/components/insights/AuthorSignature";
import { EditionMeta } from "@/components/insights/EditionMeta";
import { FeaturedImage } from "@/components/insights/FeaturedImage";
import { ReadingProgress } from "@/components/insights/ReadingProgress";
import { ShareBar } from "@/components/insights/ShareBar";
import { ArticleAnalytics } from "@/components/insights/ArticleAnalytics";
import { INSIGHTS, articleBySlug, authorOf, issueLabel, publishedArticles, view } from "@/lib/insights";
import { SITE } from "@/lib/site";
import { editionJsonLd } from "@/lib/editorial/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

/** Only published editions are built; any other slug (drafts included) is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedArticles()
    .filter((a) => a.status === "published")
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return {};
  const v = view(a);
  const author = authorOf(a);
  const image = { url: v.assets.landscape, width: 1200, height: 630, alt: `${INSIGHTS.title}, ${issueLabel(a.issue)}: ${a.title}` };
  return {
    title: { absolute: a.seoTitle ?? `${a.title} | ${SITE.name}` },
    description: a.description,
    alternates: { canonical: `/insights/${a.slug}` },
    authors: [{ name: author.name }],
    openGraph: {
      type: "article",
      url: `/insights/${a.slug}`,
      siteName: SITE.name,
      title: a.title,
      description: a.description,
      publishedTime: a.date,
      modifiedTime: a.modified ?? a.date,
      authors: [author.name],
      section: a.category,
      tags: a.discoverability ? [a.discoverability.primaryTopic, ...a.discoverability.secondaryTopics.slice(0, 5)] : undefined,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.description, images: [image] },
  };
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const v = view(a);
  const author = authorOf(a);
  const jsonLd = editionJsonLd(a, v);
  const related = [...new Set(a.discoverability?.related ?? [])].filter((slug) => slug !== a.slug).map((slug) => articleBySlug(slug)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <main id="main">
      <ReadingProgress target="#edition" />
      <ArticleAnalytics slug={a.slug} issue={String(a.issue).padStart(3, "0")} category={a.category} />
      <JsonLd data={jsonLd} />
      <article id="edition" aria-labelledby="page-title">
        <header data-reveal-immediate="" className="mx-auto max-w-[60rem] px-5 pt-32 sm:px-8 lg:pt-40">
          <nav aria-label="Breadcrumb" className="border-b border-line pb-4 text-center">
            <Link href="/insights" className="type-label text-ink outline-none hover:text-jade focus-visible:underline">
              The Opportunity Perspective
            </Link>
          </nav>
          <EditionMeta article={a} minutes={v.minutes} className="mt-8 justify-center" />
          <h1 id="page-title" className="type-headline mt-7 text-center text-ink">
            {a.title}
          </h1>
          <p className="type-lede mx-auto mt-7 max-w-[44rem] text-center text-mist">{a.subtitle}</p>
          <p className="mt-8 text-center text-sm text-haze">
            By <span className="text-ink">{author.name}</span> | {author.organization}
          </p>
          <ShareBar url={v.url} title={a.title} pdf={v.assets.pdf} pdfName={v.assets.pdfName} className="mt-8 justify-center border-y border-line py-3" />
        </header>

        <FeaturedImage image={a.image} priority className="mx-auto mt-12 max-w-[72rem] px-5 sm:px-8" sizes="(min-width: 1152px) 1152px, 100vw" />

        {a.summary?.status === "approved" ? (
          <aside aria-label="Editorial summary" className="mx-auto mt-14 max-w-[42rem] border-l-2 border-jade px-5 sm:px-8">
            <p className="type-label text-haze">Editorial summary</p>
            <p className="mt-2 leading-relaxed text-mist">{a.summary.text}</p>
          </aside>
        ) : null}

        <ArticleBody blocks={v.blocks} className="mx-auto max-w-[42rem] px-5 py-14 sm:px-8 lg:py-20" />

        <footer className="mx-auto max-w-[42rem] px-5 pb-16 sm:px-8">
          <div className="border-t-2 border-ink pt-8">
            <AuthorSignature author={author} />
          </div>
          <ShareBar url={v.url} title={a.title} pdf={v.assets.pdf} pdfName={v.assets.pdfName} className="mt-10 border-y border-line py-3" />
          {related.length ? (
            <section aria-labelledby="related-title" className="mt-12">
              <h2 id="related-title" className="type-label text-haze">
                Related perspectives
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/insights/${r.slug}`} className="link-quiet underline-offset-4 hover:underline">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="mt-10">
            <Link href="/insights" className="link-quiet text-sm underline-offset-4 hover:underline">
              ← Back to Insights: {INSIGHTS.title}
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
