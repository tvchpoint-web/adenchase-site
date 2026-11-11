import { OpeningSequence } from "@/components/opening/OpeningSequence";
import { AiEngineering, CapabilitiesValue, FinalCta, MarketGrowth, PrivateEngagement, StrategyInPractice } from "@/components/home/Sections";
import { DISCIPLINES } from "@/lib/site";

/**
 * Home: the logo-first opening (the mark → the world of business → the disciplines → back to
 * the mark → three portals → Business Strategy), then the full story in one editorial system.
 */
export default function Home() {
  return (
    <main id="main" className="relative">
      <OpeningSequence />
      {/* The opening's story as text, for assistive technology and no-JS visitors. */}
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
      <StrategyInPractice />
      <AiEngineering />
      <MarketGrowth />
      <CapabilitiesValue />
      <PrivateEngagement />
      <FinalCta />
    </main>
  );
}
