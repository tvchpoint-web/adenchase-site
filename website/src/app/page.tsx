import Link from "next/link";
import { NexusStage } from "@/components/nexus/NexusStage";
import { StoryController } from "@/components/story/StoryController";
import { DiscoveryLenses } from "@/components/story/DiscoveryLenses";
import { PillarList } from "@/components/story/PillarList";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";
import { CTA_INTRO, OUTCOMES, SITE } from "@/lib/site";

function Scene({
  id,
  index,
  name,
  children,
  height = "lg:min-h-[175vh]",
  immediate = false,
}: {
  id: string;
  index: string;
  name: string;
  children: React.ReactNode;
  height?: string;
  immediate?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative ${height}`} data-scene={index} {...(immediate ? { "data-reveal-immediate": "" } : {})}>
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center">
        <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12">
          <div className="max-w-xl lg:w-[45%] lg:max-w-none">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
              <span className="text-jade">{index}</span>
              <span aria-hidden className="h-px w-8 bg-line" />
              {name}
            </Reveal>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** On small screens the Nexus occupies the upper screen; copy sits on a quiet panel so it always reads. */
const mobilePanel =
  "max-lg:mt-[46svh] max-lg:rounded-3xl max-lg:border max-lg:border-line max-lg:bg-navy-deep/78 max-lg:p-6 max-lg:backdrop-blur-md";

export default function Home() {
  return (
    <>
      <NexusStage variant="fixed" className="z-0" />
      <div aria-hidden className="scrim-story pointer-events-none fixed inset-0 z-0" />
      <StoryController />

      <main id="main" className="relative z-10">
        <div>
          {/* SCENE 01 — ARRIVAL */}
          <section
            id="arrival"
            aria-labelledby="arrival-title"
            className="relative min-h-svh lg:min-h-[150vh]"
            data-scene="01"
            data-reveal-immediate=""
          >
            <div className="flex min-h-svh items-end pb-14 pt-28 lg:sticky lg:top-0 lg:h-svh lg:items-center lg:pb-0 lg:pt-20">
              <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12">
                <div className="max-w-2xl lg:w-[46%] lg:max-w-none">
                  <Reveal as="p" delay={250} className="type-label hidden items-center gap-3 text-haze lg:flex">
                    <span aria-hidden className="h-px w-8 bg-jade" />
                    {SITE.disciplines}
                  </Reveal>
                  <SplitLines
                    as="h1"
                    id="arrival-title"
                    delay={420}
                    lines={["The future", "doesn’t build", "itself."]}
                    accent={2}
                    className="type-display text-ink lg:mt-7"
                  />
                  <Reveal as="p" delay={900} className="type-lede mt-6 max-w-[30rem] text-mist lg:mt-8">
                    We identify opportunity, engineer intelligent solutions, and create new pathways for business growth.
                  </Reveal>
                  <Reveal delay={1080} className="mt-8 flex lg:mt-10 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
              <a
                href="#discovery"
                className="type-label absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-haze transition-colors hover:text-ink lg:flex"
              >
                Scroll to explore
                <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-line">
                  <span className="absolute inset-x-0 top-0 h-3 animate-[cue_2.4s_var(--ease-in-out)_infinite] bg-jade motion-reduce:animate-none" />
                </span>
              </a>
            </div>
          </section>

          {/* SCENE 02 — DISCOVERY */}
          <Scene id="discovery" index="02" name="Discovery">
            <div className={mobilePanel}>
              <SplitLines
                id="discovery-title"
                lines={["We see opportunity", "where others see", "complexity."]}
                accent={0}
                className="type-headline text-ink max-lg:mt-0 lg:mt-6"
              />
              <Reveal as="p" delay={200} className="type-lede mt-7 max-w-[32rem] text-mist">
                We uncover overlooked possibilities, identify strategic gaps, and connect the insights that move businesses forward.
              </Reveal>
              <Reveal delay={320} className="mt-10">
                <DiscoveryLenses />
              </Reveal>
            </div>
          </Scene>

          {/* SCENE 03 — ENGINEERING */}
          <Scene id="engineering" index="03" name="Engineering" height="lg:min-h-[190vh]">
            <div className={mobilePanel}>
              <SplitLines
                id="engineering-title"
                lines={["Strategy meets", "intelligent execution."]}
                accent={1}
                className="type-headline text-ink lg:mt-6"
              />
              <Reveal as="p" delay={200} className="type-lede mt-7 max-w-[32rem] text-mist">
                Business Strategy. AI Engineering. Market Growth. Three interconnected disciplines designed to create meaningful progress.
              </Reveal>
              <Reveal delay={320} className="mt-8">
                <PillarList compact />
              </Reveal>
            </div>
          </Scene>

          {/* SCENE 04 — GROWTH */}
          <Scene id="growth" index="04" name="Growth">
            <div className={mobilePanel}>
              <SplitLines
                id="growth-title"
                lines={["Built to move", "business forward."]}
                accent={1}
                className="type-headline text-ink lg:mt-6"
              />
              <Reveal as="p" delay={200} className="type-lede mt-7 max-w-[32rem] text-mist">
                From stronger digital infrastructure to new market opportunities, we engineer the conditions for sustainable growth.
              </Reveal>
              <Reveal delay={320} className="mt-10">
                <p className="type-label text-haze" id="outcomes-label">
                  Where progress shows up
                </p>
                <ul aria-labelledby="outcomes-label" className="mt-4 grid grid-cols-1 border-t border-line sm:grid-cols-2">
                  {OUTCOMES.map((o, i) => (
                    <li key={o} className="flex items-baseline gap-4 border-b border-line py-4 sm:odd:pr-6">
                      <span aria-hidden className="type-label text-jade/80">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.0625rem] text-ink">{o}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Scene>

          {/* SCENE 05 — PRIVATE ENGAGEMENT */}
          <Scene id="begin" index="05" name="Private Engagement" height="lg:min-h-[150vh]">
            <div className={mobilePanel}>
              <SplitLines
                id="begin-title"
                lines={["Your next", "opportunity", "starts here."]}
                accent={2}
                className="type-headline text-ink lg:mt-6"
              />
              <Reveal as="p" delay={200} className="type-lede mt-7 max-w-[30rem] text-mist">
                A private, considered approach to business strategy, intelligent engineering, and market growth.
              </Reveal>
              <Reveal delay={320} className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <Link href="/engagement" className="btn btn-primary justify-center">
                  {CTA_INTRO}
                  <span aria-hidden className="btn-arrow">→</span>
                </Link>
                <a href={SITE.portalUrl} className="link-quiet text-sm underline-offset-4 hover:underline" rel="noopener">
                  Existing client? Sign in to the portal
                </a>
              </Reveal>
            </div>
          </Scene>
        </div>
      </main>
    </>
  );
}
