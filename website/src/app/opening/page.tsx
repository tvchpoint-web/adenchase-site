import type { Metadata } from "next";
import { OpeningSequence } from "@/components/opening/OpeningSequence";
import { DISCIPLINES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Opening prototype",
  description: "Motion prototype of the ADEN-CHASE homepage opening. Not for publication.",
  robots: { index: false, follow: false },
};

/** Opening prototype (storyboard v2) — review only; not linked from the site. */
export default function OpeningPrototypePage() {
  return (
    <main id="main" className="relative">
      <OpeningSequence />

      {/* The same story as text, for assistive technology and no-JS visitors. */}
      <div className="sr-only">
        <h1>The future doesn’t build itself.</h1>
        <p>ADEN-CHASE Strategies identifies opportunity, engineers intelligent solutions, and creates new pathways for business growth.</p>
        <ul>
          {DISCIPLINES.map((d) => (
            <li key={d.id}>
              {d.title}: {d.line}
            </li>
          ))}
        </ul>
      </div>

      <section id="after-opening" className="relative border-t border-line bg-navy-deep">
        <div className="mx-auto max-w-[96rem] px-5 py-16 sm:px-8 lg:px-12">
          <p className="type-label text-haze">Opening prototype · for review</p>
          <p className="mt-4 max-w-2xl text-mist">
            Motion direction only — the remaining homepage sections follow after approval. Scroll back up to replay the sequence in reverse.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-haze">
            Photography: temporary Unsplash reference images (Unsplash licence), to be replaced with licensed Adobe Stock / Getty selections.
          </p>
        </div>
      </section>
    </main>
  );
}
