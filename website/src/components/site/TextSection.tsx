import { Reveal } from "@/components/editorial/SplitLines";

/**
 * An editorial text section: label, headline and paragraphs in the site's two-column rhythm.
 * Used for the copy-led sections of the inner pages.
 */
export function TextSection({
  label,
  title,
  paragraphs,
  statement,
  id,
  tint = false,
  children,
}: {
  label: string;
  title: string;
  paragraphs: readonly string[];
  statement?: string;
  id: string;
  tint?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={`relative border-t border-line ${tint ? "bg-navy/40" : ""}`}>
      <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-28">
        <div className="lg:col-span-5">
          <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
            <span aria-hidden className="h-px w-8 bg-jade" />
            {label}
          </Reveal>
          <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
            <span id={id}>{title}</span>
          </Reveal>
        </div>
        <div className="space-y-5 text-[1.0625rem] leading-relaxed text-mist lg:col-span-6 lg:col-start-7">
          {paragraphs.map((p, i) => (
            <Reveal as="p" key={i} delay={i * 70}>
              {p}
            </Reveal>
          ))}
          {statement && (
            <Reveal as="p" delay={paragraphs.length * 70} className="border-l-2 border-jade pl-4 text-[1.15rem] font-medium leading-snug text-ink">
              {statement}
            </Reveal>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
