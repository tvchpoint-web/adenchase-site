import type { Metadata } from "next";
import { AngledPhoto } from "@/components/brand/AngledPhoto";
import { DisciplineLabel } from "@/components/home/Sections";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/editorial/SplitLines";
import { BLOCK_COLOURS } from "@/lib/blocks";
import { DISCIPLINES } from "@/lib/site";
import { PHOTO } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Expertise",
  description: "Business Development, AI Engineering and Market Growth — three interconnected disciplines and how they are applied in practice.",
};

const PHOTOS = [
  { photo: PHOTO.expertiseStrategy, position: "center" },
  { photo: PHOTO.expertiseEngineering, position: "center" },
  { photo: PHOTO.expertiseGrowth, position: "center" },
] as const;

export default function ExpertisePage() {
  return (
    <main id="main">
      <PageHero
        label="Expertise"
        lines={["Three disciplines.", "One connected", "system."]}
        accent={2}
        photo={PHOTO.expertiseHero}
        block={1}
        lede="Business development sets direction. AI engineering builds the systems that deliver it. Market growth turns both into commercial momentum. Each is stronger because of the others."
      />

      {DISCIPLINES.map((d, i) => {
        const block = d.region;
        const flip = i % 2 === 1;
        return (
          <section key={d.id} id={d.id} aria-labelledby={`${d.id}-title`} className={`scroll-mt-20 border-t border-line ${flip ? "bg-navy-deep/60" : ""}`}>
            <div className="mx-auto grid max-w-[96rem] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-28">
              <div className={`lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}>
                <AngledPhoto photo={PHOTOS[i].photo} block={block} position={PHOTOS[i].position} className="h-[56vw] max-h-[34rem] min-h-[14rem]" />
              </div>
              <div className={`lg:col-span-5 ${flip ? "lg:order-1" : "lg:col-start-8"}`}>
                <DisciplineLabel block={block} label={`${d.index} · ${d.title}`} trail={false} />
                <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
                  <span id={`${d.id}-title`}>{d.line}</span>
                </Reveal>
                <Reveal as="p" delay={140} className="mt-5 text-[1.05rem] leading-relaxed text-mist">
                  {d.description}
                </Reveal>
                <div className="mt-9 grid gap-9 sm:grid-cols-2">
                  <Reveal delay={200}>
                    <h3 className="type-label text-haze">Practical applications</h3>
                    <ul className="mt-4 space-y-3 text-[0.95rem] text-ink/90">
                      {d.applications.map((a) => (
                        <li key={a} className="flex gap-3">
                          <span aria-hidden className="mt-[0.55em] h-1.5 w-2.5 shrink-0 -skew-x-[34deg]" style={{ background: BLOCK_COLOURS[block] }} />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  <Reveal delay={260}>
                    <h3 className="type-label text-haze">Questions we help answer</h3>
                    <ul className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-mist">
                      {d.questions.map((q) => (
                        <li key={q} className="border-l-2 pl-3" style={{ borderColor: BLOCK_COLOURS[block] }}>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
        );
      })}
      <CtaBand title="Bring the right discipline to the right opportunity." />
    </main>
  );
}
