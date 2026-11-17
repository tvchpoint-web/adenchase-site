import { SITE } from "@/lib/site";
import type { Author } from "@/lib/insights";

/** The author's signature block, identical on every edition (typographic; no portrait unless an approved one exists). */
export function AuthorSignature({ author }: { author: Author }) {
  return (
    <address className="not-italic">
      <p className="text-[1.35rem] font-semibold tracking-[-0.01em] text-ink">{author.name}</p>
      <p className="mt-1 text-mist">{author.title}</p>
      <p className="text-mist">{author.organization}</p>
      <p className="type-label mt-4 text-jade">{SITE.statement}</p>
      <p className="mt-4 flex flex-col gap-1 text-sm">
        {author.email ? (
          author.emailVerified ? (
            <a href={`mailto:${author.email}`} className="link-quiet underline-offset-4 hover:underline">
              {author.email}
            </a>
          ) : (
            <span className="text-mist">{author.email}</span>
          )
        ) : null}
        <a href={SITE.url.replace("https://", "https://www.")} className="link-quiet underline-offset-4 hover:underline">
          {SITE.url.replace("https://", "www.")}
        </a>
      </p>
    </address>
  );
}
