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
import { AUDIENCES, DISCIPLINES, SITE } from "@/lib/site";

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
  { title: "Strategic business development", line: "Commercial expansion and stronger positioning.", icon: "assessment" },
  { title: "Revenue opportunity development", line: "New products, services, channels and models.", icon: "revenue" },
  { title: "Strategic partnerships", line: "Relationships that create mutual value.", icon: "partnership" },
  { title: "Market intelligence", line: "Markets, competitors, customers and emerging openings.", icon: "compete" },
  { title: "Commercial concept development", line: "Promising ideas turned into structured propositions.", icon: "roadmap" },
];

const AI_ITEMS: PathItem[] = [
  { title: "AI strategy & implementation", line: "Practical use cases, implemented appropriately.", icon: "decision" },
  { title: "Intelligent workflow automation", line: "Fewer repetitive tasks, better coordination.", icon: "automation" },
  { title: "AI assistants & customer interfaces", line: "Information and services, easier to reach.", icon: "assistant" },
  { title: "Systems integration", line: "Tools and information sources that work together.", icon: "integration" },
  { title: "AI discovery & visibility", line: "Accurately represented in AI-assisted experiences.", icon: "visibility" },
];

const GROWTH_ITEMS: PathItem[] = [
  { title: "Market positioning", line: "Clearer differentiation, stronger relevance.", icon: "position" },
  { title: "Digital experience strategy", line: "Platforms and journeys that serve the business.", icon: "customer" },
  { title: "AI search & discovery visibility", line: "Found and understood where people look.", icon: "visibility" },
  { title: "Partnership-led growth", line: "Collaboration that expands reach.", icon: "partnership" },
  { title: "Market expansion", line: "New segments, geographies and routes to market.", icon: "globe" },
];

const AUDIENCE_ICON: IconName[] = ["revenue", "decision", "visibility", "globe", "integration"];

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Reveal className="mt-8">
      <Link href={href} className="link-quiet inline-flex items-center gap-2 text-[0.95rem] underline decoration-line underline-offset-4 hover:decoration-jade">
        {children} <span aria-hidden>→</span>
      </Link>
    </Reveal>
  );
}

