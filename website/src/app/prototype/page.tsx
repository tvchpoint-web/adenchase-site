import type { Metadata } from "next";
import Link from "next/link";
import { MonolithStage } from "@/components/monolith/MonolithStage";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";
import { CTA_INTRO, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hero look development",
  description: "Look-development prototype of the ADEN-CHASE hero. Not for publication.",
  robots: { index: false, follow: false },
};

/**
 * Hero-only look-development prototype: The Monolith + The Living Signal.
 * Scrolling through the hero opens the sculpture further; scrolling back closes it.
 */
export default function PrototypePage() {
  return (
    <>
      <MonolithStage scrollTargetId="hero" />
      <div aria-hidden className="scrim-story pointer-events-none fixed inset-0 z-0" />
      <main id="main" className="relative z-10">
        <section id="hero" aria-labelledby="hero-title" className="relative min-h-svh lg:min-h-[210vh]" data-reveal-immediate="">
          <div className="flex min-h-svh items-end pb-14 pt-28 lg:sticky lg:top-0 lg:h-svh lg:items-center lg:pb-0 lg:pt-20">
            <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12">
              <div className="max-w-2xl lg:w-[46%] lg:max-w-none">
                <Reveal as="p" delay={600} className="type-label hidden items-center gap-3 text-haze lg:flex">
                  <span aria-hidden className="h-px w-8 bg-jade" />
                  {SITE.disciplines}
                </Reveal>
                <SplitLines as="h1" id="hero-title" delay={800} lines={["The future", "doesn’t build", "itself."]} accent={2} className="type-display text-ink lg:mt-7" />
                <Reveal as="p" delay={1300} className="type-lede mt-6 max-w-[30rem] text-mist lg:mt-8">
                  We identify opportunity, engineer intelligent solutions, and create new pathways for business growth.
                </Reveal>
                <Reveal delay={1500} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:mt-10">
                  <Link href="/approach" className="btn btn-primary justify-center">
                    Explore Our Approach
                    <span aria-hidden className="btn-arrow">→</span>
                  </Link>
                  <Link href="/engagement" className="btn btn-ghost justify-center">
                    {CTA_INTRO}
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
        <section aria-label="About this prototype" className="relative border-t border-line bg-navy-deep">
          <div className="mx-auto max-w-[96rem] px-5 py-16 sm:px-8 lg:px-12">
            <p className="type-label text-haze">Look-development prototype</p>
            <p className="mt-4 max-w-2xl text-mist">
              Hero only, for review. Move the pointer to light the sculpture; scroll to open it further and back to close it. The remaining scenes will be built after this direction is approved.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
