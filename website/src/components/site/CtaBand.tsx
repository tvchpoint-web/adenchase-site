import Link from "next/link";
import { Reveal } from "@/components/editorial/SplitLines";
import { CTA } from "@/lib/site";

/** Closing call to action for inner pages: a statement, optional supporting copy, one action. */
export function CtaBand({
  title,
  copy,
  cta = CTA.conversation,
  href = "/contact",
}: {
  title: string;
  copy?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section aria-label={title} className="relative border-t border-line">
      <div className="mx-auto flex max-w-[96rem] flex-col gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-12 lg:py-28">
        <div className="max-w-2xl">
          <Reveal as="h2" className="type-title text-ink">
            {title}
          </Reveal>
          {copy && (
            <Reveal as="p" delay={80} className="mt-5 text-[1.05rem] leading-relaxed text-mist">
              {copy}
            </Reveal>
          )}
        </div>
        <Reveal delay={120} className="shrink-0">
          <Link href={href} className="btn btn-primary">
            {cta}
            <span aria-hidden className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
