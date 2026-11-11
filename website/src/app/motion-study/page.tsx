import type { Metadata } from "next";
import Link from "next/link";
import { MotionStudyStage } from "@/components/motion/MotionStudyStage";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";
import { CTA_INTRO, SITE } from "@/lib/site";
import { DNA_DISCIPLINES, STRANDS } from "@/components/monolith/disciplines";

export const metadata: Metadata = {
  title: "Hero motion study",
  description: "Six-second motion study of the ADEN-CHASE hero. Not for publication.",
  robots: { index: false, follow: false },
};

/** The Growth Genome motion study — C1 at rest animating into C2. Review only. */
export default function MotionStudyPage() {
  return (
    <>
      <MotionStudyStage />
      <div aria-hidden className="scrim-story pointer-events-none fixed inset-0 z-0" />
      <main id="main" className="relative z-10">
        <section aria-labelledby="hero-title" className="relative" data-reveal-immediate="">
          {/* Phones: the sequence owns the first screen; the headline enters beneath the sculpture. */}
          <div className="flex min-h-svh items-start pb-28 pt-[58svh] lg:items-center lg:pb-0 lg:pt-20">
            <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12">
              <div className="max-w-2xl lg:w-[46%] lg:max-w-none">
                <Reveal as="p" delay={400} className="type-label hidden items-center gap-3 text-haze lg:flex">
                  <span aria-hidden className="h-px w-8 bg-jade" />
                  {SITE.disciplines}
                </Reveal>
                <SplitLines as="h1" id="hero-title" delay={600} lines={["The future", "doesn’t build", "itself."]} accent={2} className="type-display text-ink lg:mt-7" />
                <Reveal as="p" delay={1100} className="type-lede mt-6 max-w-[30rem] text-mist lg:mt-8">
                  We identify opportunity, engineer intelligent solutions, and create new pathways for business growth.
                </Reveal>
                <Reveal delay={1300} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:mt-10">
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
        <div className="sr-only">
          <h2>The DNA of Growth</h2>
          <p>
            A monolith opens to reveal a double helix. One strand represents {STRANDS[0].title}; the other represents {STRANDS[1].title}. Six connections join them:
          </p>
          <ol>
            {DNA_DISCIPLINES.map((d) => (
              <li key={d.title}>
                {d.title}: {d.line}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </>
  );
}
