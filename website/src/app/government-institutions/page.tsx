import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { CapabilityGrid } from "@/components/site/CapabilityGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { TextSection } from "@/components/site/TextSection";
import { Reveal } from "@/components/editorial/SplitLines";
import { BrandBlock } from "@/components/brand/AngledPhoto";
import { BLOCK_TEXT } from "@/lib/blocks";
import { DISCIPLINES, INSTITUTIONAL_CAPABILITIES } from "@/lib/site";
import { PHOTO } from "@/lib/photos";

const TITLE = "Government & Institutions";
const DESCRIPTION = "Tailored solutions for institutional modernization, intelligent systems, service improvement, and collaborative public-sector initiatives.";

export const metadata: Metadata = pageMeta(TITLE, DESCRIPTION);

/**
 * Government & Institutions: an application of the three disciplines (not a fourth discipline).
 * Copy rules: no claimed clients, contracts, endorsements, funding, procurement outcomes, licences
 * or certifications; no disclosure of internal opportunity, research or procurement workflows.
 */
export default function GovernmentInstitutionsPage() {
  return (
    <main id="main">
      <PageHero
        label={TITLE}
        lines={["Complex Challenges.", "Engineered Solutions."]}
        accent={1}
        photo={PHOTO.governmentHero}
        block={0}
        lede="Public institutions operate in environments where service demands, resource constraints, legacy processes, and evolving expectations create complex challenges. Addressing them requires practical thinking, coordinated expertise, and solutions designed around real institutional needs."
      />

      <section aria-labelledby="inst-cap-title" className="relative border-t border-line bg-navy/40">
        <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
                <span aria-hidden className="h-px w-8 bg-jade" />
                Institutional capabilities
              </Reveal>
              <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
                <span id="inst-cap-title">Modern Challenges Require Connected Thinking.</span>
              </Reveal>
            </div>
            <div className="space-y-5 text-[1.0625rem] leading-relaxed text-mist lg:col-span-6 lg:col-start-7">
              <Reveal as="p">
                ADEN-CHASE brings strategic perspective, intelligent technology, and collaborative problem-solving together to explore opportunities for modernization, improved service delivery, and long-term institutional value.
              </Reveal>
              <Reveal as="p" delay={70}>
                Our approach is tailored to the challenge—not restricted to a predefined product or technology.
              </Reveal>
              <Reveal delay={140} className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                {DISCIPLINES.map((d) => (
                  <span key={d.id} className="flex items-center gap-2.5">
                    <BrandBlock block={d.region} className="h-3 w-auto" />
                    <span className="type-label text-[10px]" style={{ color: BLOCK_TEXT[d.region] }}>
                      {d.title}
                    </span>
                  </span>
                ))}
              </Reveal>
            </div>
          </div>
          <div className="mt-14">
            <CapabilityGrid items={INSTITUTIONAL_CAPABILITIES} block={0} />
          </div>
        </div>
      </section>

      <TextSection
        id="delivery-title"
        label="Collaborative delivery"
        title="More Ways to Move Important Solutions Forward."
        paragraphs={[
          "Meaningful institutional progress does not always follow a single implementation or funding model.",
          "Depending on the challenge, ADEN-CHASE can help explore delivery approaches involving strategic partners, private-sector participation, technology collaborators, and complementary funding opportunities.",
          "These possibilities must be assessed against the institution’s objectives, applicable procurement and governance requirements, stakeholder responsibilities, and long-term sustainability.",
        ]}
        statement="The goal is to develop approaches that are practical, responsible, and aligned with public value."
      />

      <TextSection
        id="inst-approach-title"
        label="Our approach"
        title="Built Around the Challenge. Not a Predefined Product."
        paragraphs={[
          "We believe effective modernization begins with understanding the problem. Before recommending a platform, process, or technology, we examine the underlying challenge, the operational environment, and the outcomes that matter.",
          "The appropriate solution may involve improving an existing system, connecting disconnected processes, developing a new digital capability, or coordinating a broader collaborative initiative.",
        ]}
        statement="Our role is to help turn complex needs into structured opportunities for meaningful improvement."
        tint
      />

      <TextSection
        id="inst-engagement-title"
        label="Institutional engagement"
        title="From Institutional Need to Practical Opportunity."
        paragraphs={[
          "We welcome conversations with institutions and authorized stakeholders exploring service modernization, intelligent systems, operational improvement, and tailored solutions to persistent challenges.",
          "Each engagement is considered in relation to the institution’s objectives, applicable requirements, and the potential for meaningful public value. All public-sector work respects applicable procurement, ethics, data-protection, and governance requirements.",
        ]}
      />

      <CtaBand title="Discuss an institutional challenge." cta="Discuss an Institutional Challenge" href={`/contact?interest=${encodeURIComponent(TITLE)}#inquiry`} />
    </main>
  );
}
