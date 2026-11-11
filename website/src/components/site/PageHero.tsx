import { AngledPhoto } from "@/components/brand/AngledPhoto";
import { Reveal, SplitLines } from "@/components/editorial/SplitLines";

/**
 * Sub-page opening: an editorial headline beside a photograph framed in the mark's
 * angled-block geometry — the same system as the homepage.
 */
export function PageHero({
  label,
  lines,
  accent,
  lede,
  photo,
  block = 0,
  position,
  children,
}: {
  label: string;
  lines: string[];
  accent?: number;
  lede: string;
  photo: string;
  /** The discipline block that frames the photograph: 0 green, 1 cyan, 2 blue. */
  block?: 0 | 1 | 2;
  position?: string;
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" data-reveal-immediate="" className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-[96rem] items-center gap-12 px-5 pb-16 pt-32 sm:px-8 lg:min-h-[86svh] lg:grid-cols-12 lg:px-12 lg:pb-12 lg:pt-28">
        <div className="order-2 lg:order-2 lg:col-span-6 lg:col-start-7">
          <AngledPhoto photo={photo} block={block} position={position} className="h-[58vw] max-h-[36rem] min-h-[14rem] lg:h-[62svh]" />
        </div>
        <div className="order-1 max-w-2xl lg:order-1 lg:col-span-6">
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
