import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/editorial/SplitLines";
import { ShareLinks } from "@/components/insights/ShareLinks";
import { CtaBand } from "@/components/site/CtaBand";
import { INSIGHTS, articleBySlug, authorOf, formatDate, publishedArticles } from "@/lib/insights";
import { SITE } from "@/lib/site";

/** Only published articles are built; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return {};
  const url = `${SITE.url}/insights/${a.slug}`;
  const images = a.image ? [{ url: a.image.src, width: a.image.width, height: a.image.height, alt: a.image.alt }] : [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: INSIGHTS.title }];
  const author = authorOf(a);
  return {
    title: `${a.title} | ${INSIGHTS.title}`,
    description: a.excerpt,
    alternates: { canonical: url },
    authors: [{ name: author.name }],
    openGraph: { type: "article", url, title: a.title, description: a.excerpt, publishedTime: a.date || undefined, authors: [author.name], section: a.category, images },
    twitter: { card: "summary_large_image", title: a.title, description: a.excerpt, images },
    robots: a.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const author = authorOf(a);
  const url = `${SITE.url}/insights/${a.slug}`;
  const { Body } = a;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date || undefined,
    articleSection: a.category,
    author: { "@type": "Person", name: author.name, affiliation: { "@type": "Organization", name: SITE.name } },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/brand/aden-chase-logo.png` } },
    image: [a.image ? `${SITE.url}${a.image.src}` : `${SITE.url}/opengraph-image.png`],
    mainEntityOfPage: url,
    isPartOf: { "@type": "CreativeWorkSeries", name: INSIGHTS.title },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article aria-labelledby="page-title">
        <header data-reveal-immediate="" className="mx-auto max-w-[56rem] px-5 pb-12 pt-36 sm:px-8 lg:pt-44">
          <Reveal as="p" delay={120} className="type-label flex flex-wrap items-center gap-x-3 gap-y-2 text-haze">
            <Link href="/insights" className="link-quiet">
              {INSIGHTS.title}
            </Link>
            <span aria-hidden className="h-px w-5 bg-line" />
            <span className="text-jade">{a.category}</span>
          </Reveal>
          <Reveal as="h1" delay={220} className="type-headline mt-7 text-ink">
            <span id="page-title">{a.title}</span>
          </Reveal>
          <Reveal as="p" delay={340} className="type-lede mt-7 text-mist">
            {a.excerpt}
          </Reveal>
          <Reveal delay={440} className="mt-10 flex flex-col gap-1 border-t border-line pt-6 text-sm text-haze sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="text-ink">{author.name}</span> · {author.role}
            </p>
            <time dateTime={a.date || undefined}>{formatDate(a.date)}</time>
          </Reveal>
        </header>

        {a.image && (
          <figure className="mx-auto max-w-[72rem] px-5 sm:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element -- editorial image */}
            <img src={a.image.src} alt={a.image.alt} width={a.image.width} height={a.image.height} decoding="async" className="photo h-auto w-full rounded-3xl" />
            {a.image.credit && <figcaption className="mt-3 text-xs text-haze">{a.image.credit}</figcaption>}
          </figure>
        )}

        <div className="insight-prose mx-auto max-w-[44rem] px-5 py-14 sm:px-8 lg:py-20">
          <Body />
        </div>

        <footer className="mx-auto max-w-[44rem] border-t border-line px-5 pb-16 pt-8 sm:px-8">
          <ShareLinks url={url} title={a.title} />
          <p className="mt-10">
            <Link href="/insights" className="link-quiet text-sm underline-offset-4 hover:underline">
              ← All of {INSIGHTS.title}
            </Link>
          </p>
        </footer>
      </article>
      <CtaBand title="Have an opportunity worth examining?" copy="If this perspective raised a question about your own organization, start a conversation." />
    </main>
  );
}
