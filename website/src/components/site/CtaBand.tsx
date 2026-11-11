import Link from "next/link";
import { Reveal } from "@/components/editorial/SplitLines";
import { CTA_INTRO } from "@/lib/site";

export function CtaBand({ title = "Your next opportunity starts here." }: { title?: string }) {
  return (
    <section aria-label="Begin a conversation" className="relative border-t border-line">
      <div className="mx-auto flex max-w-[96rem] flex-col gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:py-28">
        <Reveal as="p" className="type-title max-w-2xl text-ink">
          {title}
        </Reveal>
        <Reveal delay={120}>
          <Link href="/engagement" className="btn btn-primary">
            {CTA_INTRO}
            <span aria-hidden className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
