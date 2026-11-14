import type { Metadata } from "next";
import { PHOTO } from "@/lib/photos";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/editorial/SplitLines";
import { InquiryForm } from "./InquiryForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Private Engagement",
  description: "Request a strategic introduction with ADEN-CHASE Strategies.",
};

export default function EngagementPage() {
  return (
    <main id="main">
      <PageHero
        label="Private Engagement"
        lines={["Your next", "opportunity", "starts here."]}
        accent={2}
        photo={PHOTO.engagementHero}
        block={0}
        lede="A private, considered approach to business development, AI engineering and market growth. Tell us a little about the opportunity, and we will be in touch."
      />
      <section aria-labelledby="inquiry-title" className="relative bg-navy/40">
        <div className="mx-auto grid max-w-[96rem] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-28">
          <div className="lg:col-span-4">
            <Reveal as="h2" className="type-title text-ink">
              <span id="inquiry-title">Request a strategic introduction</span>
            </Reveal>
            <Reveal delay={100} className="mt-8 space-y-8 text-[0.9375rem] leading-relaxed text-mist">
              <div>
                <h3 className="type-label text-haze">What happens next</h3>
                <ol className="mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="type-label pt-1 text-jade">01</span>We read your note and consider whether we are the right partner for it.
                  </li>
                  <li className="flex gap-3">
                    <span className="type-label pt-1 text-jade">02</span>If there is a fit, we suggest a short introductory conversation.
                  </li>
                  <li className="flex gap-3">
                    <span className="type-label pt-1 text-jade">03</span>Any engagement is scoped together — there are no packages or public price lists.
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
