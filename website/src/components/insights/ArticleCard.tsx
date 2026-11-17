import Link from "next/link";
import { EditionMeta } from "@/components/insights/EditionMeta";
import { type Article, authorOf, view } from "@/lib/insights";

/** An archive entry: a ruled editorial row (no card chrome). */
export function ArticleCard({ article }: { article: Article }) {
  const v = view(article);
  return (
    <article className="editorial-row group relative grid gap-3 border-t border-line py-8 md:grid-cols-12 md:gap-8">
      <EditionMeta article={article} minutes={v.minutes} className="md:col-span-4" />
      <div className="md:col-span-8">
        <h3 className="type-title text-ink">
          <Link href={`/insights/${article.slug}`} className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-jade focus-visible:underline">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 max-w-[40rem] leading-relaxed text-mist">{article.subtitle}</p>
        <p className="mt-4 text-sm text-haze">{authorOf(article).name}</p>
      </div>
    </article>
  );
}
