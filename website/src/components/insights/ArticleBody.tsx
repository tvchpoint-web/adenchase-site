import Link from "next/link";
import type { Block, Inline } from "@/lib/editorial/markdown";

function Inlines({ content }: { content: Inline[] }) {
  return (
    <>
      {content.map((i, n) =>
        i.type === "text" ? (
          i.text
        ) : i.href.startsWith("/") ? (
          <Link key={n} href={i.href}>
            {i.text}
          </Link>
        ) : (
          <a key={n} href={i.href} target="_blank" rel="noopener noreferrer">
            {i.text}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ),
      )}
    </>
  );
}

/** The edition's body, rendered from its single Markdown source (also used for the PDF). */
export function ArticleBody({ blocks, className = "" }: { blocks: Block[]; className?: string }) {
  return (
    <div className={`insight-prose ${className}`}>
      {blocks.map((b, n) =>
        b.type === "h2" ? (
          <h2 key={n}>{b.text}</h2>
        ) : b.type === "ul" ? (
          <ul key={n}>
            {b.items.map((it, k) => (
              <li key={k}>
                <Inlines content={it} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={n}>
            <Inlines content={b.content} />
          </p>
        ),
      )}
    </div>
  );
}
