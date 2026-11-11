import type { Metadata } from "next";
import { NexusStage } from "@/components/nexus/NexusStage";
import { RegionTracker } from "@/components/site/RegionTracker";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";
import { DISCIPLINES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Expertise",
  description: "Business Strategy, AI Engineering and Market Growth — three interconnected disciplines and how they are applied in practice.",
};

export default function ExpertisePage() {
  return (
    <main id="main">
      <RegionTracker />
      <div className="relative mx-auto max-w-[96rem] lg:grid lg:grid-cols-12">
        {/* The Nexus stays in view, highlighting the discipline being read. */}
        <div className="stage-fade-x pointer-events-none max-lg:fixed max-lg:inset-x-0 max-lg:top-0 max-lg:h-[46svh] max-lg:opacity-80 lg:sticky lg:top-0 lg:order-2 lg:col-span-6 lg:col-start-7 lg:h-svh">
          <NexusStage variant="contained" story={2} distance={0.72} />
        </div>

        <div className="relative z-10 px-5 sm:px-8 lg:order-1 lg:col-span-6 lg:px-12">
          <section aria-labelledby="page-title" data-reveal-immediate="" className="flex min-h-svh flex-col justify-end pb-16 pt-36 lg:justify-center lg:pb-0">
            <Reveal as="p" delay={150} className="type-label flex items-center gap-3 text-haze">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Expertise
            </Reveal>
            <SplitLines as="h1" id="page-title" delay={260} lines={["Three disciplines.", "One connected", "system."]} accent={2} className="type-headline mt-7 text-ink" />
            <Reveal as="p" delay={620} className="type-lede mt-8 max-w-[33rem] text-mist">
              Business strategy sets direction. AI engineering builds the systems that deliver it. Market growth turns both into commercial momentum. Each is stronger because of the others.
            </Reveal>
          </section>

          {DISCIPLINES.map((d) => (
            <section
              key={d.id}
              id={d.id}
              data-region={d.region}
              aria-labelledby={`${d.id}-title`}
              className="scroll-mt-24 border-t border-line py-20 max-lg:rounded-3xl max-lg:border max-lg:bg-navy-deep/80 max-lg:px-6 max-lg:py-10 max-lg:backdrop-blur-md max-lg:[&+section]:mt-6 lg:py-28"
            >
              <Reveal as="p" className="type-label text-jade">
                {d.index}
              </Reveal>
              <Reveal as="h2" delay={60} className="type-title mt-4 text-ink">
                <span id={`${d.id}-title`}>{d.title}</span>
              </Reveal>
              <Reveal as="p" delay={120} className="mt-4 text-lg font-medium text-ocean">
                {d.line}
              </Reveal>
              <Reveal as="p" delay={180} className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-mist">
                {d.description}
              </Reveal>
              <div className="mt-10 grid gap-10 sm:grid-cols-2">
                <Reveal delay={220}>
                  <h3 className="type-label text-haze">Practical applications</h3>
                  <ul className="mt-5 space-y-3 text-[0.9375rem] text-ink/90">
                    {d.applications.map((a) => (
                      <li key={a} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-ocean" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={280}>
                  <h3 className="type-label text-haze">Questions we help answer</h3>
                  <ul className="mt-5 space-y-4 text-[0.9375rem] italic leading-relaxed text-mist">
                    {d.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
          ))}
          <div className="h-16 lg:h-24" />
        </div>
      </div>
      <div className="relative z-10 bg-navy">
        <CtaBand title="Bring the right discipline to the right opportunity." />
      </div>
    </main>
  );
}
