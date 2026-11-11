/**
 * Every photograph on the site, by role. Files live in public/photos as `<name>.webp` (wide)
 * and `<name>-m.webp` (phones). To swap in final or client-supplied photography, add the files
 * and change the name here — nothing else needs to change.
 *
 * All current images are TEMPORARY references (see public/photos/CREDITS.md).
 */
export const PHOTO = {
  // Opening
  skyline: "skyline",
  sliceStrategy: "strategy",
  sliceEngineering: "engineering",
  sliceIntelligence: "intelligence",
  sliceGrowth: "growth",
  portalStrategy: "towers",
  portalEngineering: "intelligence",
  portalGrowth: "earth",
  // Home sections
  strategyPractice: "strategy",
  aiMain: "engineering",
  aiDetail: "systems",
  growthMain: "growth",
  growthDetail: "analytics",
  engagement: "office",
  finalCta: "earth",
  // Inner pages
  approachHero: "strategy",
  expertiseHero: "analytics",
  expertiseStrategy: "towers",
  expertiseEngineering: "systems",
  expertiseGrowth: "growth",
  capabilitiesHero: "analytics",
  engagementHero: "office",
} as const;
