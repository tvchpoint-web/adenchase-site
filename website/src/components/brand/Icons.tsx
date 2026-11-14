/**
 * The site's line icons: one 24px grid, 1.5px strokes, round joins, so every icon reads as part
 * of a single system. Purely decorative (aria-hidden); the copy next to each carries the meaning.
 */
const paths = {
  // Business Development
  opportunity: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9.5 16.5-4.5-4.5M7.5 13l2.5-2.5 2 2 3-3.5",
  position: "M4 20h16M6 20V10M12 20V6M18 20v-7M12 3l2 3h-4l2-3Z",
  direction: "M4 18c4 0 5-12 10-12h6m0 0-3-3m3 3-3 3M4 18h3",
  assessment: "M5 4h10l4 4v12H5V4Zm10 0v4h4M8 13h8M8 16h5M8 10h3",
  partnership: "M8 12a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm8 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7ZM3 20c0-3 2.2-5 5-5s5 2 5 5m-2-5.3c.9-.4 1.9-.7 3-.7 2.8 0 5 2 5 5",
  decision: "M12 3v5m0 0-6 5m6-5 6 5M6 13v3m12-3v3M4 19h4m8 0h4M10 3h4",
  compete: "M4 20l5-6 4 3 7-9M15 8h5v5",
  roadmap: "M5 6h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h10M5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm16 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  // AI Engineering
  automation: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3m15.4-6.4-1.8 1.8M7.4 16.6l-1.8 1.8m12.8 0-1.8-1.8M7.4 7.4 5.6 5.6",
  assistant: "M4 5h16v11H9l-5 4V5Zm5 5h.01M12 10h.01M15 10h.01",
  integration: "M6 6h4v4H6V6Zm8 8h4v4h-4v-4ZM10 8h3a2 2 0 0 1 2 2v4M6 18h4M4 14v4",
  visibility: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  guardrail: "M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Zm-3.5 9 2.5 2.5 4.5-5",
  // Market Growth
  revenue: "M4 19h16M5 15l4-4 3 3 7-8m0 0h-4m4 0v4",
  sequence: "M4 18h4v-4H4v4Zm6-4h4v-4h-4v4Zm6-4h4V6h-4v4Z",
  customer: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  efficiency: "M5 18a8 8 0 1 1 14 0M12 14l4-5M12 14h.01",
  calendar: "M5 6h14v14H5V6Zm0 4h14M9 4v4m6-4v4M9 14h2m2 0h2",
  inventory: "M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8",
  expansion: "M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5M4 4l6 6m10-6-6 6M4 20l6-6m10 6-6-6",
  // Engagement
  introduction: "M4 6h16v10H8l-4 3V6Zm4 4h8m-8 3h5",
  discovery: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm9.5 16-4.8-4.8",
  engineering: "M8 9 4 12l4 3m8-6 4 3-4 3M14 5l-4 14",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}
