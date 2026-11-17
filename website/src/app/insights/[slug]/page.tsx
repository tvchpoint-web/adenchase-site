import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/insights/ArticleBody";
import { AuthorSignature } from "@/components/insights/AuthorSignature";
import { EditionMeta } from "@/components/insights/EditionMeta";
import { FeaturedImage } from "@/components/insights/FeaturedImage";
import { ReadingProgress } from "@/components/insights/ReadingProgress";
import { ShareBar } from "@/components/insights/ShareBar";
import { INSIGHTS, articleBySlug, authorOf, issueLabel, publishedArticles, view } from "@/lib/insights";
import { SITE } from "@/lib/site";

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    alternativeHeadline: a.subtitle,
    description: a.description,
    datePublished: a.date,
    dateModified: a.modified ?? a.date,
    articleSection: a.category,
    wordCount: v.words,
    timeRequired: `PT${v.minutes}M`,
    inLanguage: "en",
    url: v.url,
    mainEntityOfPage: v.url,
    image: [`${SITE.url}${v.assets.landscape}`],
    author: { "@type": "Person", name: author.name, jobTitle: author.title, worksFor: { "@type": "Organization", name: author.organization, url: SITE.url } },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: `${SITE.url}/brand/aden-chase-logo.png` } },
    isPartOf: { "@type": "Periodical", name: INSIGHTS.title, publisher: { "@type": "Organization", name: SITE.name } },
    encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: `${SITE.url}${v.assets.pdf}` },
  };

  return (
    <main id="main">
      <ReadingProgress target="#edition" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article id="edition" aria-labelledby="page-title">
        <header data-reveal-immediate="" className="mx-auto max-w-[60rem] px-5 pt-32 sm:px-8 lg:pt-40">
          <p className="border-b border-line pb-4 text-center">
            <Link href="/insights" className="type-label text-ink outline-none hover:text-jade focus-visible:underline">
              The Opportunity Perspective
            </Link>
          </p>
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

        <ArticleBody blocks={v.blocks} className="mx-auto max-w-[42rem] px-5 py-14 sm:px-8 lg:py-20" />

        <footer className="mx-auto max-w-[42rem] px-5 pb-16 sm:px-8">
          <div className="border-t-2 border-ink pt-8">
            <AuthorSignature author={author} />
          </div>
          <ShareBar url={v.url} title={a.title} pdf={v.assets.pdf} pdfName={v.assets.pdfName} className="mt-10 border-y border-line py-3" />
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
