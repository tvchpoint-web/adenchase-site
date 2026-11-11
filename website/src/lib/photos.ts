/**
 * Every photograph on the site, by role. Files live in public/photos as `<name>.webp` (wide)
 * and `<name>-m.webp` (phones). To swap in final or client-supplied photography, add the files
 * and change the name here — nothing else needs to change.
 *
 * Client-supplied images: handshake, team-overhead, counsel. All others are TEMPORARY
 * Unsplash references (see public/photos/CREDITS.md).
 */
export const PHOTO = {
  // Opening
  skyline: "skyline",
  sliceStrategy: "strategy",
  sliceEngineering: "engineering",
  sliceIntelligence: "intelligence",
  sliceGrowth: "growth",
  portalStrategy: "decision",
  portalEngineering: "intelligence",
  portalGrowth: "earth",
  // Home sections
  strategyPractice: "strategy",
  aiMain: "engineering",
  aiDetail: "systems",
  growthMain: "growth",
  growthDetail: "team-overhead",
  engagement: "handshake",
  finalCta: "earth",
  // Inner pages
  approachHero: "strategy",
  expertiseHero: "analytics",
  expertiseStrategy: "decision",
  expertiseEngineering: "systems",
  expertiseGrowth: "growth",
  capabilitiesHero: "analytics",
  engagementHero: "counsel",
} as const;
