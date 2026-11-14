import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { DisciplinePage } from "@/components/site/DisciplinePage";
import { TextSection } from "@/components/site/TextSection";
import { AiDemos } from "@/components/home/AiDemos";
import { Reveal } from "@/components/editorial/SplitLines";
import { DISCIPLINES } from "@/lib/site";
import { PHOTO } from "@/lib/photos";

const d = DISCIPLINES[1];

export const metadata: Metadata = pageMeta(d.title, d.metaDescription);

export default function AiEngineeringPage() {
  return (
    <DisciplinePage d={d} photo={PHOTO.aiEngineeringHero}>
      <section aria-labelledby="practice-title" className="relative border-t border-line">
        <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <Reveal as="h2" className="type-label text-haze">
            <span id="practice-title">What this looks like in practice</span>
          </Reveal>
          <div className="mt-6">
            <AiDemos />
          </div>
        </div>
      </section>
      <TextSection
        id="philosophy-title"
        label="Our engineering philosophy"
        title="Integrate Intelligently. Improve Continuously."
        paragraphs={[
          "Not every organization needs a new platform. Often, the greatest value comes from connecting existing systems, removing unnecessary steps, and introducing intelligence exactly where it makes a difference.",
          "We prioritize practical integration, operational continuity, appropriate safeguards, and measurable improvements.",
        ]}
        statement="The right technology should adapt to the business—not force the business to adapt to it."
        tint
      />
    </DisciplinePage>
  );
}
