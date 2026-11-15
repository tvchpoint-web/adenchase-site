import Link from "next/link";
import { type Article, authorOf, formatDate } from "@/lib/insights";

/** An editorial card: category and date, the headline, its excerpt, the author. */
export function ArticleCard({ article, feature = false, headingLevel = "h3" }: { article: Article; feature?: boolean; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const author = authorOf(article);
  return (
    <article className={`insight-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-navy-deep/60 ${feature ? "lg:flex-row" : ""}`}>
      {article.image && (
        <div className={`relative overflow-hidden ${feature ? "aspect-[16/10] lg:aspect-auto lg:w-1/2" : "aspect-[16/9]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- editorial image, sized by its card */}
          <img src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height} loading="lazy" decoding="async" className="photo insight-card-img absolute inset-0 h-full w-full object-cover" />
        </div>
      )}
      <div className={`flex flex-1 flex-col p-6 sm:p-8 ${feature ? "lg:p-12" : ""}`}>
        <p className="type-label flex flex-wrap items-center gap-x-3 gap-y-1 text-haze">
          <span className="text-jade">{article.category}</span>
          <span aria-hidden className="h-px w-5 bg-line" />
          <time dateTime={article.date || undefined}>{formatDate(article.date)}</time>
        </p>
        <H className={`${feature ? "type-title" : "text-[1.35rem] font-semibold leading-snug tracking-[-0.01em]"} mt-5 text-ink`}>
          <Link href={`/insights/${article.slug}`} className="insight-card-link after:absolute after:inset-0 after:content-['']">
            {article.title}
          </Link>
        </H>
        <p className="mt-4 leading-relaxed text-mist">{article.excerpt}</p>
        <p className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm text-haze">
          <span>{author.name}</span>
          <span aria-hidden className="insight-card-arrow text-jade">→</span>
        </p>
      </div>
    </article>
  );
}
