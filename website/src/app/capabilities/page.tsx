import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/editorial/SplitLines";
import { BlockIndex } from "@/components/brand/AngledPhoto";
import { CAPABILITIES, DISCIPLINES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Selected Capabilities",
  description: "Selected capabilities across business strategy, AI engineering and market growth.",
};

const discipline = Object.fromEntries(DISCIPLINES.map((d) => [d.id, d]));

export default function CapabilitiesPage() {
  return (
    <main id="main">
      <PageHero
        label="Selected Capabilities"
        lines={["Built for the", "opportunity", "in front of you."]}
        accent={1}
        photo="analytics"
        block={2}
        lede="The capabilities below describe the work we are equipped to do. Every engagement is scoped around the specific opportunity — never assembled from a package."
      />
      <section aria-label="Capabilities" className="relative bg-navy/40">
        <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
            {CAPABILITIES.map((c, i) => (
              <li key={c.title} className="bg-navy-deep">
                <Reveal delay={(i % 3) * 90} className="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-sapphire/10 sm:p-8 lg:p-10">
                  <div className="flex items-center justify-between">
                    <span className="type-label text-jade">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex items-center gap-2.5">
                      <BlockIndex active={discipline[c.discipline].region} className="h-3 w-auto" />
                      <span className="type-label text-haze">{discipline[c.discipline].title}</span>
                    </span>
                  </div>
                  <h2 className="mt-8 text-[1.5rem] font-medium leading-tight tracking-[-0.02em] text-ink">{c.title}</h2>
                  <p className="mt-4 leading-relaxed text-mist">{c.description}</p>
                  <span aria-hidden className="mt-8 block h-px w-6 bg-line transition-all duration-500 ease-brand group-hover:w-16 group-hover:bg-jade" />
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <CtaBand title="Discuss the capability your opportunity calls for." />
    </main>
  );
}
