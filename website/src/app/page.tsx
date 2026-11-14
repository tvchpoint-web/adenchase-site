import { OpeningSequence } from "@/components/opening/OpeningSequence";
import { AiEngineering, CapabilitiesValue, MarketGrowth, PrivateEngagement, StrategyInPractice } from "@/components/home/Sections";
import { FinalCta } from "@/components/home/FinalCta";
import { LivingCircuit } from "@/components/motion/LivingCircuit";
import { preload } from "react-dom";
import { DISCIPLINES } from "@/lib/site";

/**
 * Home: the logo-first opening, then the full story — with a jade signal that travels through
 * every section and resolves into the mark at the final call to action.
 */
export default function Home() {
  // The opening's first visible layer (and the page's largest paint): fetch it before anything else.
  preload("/photos/logo-text.webp", { as: "image", fetchPriority: "high" });
  return (
    <main id="main" className="relative">
      <OpeningSequence />
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
      <div className="relative">
        <LivingCircuit />
        <StrategyInPractice />
        <AiEngineering />
        <MarketGrowth />
        <CapabilitiesValue />
        <PrivateEngagement />
        <FinalCta />
      </div>
    </main>
  );
}
