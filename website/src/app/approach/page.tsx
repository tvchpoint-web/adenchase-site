import type { Metadata } from "next";
import { PHOTO } from "@/lib/photos";
import { PageHero, SectionIntro } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/editorial/SplitLines";
import { ENGAGEMENT_STEPS, FRAMEWORK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "How ADEN-CHASE Strategies identifies opportunity, engineers intelligent solutions and accelerates growth — and how outcomes are measured.",
};

export default function ApproachPage() {
  return (
    <main id="main">
      <PageHero
        label="Our Approach"
        lines={["Identify.", "Engineer.", "Accelerate."]}
        accent={2}
        photo={PHOTO.approachHero}
        block={0}
        lede="Every engagement follows the same discipline: understand the business deeply, build what the opportunity actually requires, then create momentum — measuring progress at every stage."
      />

      <section aria-labelledby="framework-title" className="relative bg-navy/40">
        <div className="mx-auto max-w-[96rem] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <SectionIntro label="The framework" title="Three stages, one connected system." id="framework-title">
            <p>Strategy, engineering and growth are not separate projects handed between teams. Each stage informs the next, so what we learn early shapes everything that follows.</p>
          </SectionIntro>
          <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-3">
            {FRAMEWORK.map((stage, i) => (
              <li key={stage.word} className="bg-navy-deep">
                <Reveal delay={i * 120} className="flex h-full flex-col p-7 sm:p-9 lg:p-10">
                  <span className="type-label text-haze">Stage 0{i + 1}</span>
                  <p className={`mt-6 text-[2.75rem] font-semibold leading-none tracking-[-0.035em] lg:text-[3.25rem] ${i === 2 ? "text-jade" : "text-ink"}`}>{stage.word}</p>
                  <h3 className="mt-6 text-lg font-medium text-ink">{stage.title}</h3>
                  <p className="mt-3 leading-relaxed text-mist">{stage.body}</p>
                  <div className="hairline mt-8" />
                  <ul className="mt-6 space-y-2.5 text-[0.9375rem] text-mist">
                    {stage.involves.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-ocean" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="process-title">
        <div className="mx-auto grid max-w-[96rem] gap-16 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-32">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionIntro label="How an engagement unfolds" title="Considered from the first conversation." id="process-title">
                <p>We work with a small number of clients at a time so each engagement receives senior attention. Scope is defined together, never from a package.</p>
              </SectionIntro>
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {ENGAGEMENT_STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-line last:border-b">
                <Reveal className="grid grid-cols-[3rem_1fr] gap-4 py-8">
                  <span className="type-label pt-1.5 text-jade">0{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium tracking-[-0.01em] text-ink">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-mist">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="measure-title" className="bg-navy/40">
        <div className="mx-auto grid max-w-[96rem] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-32">
          <div className="lg:col-span-5">
            <SectionIntro label="Measuring outcomes" title="Progress you can see, defined before work begins." id="measure-title" />
          </div>
          <div className="space-y-6 text-[1.0625rem] leading-relaxed text-mist lg:col-span-6 lg:col-start-7">
            <Reveal as="p">
              Before any work starts, we agree what success looks like for your business — the specific measures that matter, the baseline they start from, and how often they will be reviewed.
            </Reveal>
            <Reveal as="p" delay={80}>
              Depending on the engagement, that might include visibility and qualified enquiries, time recovered from manual processes, customer experience indicators, partnership pipeline, or revenue from new opportunities.
            </Reveal>
            <Reveal as="p" delay={160}>
              We report against those measures honestly — including what is not yet working — so decisions about where to focus next are grounded in evidence rather than assumption.
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
