import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { PHOTO } from "@/lib/photos";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/editorial/SplitLines";
import { BrandBlock } from "@/components/brand/AngledPhoto";
import { BLOCK_TEXT } from "@/lib/blocks";
import { DISCIPLINES } from "@/lib/site";

const DESCRIPTION = "Business development, AI engineering, and market growth capabilities—connected to identify opportunities and develop tailored solutions.";

export const metadata: Metadata = pageMeta("Capabilities", DESCRIPTION);

/** The capabilities overview: the three disciplines side by side, each leading to its own page. */
export default function CapabilitiesPage() {
  return (
    <main id="main">
      <PageHero
        label="Our capabilities"
        lines={["Explore Our", "Capabilities."]}
        accent={1}
        photo={PHOTO.capabilitiesHero}
        block={1}
        lede="Commercial opportunity, intelligent technology, and market growth are deeply connected. We bring these disciplines together to develop solutions that work beyond traditional service boundaries."
      />
      <section aria-label="Disciplines" className="relative border-t border-line bg-navy/40">
        <div className="mx-auto grid max-w-[96rem] gap-5 px-5 py-20 sm:px-8 lg:grid-cols-3 lg:px-12 lg:py-28">
          {DISCIPLINES.map((d) => (
            <Reveal key={d.id} delay={d.region * 110} className="flex flex-col rounded-3xl border border-white/[0.07] bg-[linear-gradient(170deg,rgba(10,30,82,0.7),rgba(0,10,40,0.85))] p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <BrandBlock block={d.region} className="h-5 w-auto" />
                <span className="type-label" style={{ color: BLOCK_TEXT[d.region] }}>
                  {d.title}
                </span>
              </div>
              <h2 className="mt-5 text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{d.headline}</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-mist">{d.copy[0]}</p>
              <ul className="mt-7 space-y-2.5 border-t border-white/[0.07] pt-6 text-[0.95rem] text-ink/90">
                {d.capabilities.map((c) => (
                  <li key={c.title} className="flex gap-3">
                    <span aria-hidden className="mt-[0.55em] h-1.5 w-2.5 shrink-0 -skew-x-[34deg]" style={{ background: BLOCK_TEXT[d.region] }} />
                    {c.title}
                  </li>
                ))}
              </ul>
              <Link href={d.href} className="btn btn-ghost mt-auto justify-center self-start" style={{ marginTop: "2rem" }}>
                Explore {d.title}
              </Link>
            </Reveal>
          ))}
          <Reveal className="flex flex-col gap-6 rounded-3xl border border-white/[0.07] p-7 sm:p-9 lg:col-span-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="type-label text-haze">Applied to the public sector</p>
              <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">Government &amp; Institutions</h2>
              <p className="mt-2 leading-relaxed text-mist">The same three disciplines, applied to digital modernization, intelligent systems, service improvement, and tailored institutional solutions.</p>
            </div>
            <Link href="/government-institutions" className="btn btn-ghost shrink-0 justify-center">
              Explore Government &amp; Institutions
            </Link>
          </Reveal>
        </div>
      </section>
      <CtaBand title="Different disciplines. Connected thinking. Measurable progress." />
    </main>
  );
}
