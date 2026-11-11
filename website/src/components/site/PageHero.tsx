import { NexusStage } from "@/components/nexus/NexusStage";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";

/**
 * Sub-page opening: the same Nexus, held in the configuration that matches the
 * page's subject, beside an editorial headline.
 */
export function PageHero({
  label,
  lines,
  accent,
  lede,
  story,
  distance = 1,
  children,
}: {
  label: string;
  lines: string[];
  accent?: number;
  lede: string;
  story: number;
  /** Camera distance multiplier for the contained stage. */
  distance?: number;
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" data-reveal-immediate="" className="relative overflow-hidden">
      <div className="stage-fade-x absolute inset-y-0 right-0 w-full max-lg:h-[62%] lg:w-[62%]">
        <NexusStage variant="contained" story={story} distance={distance} />
      </div>
      <div className="relative mx-auto flex min-h-[88svh] max-w-[96rem] items-end px-5 pb-16 pt-36 sm:px-8 lg:min-h-[86svh] lg:items-center lg:px-12 lg:pb-12">
        <div className="max-w-2xl lg:w-[48%]">
          <Reveal as="p" delay={150} className="type-label flex items-center gap-3 text-haze">
            <span aria-hidden className="h-px w-8 bg-jade" />
            {label}
          </Reveal>
          <SplitLines as="h1" id="page-title" delay={260} lines={lines} accent={accent} className="type-headline mt-7 text-ink" />
          <Reveal as="p" delay={620} className="type-lede mt-8 max-w-[33rem] text-mist">
            {lede}
          </Reveal>
          {children && (
            <Reveal delay={780} className="mt-10">
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

export function SectionIntro({ label, title, children, id }: { label: string; title: string; children?: React.ReactNode; id?: string }) {
  return (
    <div className="max-w-3xl">
      <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
        <span aria-hidden className="h-px w-8 bg-line" />
        {label}
      </Reveal>
      <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
        <span id={id}>{title}</span>
      </Reveal>
      {children && (
        <Reveal as="div" delay={160} className="type-lede mt-6 max-w-2xl text-mist">
          {children}
        </Reveal>
      )}
    </div>
  );
}
