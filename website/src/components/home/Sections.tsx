import Link from "next/link";
import { AngledPhoto, BrandBlock } from "@/components/brand/AngledPhoto";
import { Icon, type IconName } from "@/components/brand/Icons";
import { Reveal } from "@/components/editorial/SplitLines";
import { AiDemos } from "@/components/home/AiDemos";
import { CapabilityPath, type PathItem } from "@/components/home/CapabilityPath";
import { EngagementPath } from "@/components/home/EngagementPath";
import { Outcomes } from "@/components/home/Outcomes";
import { StrategyQuestions } from "@/components/home/StrategyQuestions";
import { BLOCK_TEXT } from "@/lib/blocks";
import { PHOTO } from "@/lib/photos";
import { CAPABILITIES, DISCIPLINES, FRAMEWORK } from "@/lib/site";

const wrap = "relative z-10 mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12";

/** Section opener for the three disciplines: one solid block from the mark, then the label. The jade trail passes through it. */
export function DisciplineLabel({ block, label, trail = true }: { block: 0 | 1 | 2; label: string; trail?: boolean }) {
  return (
    <Reveal className="flex items-center gap-3.5" {...(trail ? { "data-trail-anchor": "" } : {})}>
      <BrandBlock block={block} className="h-3.5 w-auto" />
      <span className="type-label" style={{ color: BLOCK_TEXT[block] }}>
        {label}
      </span>
    </Reveal>
  );
}

const STRATEGY_ITEMS: PathItem[] = [
  { title: "Growth strategy and opportunity assessment", line: "Where growth can come from, and what it would take.", icon: "assessment" },
  { title: "Competitive and market positioning", line: "Clarity on where to compete — and how.", icon: "compete" },
  { title: "Strategic partnership development", line: "Alliances that open markets and capabilities.", icon: "partnership" },
  { title: "Prioritised roadmaps that connect direction to execution", line: "Sequenced steps the team can act on.", icon: "roadmap" },
  { title: "Decision support for leadership teams", line: "Evidence and options when decisions matter.", icon: "decision" },
];

const AI_ITEMS: PathItem[] = [
  { title: "AI workflow engineering and intelligent assistants", line: "AI designed into specific workflows, people in the loop.", icon: "assistant" },
  { title: "Business process automation", line: "Repetitive manual work, removed.", icon: "automation" },
  { title: "Integration of disconnected systems and data", line: "Tools and data that work together.", icon: "integration" },
  { title: "Digital visibility for AI-driven search and discovery", line: "Accurately represented in AI-generated answers.", icon: "visibility" },
  { title: "Responsible adoption", line: "Evaluation, guardrails and team enablement.", icon: "guardrail" },
];

const GROWTH_ITEMS: PathItem[] = [
  { title: "Digital visibility and positioning", line: "Found, and chosen, where buyers look.", icon: "visibility" },
  { title: "Customer experience strategy", line: "Redesigning the moments that shape trust.", icon: "customer" },
  { title: "Revenue opportunity development", line: "New revenue from existing strengths.", icon: "revenue" },
  { title: "Go-to-market sequencing and measurement", line: "The right order of moves, measured as they land.", icon: "sequence" },
  { title: "International and new-market entry planning", line: "Considered entry: partners, sequencing, risk.", icon: "globe" },
];

const CAPABILITY_ICON: Record<string, IconName> = {
  "Business Growth Strategy": "assessment",
  "Digital Transformation": "integration",
  "AI Workflow Engineering": "assistant",
  "Business Process Automation": "automation",
  "Digital Visibility and AI Discovery": "visibility",
  "Customer Experience Strategy": "customer",
  "Strategic Partnerships": "partnership",
  "International Market Entry": "globe",
  "Revenue Opportunity Development": "revenue",
};

