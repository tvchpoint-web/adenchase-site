import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { TextSection } from "@/components/site/TextSection";
import { Reveal } from "@/components/editorial/SplitLines";
import { OPERATING_PHILOSOPHY, PRINCIPLES, SITE } from "@/lib/site";
import { PHOTO } from "@/lib/photos";

const DESCRIPTION = "Discover the ADEN-CHASE approach to opportunity identification, intelligent engineering, strategic partnerships, and measurable growth.";

export const metadata: Metadata = pageMeta("About ADEN-CHASE Strategies | Our Philosophy", DESCRIPTION, { absolute: true });

export default function AboutPage() {
  return (
    <main id="main">
      <PageHero
        label="About ADEN-CHASE"
        lines={["A Different", "Perspective on", "What's Possible."]}
        accent={2}
        photo={PHOTO.aboutHero}
        block={0}
        lede="ADEN-CHASE Strategies was built around a belief that meaningful growth often begins where conventional thinking ends."
      />

      <TextSection
        id="belief-title"
        label="Our philosophy"
        title={SITE.philosophy}
        paragraphs={[
          "Opportunities are not always clearly defined. Sometimes they exist between disconnected systems, overlooked markets, underutilized capabilities, and relationships that have yet to be developed.",
          "Recognizing those possibilities—and determining how to turn them into value—is central to our approach. We bring business development, AI engineering, and market growth together to create solutions that extend beyond traditional consulting boundaries.",
        ]}
        tint
      >
        <Reveal as="ol" delay={200} className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {OPERATING_PHILOSOPHY.map((s, i) => (
            <li key={s} className="bg-navy-deep px-5 py-4">
              <span className="type-label text-[10px] text-jade">0{i + 1}</span>
              <span className="mt-1 block font-medium text-ink">{s}</span>
            </li>
          ))}
        </Reveal>
      </TextSection>

      <TextSection
        id="perspective-title"
        label="Our perspective"
        title="We Look Beyond the Immediate Request."
        paragraphs={[
          "A business may ask for a website when the larger opportunity is a stronger digital customer experience.",
          "An organization may seek automation when the underlying opportunity is a more effective operating model.",
          "An institution may identify a service challenge that could benefit from a new platform, a better process, or a collaborative solution.",
        ]}
        statement="Our role is to understand the broader picture and identify the approach most likely to create meaningful value."
      />

      <section aria-labelledby="principles-title" className="relative border-t border-line bg-navy/40">
        <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
            <span aria-hidden className="h-px w-8 bg-jade" />
            What guides our work
          </Reveal>
          <Reveal as="h2" delay={80} className="type-title mt-5 max-w-3xl text-ink">
            <span id="principles-title">{SITE.belief}</span>
          </Reveal>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2 xl:grid-cols-5">
            {PRINCIPLES.map((p, i) => (
              <li key={p} className="bg-navy-deep">
                <Reveal delay={(i % 5) * 70} className="h-full p-6 sm:p-7">
                  <span aria-hidden className="block h-1.5 w-3 -skew-x-[34deg] bg-jade" />
                  <p className="mt-5 text-[1.05rem] font-medium leading-snug text-ink">{p}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TextSection
        id="commitment-title"
        label="Our commitment"
        title="Strategy With Purpose. Execution With Intent."
        paragraphs={[
          "We believe strong ideas deserve disciplined evaluation. We favor practical solutions, responsible implementation, and long-term thinking.",
          "Every recommendation should have a clear reason for existing and a meaningful outcome worth pursuing.",
        ]}
      />

      <CtaBand title={SITE.closing} />
    </main>
  );
}
