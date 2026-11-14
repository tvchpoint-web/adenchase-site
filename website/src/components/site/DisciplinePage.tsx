import { CapabilityGrid } from "@/components/site/CapabilityGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/editorial/SplitLines";
import { DisciplineLabel } from "@/components/home/Sections";
import type { Discipline } from "@/lib/site";

/**
 * A discipline page: editorial hero, the rest of the introduction, the capabilities grid, any
 * discipline-specific sections (children), and the closing call to action.
 */
export function DisciplinePage({ d, photo, children }: { d: Discipline; photo: string; children?: React.ReactNode }) {
  const [lede, ...rest] = d.pageIntro;
  return (
    <main id="main">
      <PageHero label={d.title} lines={d.pageLines} accent={d.pageLines.length - 1} photo={photo} block={d.region} lede={lede} />

      <section aria-labelledby="capabilities-title" className="relative border-t border-line bg-navy/40">
        <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <DisciplineLabel block={d.region} label={`${d.index} · ${d.title}`} trail={false} />
              <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
                <span id="capabilities-title">Our Capabilities</span>
              </Reveal>
            </div>
            <div className="space-y-5 text-[1.0625rem] leading-relaxed text-mist lg:col-span-6 lg:col-start-7">
              {rest.map((p, i) => (
                <Reveal as="p" key={i} delay={i * 70}>
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
          <div className="mt-14">
            <CapabilityGrid items={d.capabilities} block={d.region} />
          </div>
        </div>
      </section>

      {children}

      <CtaBand title={d.closing.title} copy={d.closing.copy} cta={d.closing.cta} href={`/contact?interest=${encodeURIComponent(d.title)}#inquiry`} />
    </main>
  );
}