/* --------------------------------------------------------- 01 · in practice */
export function StrategyInPractice() {
  const d = DISCIPLINES[0];
  return (
    <section id="business-strategy" aria-labelledby="strategy-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} grid gap-14 py-24 lg:grid-cols-12 lg:py-32`}>
        <div className="lg:col-span-5">
          <DisciplineLabel block={0} label="01 · Business Strategy — in practice" />
          <Reveal as="h2" delay={80} className="type-title mt-6 text-ink">
            <span id="strategy-title">{d.line}</span>
          </Reveal>
          <Reveal as="p" delay={140} className="type-lede mt-6 text-mist">
            Strategy is where every engagement begins — the foundation the engineering and growth work is built on.
          </Reveal>
          <Reveal as="h3" delay={180} className="type-label mt-12 text-haze">
            A strategic decision framework
          </Reveal>
          <div className="mt-5">
            <StrategyQuestions />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <AngledPhoto photo={PHOTO.strategyPractice} block={0} className="h-[46vw] max-h-[28rem] min-h-[15rem]" />
          <Reveal as="h3" className="type-label mt-12 text-haze">
            What strategy work delivers
          </Reveal>
          <div className="mt-5">
            <CapabilityPath items={STRATEGY_ITEMS} block={0} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 02 · AI Engineering */
export function AiEngineering() {
  const d = DISCIPLINES[1];
  return (
    <section id="ai-engineering" aria-labelledby="ai-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <DisciplineLabel block={1} label="02 · AI Engineering" />
            <Reveal as="h2" delay={80} className="type-headline mt-6 text-ink">
              <span id="ai-title">
                Engineer intelligent systems that improve how businesses <span style={{ color: BLOCK_TEXT[1] }}>operate and grow.</span>
              </span>
            </Reveal>
          </div>
          <Reveal as="p" delay={140} className="type-lede self-end text-mist lg:col-span-5 lg:col-start-8">
            {d.description}
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <AngledPhoto photo={PHOTO.aiMain} block={1} className="h-[52vw] max-h-[30rem] min-h-[15rem]" position="center 40%" />
          </div>
          <div className="lg:col-span-4 lg:pt-24">
            <AngledPhoto photo={PHOTO.aiDetail} block={1} className="h-[44vw] max-h-[20rem] min-h-[12rem]" />
          </div>
        </div>

        <Reveal as="h3" className="type-label mt-16 text-haze">
          What this looks like in practice
        </Reveal>
        <div className="mt-5">
          <AiDemos />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="h3" className="type-title text-ink">
              Practical technology, measured by how the business runs.
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <CapabilityPath items={AI_ITEMS} block={1} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 03 · Market Growth */
export function MarketGrowth() {
  const d = DISCIPLINES[2];
  return (
    <section id="market-growth" aria-labelledby="growth-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <AngledPhoto photo={PHOTO.growthMain} block={2} className="h-[50vw] max-h-[32rem] min-h-[15rem]" />
            <div className="relative -mt-14 w-[56%] sm:-mt-20 sm:w-[42%] lg:-mt-28 lg:ml-[8%] lg:w-[44%]">
              <AngledPhoto photo={PHOTO.growthDetail} block={2} className="h-[28vw] max-h-[15rem] min-h-[8rem]" />
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
            <DisciplineLabel block={2} label="03 · Market Growth" />
            <Reveal as="h2" delay={80} className="type-headline mt-6 text-ink">
              <span id="growth-title">
                Turn direction into <span style={{ color: BLOCK_TEXT[2] }}>commercial momentum.</span>
              </span>
            </Reveal>
            <Reveal as="p" delay={140} className="type-lede mt-6 text-mist">
              {d.description}
            </Reveal>
            <div className="mt-10">
              <CapabilityPath items={GROWTH_ITEMS} block={2} variant="ascent" />
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="type-label text-haze">
              Where progress shows up
            </Reveal>
            <Reveal as="h3" delay={60} className="type-title mt-4 text-ink">
              Six outcomes. One connected system.
            </Reveal>
            <Reveal as="p" delay={120} className="mt-5 text-[1.02rem] leading-relaxed text-mist">
              The measures that matter are agreed before work begins — then reported against honestly, including what is not yet working.
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <Outcomes />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ Capabilities & business value */
export function CapabilitiesValue() {
  return (
    <section id="capabilities" aria-labelledby="cap-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze" data-trail-anchor="">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Selected capabilities
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
              <span id="cap-title">Three disciplines. One connected system.</span>
            </Reveal>
          </div>
          <Reveal as="p" delay={140} className="type-lede self-end text-mist lg:col-span-5 lg:col-start-8">
            Every engagement is scoped around the opportunity in front of you — never assembled from a package.
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {DISCIPLINES.map((d) => (
            <Reveal key={d.id} delay={d.region * 110} className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(170deg,rgba(10,30,82,0.7),rgba(0,10,40,0.85))] p-7 transition-[border-color,transform] duration-300 ease-brand hover:-translate-y-1 hover:border-white/[0.14] sm:p-9">
              <span aria-hidden className="pointer-events-none absolute -right-2 -top-6 select-none text-[7.5rem] font-semibold leading-none tracking-[-0.06em] text-white/[0.035]">
                {d.index}
              </span>
              <div className="relative flex items-center gap-3">
                <BrandBlock block={d.region} className="h-5 w-auto" />
                <span className="type-label" style={{ color: BLOCK_TEXT[d.region] }}>
                  {d.title}
                </span>
              </div>
              <p className="relative mt-4 text-[0.95rem] leading-relaxed text-mist">{d.line}</p>
              <ul className="relative mt-7 space-y-5 border-t border-white/[0.07] pt-6">
                {CAPABILITIES.filter((c) => c.discipline === d.id).map((c) => (
                  <li key={c.title} className="flex gap-3.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-navy-deep" style={{ color: BLOCK_TEXT[d.region] }}>
                      <Icon name={CAPABILITY_ICON[c.title] ?? "assessment"} className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[1.02rem] font-semibold text-ink">{c.title}</span>
                      <span className="mt-1 block text-[0.88rem] leading-relaxed text-mist">{c.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="type-label text-haze">
              How value is created
            </Reveal>
            <Reveal as="p" delay={80} className="type-title mt-5 text-ink">
              Identify. Engineer. <span className="text-jade">Accelerate.</span>
            </Reveal>
            <Reveal delay={140} className="mt-6">
              <Link href="/approach" className="link-quiet text-[0.95rem] underline decoration-line underline-offset-4 hover:decoration-jade">
                Read our approach
              </Link>
            </Reveal>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {FRAMEWORK.map((s, i) => (
              <Reveal as="li" key={s.word} delay={i * 100} className="border-t border-white/[0.08] pt-5">
                <BrandBlock block={i as 0 | 1 | 2} className="h-3 w-auto" />
                <p className="mt-4 text-[1.1rem] font-semibold text-ink">{s.title}</p>
                <p className="mt-2 text-[0.93rem] leading-relaxed text-mist">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Private Engagement */
export function PrivateEngagement() {
  return (
    <section id="engagement" aria-labelledby="eng-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze" data-trail-anchor="">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Private Engagement
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
              <span id="eng-title">Considered from the first conversation.</span>
            </Reveal>
            <Reveal as="p" delay={140} className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-mist">
              We work with a small number of clients at a time so each engagement receives senior attention. There are no packages or public price lists — every engagement moves through the same considered path, from opportunity to growth.
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <AngledPhoto photo={PHOTO.engagement} block={0} className="h-[40vw] max-h-[20rem] min-h-[12rem]" />
          </div>
        </div>
        <div className="mt-16 lg:mt-20">
          <EngagementPath />
        </div>
      </div>
    </section>
  );
}
