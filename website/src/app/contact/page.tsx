import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { PHOTO } from "@/lib/photos";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/editorial/SplitLines";
import { InquiryForm } from "./InquiryForm";
import { CTA, SITE } from "@/lib/site";

const DESCRIPTION = "Start a conversation or request a private consultation with ADEN-CHASE Strategies.";

export const metadata: Metadata = pageMeta("Contact", DESCRIPTION);

export default function ContactPage() {
  return (
    <main id="main">
      <PageHero
        label="Contact & private engagement"
        lines={["Let's Explore", "What's Possible."]}
        accent={1}
        photo={PHOTO.contactHero}
        block={0}
        lede="Whether you're facing a business challenge, exploring a new market, considering intelligent technology, or evaluating an opportunity that deserves a different perspective, the right conversation can be a valuable starting point."
      >
        <a href="#inquiry" className="btn btn-primary">
          {CTA.conversation}
          <span aria-hidden className="btn-arrow">→</span>
        </a>
      </PageHero>
      <section id="inquiry" aria-labelledby="inquiry-title" className="relative scroll-mt-24 bg-navy/40">
        <div className="mx-auto grid max-w-[96rem] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-28">
          <div className="lg:col-span-4">
            <Reveal as="h2" className="type-title text-ink">
              <span id="inquiry-title">{CTA.consultation}</span>
            </Reveal>
            <Reveal delay={100} className="mt-8 space-y-8 text-[0.9375rem] leading-relaxed text-mist">
              <p className="text-[1.02rem] text-ink/90">Tell us what you&rsquo;re working toward. We&rsquo;ll explore whether ADEN-CHASE is the right strategic partner to help move it forward.</p>
              <div>
                <h3 className="type-label text-haze">What happens next</h3>
                <ol className="mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="type-label pt-1 text-jade">01</span>We read your note and consider whether we are the right partner for it.
                  </li>
                  <li className="flex gap-3">
                    <span className="type-label pt-1 text-jade">02</span>If there is a fit, we suggest a private introductory conversation.
                  </li>
                  <li className="flex gap-3">
                    <span className="type-label pt-1 text-jade">03</span>Any engagement is shaped around the opportunity — there are no packages or public price lists.
                  </li>
                </ol>
              </div>
              <div className="hairline" />
              <p>
                Already working with us?{" "}
                <a href={SITE.portalUrl} className="text-ink underline decoration-line underline-offset-4 hover:decoration-jade" rel="noopener">
                  Sign in to the Client Portal
                </a>
                .
              </p>
            </Reveal>
          </div>
          <Reveal delay={150} className="lg:col-span-7 lg:col-start-6">
            <div className="rounded-[1.75rem] border border-line bg-navy-deep/60 p-6 backdrop-blur-sm sm:p-10">
              <InquiryForm />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
