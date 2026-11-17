import { type Article, formatDate, issueLabel } from "@/lib/insights";

/** "Issue 001 · Inaugural Edition — Tourism & Destination Development — November 17, 2026 — 5 min read" */
export function EditionMeta({
  article,
  minutes,
  className = "",
}: {
  article: Article;
  minutes?: number;
  className?: string;
}) {
  return (
    <p
      className={`type-label flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-haze ${className}`}
    >
      <span className="text-jade">
        {issueLabel(article.issue)}
        {article.edition ? ` · ${article.edition}` : ""}
      </span>
      <span className="text-haze/60" aria-hidden>
        ·
      </span>
      <span className="sr-only">, </span>
      <span>{article.category}</span>
      <span className="text-haze/60" aria-hidden>
        ·
      </span>
      <span className="sr-only">, </span>
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      {minutes ? (
        <>
          <span className="text-haze/60" aria-hidden>
            ·
          </span>
          <span className="sr-only">, </span>
          <span>{minutes} min read</span>
        </>
      ) : null}
    </p>
  );
}