/* ----------------------------------------------------------- Introduction */
export function Introduction() {
  return (
    <section id="introduction" aria-labelledby="intro-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze" data-trail-anchor="">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Our perspective
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
              <span id="intro-title">The Greatest Opportunities Aren&rsquo;t Always Obvious.</span>
            </Reveal>
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-mist lg:col-span-6 lg:col-start-7">
            <Reveal as="p">
              Every organization has potential that has yet to be fully realized. It may exist within an overlooked market, an inefficient process, an underdeveloped customer relationship, a disconnected system, or a partnership that has never been explored.
            </Reveal>
            <Reveal as="p" delay={70}>
              Recognizing those possibilities requires more than conventional thinking. ADEN-CHASE combines business intelligence, strategic perspective, and intelligent engineering to identify where value can be created—and develop practical ways to capture it.
            </Reveal>
            <Reveal as="p" delay={140} className="border-l-2 border-jade pl-4 text-[1.15rem] font-medium leading-snug text-ink">
              We don&rsquo;t believe growth begins with a predefined solution. It begins with seeing the opportunity.
            </Reveal>
          </div>
        </div>

        <div className="mt-24 grid gap-10 border-t border-white/[0.07] pt-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="h2" className="type-headline text-ink">
              <span id="disciplines-title">
                Three Disciplines. <span className="block text-jade">One Strategic Advantage.</span>
              </span>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <Reveal as="p" delay={80} className="type-lede text-mist">
              Commercial opportunity, intelligent technology, and market growth are deeply connected. We bring these disciplines together to develop solutions that work beyond traditional service boundaries.
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 01 · Business Development */
export function StrategyInPractice() {
  const d = DISCIPLINES[0];
  return (
    <section id="business-development" aria-labelledby="strategy-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} grid gap-14 py-24 lg:grid-cols-12 lg:py-32`}>
        <div className="lg:col-span-5">
          <DisciplineLabel block={0} label="01 · Business Development" />
          <Reveal as="h2" delay={80} className="type-title mt-6 text-ink">
            <span id="strategy-title">{d.headline}</span>
          </Reveal>
          {d.copy.map((p, i) => (
            <Reveal as="p" key={i} delay={140 + i * 60} className={`${i ? "mt-4 text-[1.02rem] leading-relaxed" : "type-lede mt-6"} text-mist`}>
              {p}
            </Reveal>
          ))}
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
            What business development delivers
          </Reveal>
          <div className="mt-5">
            <CapabilityPath items={STRATEGY_ITEMS} block={0} />
          </div>
          <SectionLink href={d.href}>Explore Business Development</SectionLink>
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
                Engineer the <span style={{ color: BLOCK_TEXT[1] }}>Advantage.</span>
              </span>
            </Reveal>
          </div>
          <div className="space-y-4 self-end lg:col-span-5 lg:col-start-8">
            {d.copy.map((p, i) => (
              <Reveal as="p" key={i} delay={140 + i * 60} className={i ? "text-[1.02rem] leading-relaxed text-mist" : "type-lede text-mist"}>
                {p}
              </Reveal>
            ))}
          </div>
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
              The right technology adapts to the business.
            </Reveal>
            <SectionLink href={d.href}>Explore AI Engineering</SectionLink>
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
                Expand <span style={{ color: BLOCK_TEXT[2] }}>What&rsquo;s Possible.</span>
              </span>
            </Reveal>
            {d.copy.map((p, i) => (
              <Reveal as="p" key={i} delay={140 + i * 60} className={`${i ? "mt-4 text-[1.02rem] leading-relaxed" : "type-lede mt-6"} text-mist`}>
                {p}
              </Reveal>
            ))}
            <div className="mt-10">
              <CapabilityPath items={GROWTH_ITEMS} block={2} variant="ascent" />
            </div>
            <SectionLink href={d.href}>Explore Market Growth</SectionLink>
          </div>
        </div>

        <div className="mt-24 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="type-label text-haze">
              Where progress shows up
            </Reveal>
            <Reveal as="h3" delay={60} className="type-title mt-4 text-ink">
              Different disciplines. Connected thinking. Measurable progress.
            </Reveal>
            <Reveal as="p" delay={120} className="mt-5 text-[1.02rem] leading-relaxed text-mist">
              The measures that matter are agreed before work begins—then reported against honestly, including what is not yet working.
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

/* -------------------------------------------------------------- Differentiation */
export function Differentiation() {
  return (
    <section id="differentiation" aria-labelledby="diff-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze" data-trail-anchor="">
              <span aria-hidden className="h-px w-8 bg-jade" />
              How we think
            </Reveal>
            <Reveal as="h2" delay={80} className="type-headline mt-6 text-ink">
              <span id="diff-title">
                We Don&rsquo;t Start With a Solution. <span className="block text-jade">We Start With the Opportunity.</span>
              </span>
            </Reveal>
          </div>
          <div className="space-y-5 self-end text-[1.0625rem] leading-relaxed text-mist lg:col-span-5 lg:col-start-8">
            <Reveal as="p">Traditional approaches often begin with a predefined service. We begin by understanding what an organization is capable of becoming.</Reveal>
            <Reveal as="p" delay={70}>
              That means looking beyond the immediate request, identifying connections others may overlook, and developing solutions around the opportunities with the greatest potential value.
            </Reveal>
          </div>
        </div>
        <Reveal as="ul" delay={100} className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {["Sometimes the answer is strategic.", "Sometimes it’s technological.", "Sometimes it’s a new partnership or a better customer experience.", "Sometimes it’s a completely different commercial model."].map((t, i) => (
            <li key={t} className="bg-navy-deep p-6 sm:p-7">
              <BrandBlock block={(i % 3) as 0 | 1 | 2} className="h-3 w-auto" />
              <p className="mt-5 text-[1.05rem] font-medium leading-snug text-ink">{t}</p>
            </li>
          ))}
        </Reveal>
        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Reveal as="p" className="max-w-xl text-[1.0625rem] leading-relaxed text-mist">
            What matters is finding the right approach for the right opportunity.
          </Reveal>
          <Reveal as="p" delay={80} className="type-title max-w-2xl text-ink">
            {SITE.closing}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Who we work with */
export function WhoWeWorkWith() {
  return (
    <section id="who-we-work-with" aria-labelledby="who-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze" data-trail-anchor="">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Who we work with
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
              <span id="who-title">Different Challenges. New Possibilities.</span>
            </Reveal>
          </div>
          <Reveal as="p" delay={140} className="type-lede self-end text-mist lg:col-span-5 lg:col-start-8">
            Opportunity exists across industries, markets, and institutional environments. Our capabilities adapt to the specific needs and ambitions of the organizations we work with.
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {AUDIENCES.map((a, i) => (
            <li key={a.title} className={i === AUDIENCES.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <Reveal delay={i * 80} className="flex h-full flex-col rounded-3xl border border-white/[0.07] bg-[linear-gradient(170deg,rgba(10,30,82,0.7),rgba(0,10,40,0.85))] p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-navy-deep text-jade">
                  <Icon name={AUDIENCE_ICON[i]} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[1.08rem] font-semibold leading-snug text-ink">{a.title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-mist">{a.line}</p>
                {"href" in a && (
                  <Link href={a.href} className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.88rem] text-jade underline-offset-4 hover:underline">
                    Explore <span className="sr-only">{a.title}</span>
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Our approach */
export function Approach() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze" data-trail-anchor="">
              <span aria-hidden className="h-px w-8 bg-jade" />
              Our approach
            </Reveal>
            <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
              <span id="approach-title">From Opportunity to Outcome.</span>
            </Reveal>
            <Reveal as="p" delay={140} className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-mist">
              Meaningful progress begins with understanding where value can be created. Our approach connects discovery, strategy, intelligent execution, and continuous improvement.
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <AngledPhoto photo={PHOTO.engagement} block={0} className="h-[40vw] max-h-[20rem] min-h-[12rem]" />
          </div>
        </div>
        <div className="mt-16 lg:mt-20">
          <EngagementPath />
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.07] pt-8 lg:flex-row lg:items-baseline lg:justify-between">
          <Reveal as="p" className="text-[1.15rem] font-medium leading-snug text-ink">
            The objective is not activity for its own sake. It&rsquo;s meaningful progress with measurable value.
          </Reveal>
          <Reveal as="p" delay={80} className="text-[0.85rem] text-haze">
            Each engagement is shaped around the opportunity; these stages describe our philosophy, not a fixed methodology.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
