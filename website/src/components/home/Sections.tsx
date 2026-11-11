import Link from "next/link";
import { AngledPhoto, BlockIndex } from "@/components/brand/AngledPhoto";
import { Reveal } from "@/components/editorial/SplitLines";
import { BLOCK_COLOURS, BLOCK_TEXT } from "@/lib/blocks";
import { CAPABILITIES, CTA_INTRO, DISCIPLINES, ENGAGEMENT_STEPS, FRAMEWORK, OUTCOMES, SITE } from "@/lib/site";

const wrap = "mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12";

/** Section opener shared by the three disciplines: the mark's blocks as an index, then the label. */
export function DisciplineLabel({ block, label }: { block: 0 | 1 | 2; label: string }) {
  return (
    <Reveal className="flex items-center gap-4">
      <BlockIndex active={block} className="h-4 w-auto" />
      <span className="type-label" style={{ color: BLOCK_TEXT[block] }}>
        {label}
      </span>
    </Reveal>
  );
}

function Applications({ items, block }: { items: string[]; block: 0 | 1 | 2 }) {
  return (
    <ul className="grid gap-x-8 border-t border-line sm:grid-cols-2">
      {items.map((a) => (
        <li key={a} className="flex gap-3 border-b border-line py-4 text-[0.98rem] text-ink/90">
          <span aria-hidden className="mt-[0.55em] h-1.5 w-2.5 shrink-0 -skew-x-[34deg]" style={{ background: BLOCK_COLOURS[block] }} />
          {a}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------- 01 · in practice */
export function StrategyInPractice() {
  const d = DISCIPLINES[0];
  return (
    <section id="business-strategy" aria-labelledby="strategy-title" className="relative scroll-mt-20 border-t border-line">
      <div className={`${wrap} grid gap-12 py-24 lg:grid-cols-12 lg:py-32`}>
        <div className="lg:col-span-5">
          <DisciplineLabel block={0} label="01 · Business Strategy — in practice" />
          <Reveal as="h2" delay={80} className="type-title mt-6 text-ink">
            <span id="strategy-title">{d.line}</span>
          </Reveal>
          <Reveal as="p" delay={140} className="type-lede mt-6 text-mist">
            Strategy is where every engagement begins — the foundation the engineering and growth work is built on.
          </Reveal>
          <Reveal delay={200} className="mt-10">
            <h3 className="type-label text-haze">Questions we help answer</h3>
            <ul className="mt-5 space-y-4">
              {d.questions.map((q) => (
                <li key={q} className="border-l-2 pl-4 text-[1.05rem] leading-relaxed text-ink" style={{ borderColor: BLOCK_COLOURS[0] }}>
                  {q}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <AngledPhoto photo="strategy" block={0} className="h-[46vw] max-h-[30rem] min-h-[15rem]" />
          <Reveal delay={120} className="mt-10">
            <Applications items={d.applications} block={0} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 02 · AI Engineering */
export function AiEngineering() {
  const d = DISCIPLINES[1];
  const shows = [
    ["Automation", "Repetitive work moved off people’s desks, with people kept in the loop."],
    ["Intelligent assistants", "Answers, drafts and research where the work actually happens."],
    ["Connected systems", "Data that flows between tools instead of being re-keyed."],
  ];
  return (
    <section id="ai-engineering" aria-labelledby="ai-title" className="relative scroll-mt-20 overflow-hidden border-t border-line bg-navy-deep/60">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <DisciplineLabel block={1} label="02 · AI Engineering" />
            <Reveal as="h2" delay={80} className="type-headline mt-6 text-ink">
              <span id="ai-title">
                Engineer intelligent systems that improve how businesses <span style={{ color: BLOCK_COLOURS[1] }}>operate and grow.</span>
              </span>
            </Reveal>
          </div>
          <Reveal as="p" delay={140} className="type-lede self-end text-mist lg:col-span-5 lg:col-start-8">
            {d.description}
          </Reveal>
        </div>

        <div className="relative mt-14 lg:mt-20">
          <AngledPhoto photo="engineering" block={1} className="h-[56vw] max-h-[38rem] min-h-[16rem]" position="center 35%" />
          <div className="relative -mt-16 ml-auto w-[58%] sm:-mt-24 sm:w-[44%] lg:-mt-40 lg:w-[34%]">
            <AngledPhoto photo="intelligence" block={1} className="h-[30vw] max-h-[17rem] min-h-[8rem]" />
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-12">
          <Reveal className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            {shows.map(([t, line]) => (
              <div key={t}>
                <p className="text-[1.15rem] font-semibold tracking-[-0.01em] text-ink">{t}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-mist">{line}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={120} className="lg:col-span-5">
            <Applications items={d.applications} block={1} />
          </Reveal>
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
          <div className="order-2 lg:order-1 lg:col-span-7">
            <AngledPhoto photo="growth" block={2} className="h-[50vw] max-h-[34rem] min-h-[15rem]" />
            <div className="relative -mt-14 w-[56%] sm:-mt-20 sm:w-[42%] lg:-mt-28 lg:ml-[8%] lg:w-[40%]">
              <AngledPhoto photo="analytics" block={2} className="h-[28vw] max-h-[16rem] min-h-[8rem]" />
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <DisciplineLabel block={2} label="03 · Market Growth" />
            <Reveal as="h2" delay={80} className="type-headline mt-6 text-ink">
              <span id="growth-title">
                Turn direction into <span style={{ color: BLOCK_TEXT[2] }}>commercial momentum.</span>
              </span>
            </Reveal>
            <Reveal as="p" delay={140} className="type-lede mt-6 text-mist">
              {d.description}
            </Reveal>
            <Reveal delay={200} className="mt-10">
              <Applications items={d.applications} block={2} />
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="type-label text-haze">
              Where progress shows up
            </Reveal>
            <Reveal as="p" delay={80} className="mt-4 text-[1.05rem] leading-relaxed text-mist">
              The measures that matter are agreed before work begins — then reported against honestly, including what is not yet working.
            </Reveal>
          </div>
          <Reveal delay={120} as="ul" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {OUTCOMES.map((o, i) => (
              <li key={o} className="bg-navy-deep px-5 py-6">
                <span className="type-label" style={{ color: BLOCK_TEXT[i % 3] }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-[1.05rem] font-medium text-ink">{o}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ Capabilities & business value */
export function CapabilitiesValue() {
  return (
    <section id="capabilities" aria-labelledby="cap-title" className="relative scroll-mt-20 border-t border-line bg-navy-deep/60">
      <div className={`${wrap} py-24 lg:py-32`}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
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

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-3">
          {DISCIPLINES.map((d) => (
            <Reveal key={d.id} delay={d.region * 100} className="flex flex-col bg-navy-deep p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <BlockIndex active={d.region} className="h-3.5 w-auto" />
                <span className="type-label text-haze">{d.title}</span>
              </div>
              <ul className="mt-7 space-y-6">
                {CAPABILITIES.filter((c) => c.discipline === d.id).map((c) => (
                  <li key={c.title}>
                    <p className="text-[1.15rem] font-medium tracking-[-0.01em] text-ink">{c.title}</p>
                    <p className="mt-1.5 text-[0.93rem] leading-relaxed text-mist">{c.description}</p>
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
              <Reveal as="li" key={s.word} delay={i * 100} className="border-t-2 pt-5" >
                <span className="block h-0.5 -mt-[1.4rem] mb-5 w-10 -skew-x-[34deg]" style={{ background: BLOCK_COLOURS[i] }} aria-hidden />
                <p className="text-[1.1rem] font-semibold text-ink">{s.title}</p>
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
      <div className={`${wrap} grid gap-12 py-24 lg:grid-cols-12 lg:py-32`}>
        <div className="lg:col-span-6">
          <AngledPhoto photo="office" block={0} className="h-[52vw] max-h-[34rem] min-h-[15rem]" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
            <span aria-hidden className="h-px w-8 bg-jade" />
            Private Engagement
          </Reveal>
          <Reveal as="h2" delay={80} className="type-title mt-5 text-ink">
            <span id="eng-title">Considered from the first conversation.</span>
          </Reveal>
          <Reveal as="p" delay={140} className="mt-5 text-[1.05rem] leading-relaxed text-mist">
            We work with a small number of clients at a time so each engagement receives senior attention. There are no packages or public price lists.
          </Reveal>
          <ol className="mt-8 border-t border-line">
            {ENGAGEMENT_STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 60} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-4">
                <span className="type-label pt-1 text-jade">0{i + 1}</span>
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="mt-1 text-[0.92rem] leading-relaxed text-mist">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- Final strategic introduction */
export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="photo absolute inset-0 bg-cover bg-center" data-photo="earth" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,10,48,0.92)_0%,rgba(0,10,48,0.6)_55%,rgba(0,10,48,0.35)_100%)]" />
      <div aria-hidden className="absolute bottom-0 right-[8%] top-0 hidden w-24 lg:block">
        {BLOCK_COLOURS.map((c, i) => (
          <span key={c} className="absolute top-[22%] h-[56%] w-2.5 -skew-x-[34deg]" style={{ background: c, left: `${i * 26}px` }} />
        ))}
      </div>
      <div className={`${wrap} relative py-28 lg:py-40`}>
        <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
          <span aria-hidden className="h-px w-8 bg-jade" />
          {SITE.statement}
        </Reveal>
        <Reveal as="h2" delay={80} className="type-display mt-6 max-w-4xl text-ink">
          <span id="final-title">
            Your next opportunity <span className="text-jade">starts here.</span>
          </span>
        </Reveal>
        <Reveal as="p" delay={160} className="type-lede mt-7 max-w-[32rem] text-mist">
          A private, considered approach to business strategy, intelligent engineering, and market growth.
        </Reveal>
        <Reveal delay={240} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Link href="/engagement" className="btn btn-primary justify-center">
            {CTA_INTRO}
            <span aria-hidden className="btn-arrow">→</span>
          </Link>
          <a href={SITE.portalUrl} className="link-quiet text-sm underline-offset-4 hover:underline" rel="noopener">
            Existing client? Sign in to the portal
          </a>
        </Reveal>
      </div>
    </section>
  );
}
