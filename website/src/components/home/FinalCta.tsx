import Link from "next/link";
import { Reveal } from "@/components/editorial/SplitLines";
import { InView } from "@/components/motion/InView";
import { BLOCKS, LOGO_H, LOGO_W } from "@/lib/blocks";
import { PHOTO } from "@/lib/photos";
import { CTA_INTRO, SITE } from "@/lib/site";

/** Each block's crop box within the artwork, as percentages of the logo — so the crops land exactly in place. */
const crops = BLOCKS.map((q) => {
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { left: (x / LOGO_W) * 100, top: (y / LOGO_H) * 100, width: ((Math.max(...xs) - x) / LOGO_W) * 100, height: ((Math.max(...ys) - y) / LOGO_H) * 100 };
});

/**
 * The conclusion: the three blocks arrive along their own slant and resolve into the authentic
 * ADEN-CHASE mark (the official artwork, never redrawn), where the jade signal ends.
 */
export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="photo absolute inset-0 bg-cover bg-center opacity-60" data-photo={PHOTO.finalCta} />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,10,48,0.95)_0%,rgba(0,10,48,0.7)_50%,rgba(0,10,48,0.55)_100%)]" />
      <div aria-hidden className="final-streaks absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-[96rem] items-center gap-14 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-40">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <Reveal as="p" className="type-label flex items-center gap-3 text-haze">
            <span aria-hidden className="h-px w-8 bg-jade" />
            {SITE.statement}
          </Reveal>
          <Reveal as="h2" delay={80} className="type-display mt-6 text-ink">
            <span id="final-title">
              Your next opportunity <span className="text-jade">starts here.</span>
            </span>
          </Reveal>
          <Reveal as="p" delay={160} className="type-lede mt-7 max-w-[32rem] text-mist">
            A private, considered approach to business strategy, intelligent engineering, and market growth.
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/engagement" className="btn btn-primary justify-center shadow-[0_0_40px_-12px_rgba(131,253,128,0.6)]">
              {CTA_INTRO}
              <span aria-hidden className="btn-arrow">→</span>
            </Link>
            <a href={SITE.portalUrl} className="link-quiet text-sm underline-offset-4 hover:underline" rel="noopener">
              Existing client? Sign in to the portal
            </a>
          </Reveal>
        </div>

        <InView className="final-mark order-1 lg:order-2 lg:col-span-5 lg:col-start-8" margin="0px 0px -20% 0px">
          <div data-trail-end className="relative mx-auto w-full max-w-[34rem]" style={{ aspectRatio: `${LOGO_W} / ${LOGO_H}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the official artwork, layered */}
            <img src="/photos/logo-wordmark.webp" alt="" aria-hidden className="final-wordmark absolute inset-0 h-full w-full select-none" draggable={false} />
            {crops.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- block cut from the official artwork
              <img
                key={i}
                src={`/photos/logo-block-${i}.png`}
                alt=""
                aria-hidden
                className="final-block absolute select-none"
                style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.width}%`, height: `${c.height}%`, "--i": i } as React.CSSProperties}
                draggable={false}
              />
            ))}
            <span className="sr-only">ADEN-CHASE Strategies</span>
          </div>
        </InView>
      </div>
    </section>
  );
}
