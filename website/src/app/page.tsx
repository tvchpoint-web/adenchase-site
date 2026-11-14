import { OpeningSequence } from "@/components/opening/OpeningSequence";
import { AiEngineering, Approach, Differentiation, Introduction, MarketGrowth, StrategyInPractice, WhoWeWorkWith } from "@/components/home/Sections";
import { FinalCta } from "@/components/home/FinalCta";
import { LivingCircuit } from "@/components/motion/LivingCircuit";
import { preload } from "react-dom";
import { SITE } from "@/lib/site";

/**
 * Home: the logo-first opening, then the full story — with a jade signal that travels through
 * every section and resolves into the mark at the final call to action.
 */
export default function Home() {
  // The opening's first visible layer (and the page's largest paint): fetch it before anything else.
  preload("/photos/logo-text.webp", { as: "image", fetchPriority: "high" });
  return (
    <main id="main" className="relative">
      {/* The hero's message for assistive technology, present from the first paint (the visible
          hero headline appears only as the opening sequence is scrolled). */}
      <div className="sr-only">
        <h1>{SITE.statement}</h1>
        <p>{SITE.support}</p>
        <p>{SITE.disciplines}</p>
      </div>
      <OpeningSequence />

      <div className="relative">
        <LivingCircuit />
        <Introduction />
        <StrategyInPractice />
        <AiEngineering />
        <MarketGrowth />
        <Differentiation />
        <WhoWeWorkWith />
        <Approach />
        <FinalCta />
      </div>
    </main>
  );
}
