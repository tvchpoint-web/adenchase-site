export const SITE = {
  name: "ADEN-CHASE Strategies",
  statement: "Identifying Opportunity. Engineering Growth.",
  disciplines: "Business Strategy • AI Engineering • Market Growth",
  description:
    "ADEN-CHASE Strategies identifies opportunity, engineers intelligent solutions, and creates new pathways for business growth — across business strategy, AI engineering and market growth.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://adenchase.com",
  /** The Client Portal is a separate application; this is only a link to it. */
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://aden-chase-portal.vercel.app/login",
} as const;

export const NAV = [
  { href: "/approach", label: "Approach" },
  { href: "/expertise", label: "Expertise" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/engagement", label: "Private Engagement" },
] as const;

export const CTA_INTRO = "Request a Strategic Introduction";

/* ------------------------------------------------------------- disciplines */

export interface Discipline {
  id: "strategy" | "engineering" | "growth";
  region: 0 | 1 | 2;
  index: string;
  title: string;
  line: string;
  description: string;
  applications: string[];
  questions: string[];
}

export const DISCIPLINES: Discipline[] = [
  {
    id: "strategy",
    region: 0,
    index: "01",
    title: "Business Strategy",
    line: "Identify opportunity. Establish direction. Create competitive advantage.",
    description:
      "Strategy is where every engagement begins. We examine the business as it actually operates — its market, customers, economics and constraints — to find the opportunities worth pursuing and the direction that makes them achievable.",
    applications: [
      "Growth strategy and opportunity assessment",
      "Competitive and market positioning",
      "Strategic partnership development",
      "Prioritised roadmaps that connect direction to execution",
      "Decision support for leadership teams",
    ],
    questions: [
      "Where is the most valuable opportunity we are not yet pursuing?",
      "What should we stop doing to move faster on what matters?",
      "Which partnerships would change our position in the market?",
    ],
  },
  {
    id: "engineering",
    region: 1,
    index: "02",
    title: "AI Engineering",
    line: "Engineer intelligent systems that improve how businesses operate and grow.",
    description:
      "We design and build practical AI systems around real workflows — automating the repetitive, connecting the disconnected and giving teams better information at the moment they need it. The goal is measurable operational improvement, not technology for its own sake.",
    applications: [
      "AI workflow engineering and intelligent assistants",
      "Business process automation",
      "Integration of disconnected systems and data",
      "Digital visibility for AI-driven search and discovery",
      "Responsible adoption: evaluation, guardrails and team enablement",
    ],
    questions: [
      "Which workflows consume the most time for the least value?",
      "Where would better information change decisions day to day?",
      "How do we adopt AI without creating new operational risk?",
    ],
  },
  {
    id: "growth",
    region: 2,
    index: "03",
    title: "Market Growth",
    line: "Turn strategic direction into meaningful commercial momentum.",
    description:
      "Direction only matters when it reaches the market. We help translate strategy into visibility, customer experience and commercial activity — building the systems and relationships that turn opportunity into sustained growth.",
    applications: [
      "Digital visibility and positioning",
      "Customer experience strategy",
      "Revenue opportunity development",
      "International and new-market entry planning",
      "Go-to-market sequencing and measurement",
    ],
    questions: [
      "Why are the right customers not finding us — or not choosing us?",
      "Which markets are worth entering next, and how?",
      "Where does the customer journey lose momentum?",
    ],
  },
];

/* ------------------------------------------------------------ capabilities */

export const CAPABILITIES: { title: string; discipline: Discipline["id"]; description: string }[] = [
  {
    title: "Business Growth Strategy",
    discipline: "strategy",
    description: "A clear view of where growth can realistically come from, and the sequence of moves that makes it achievable.",
  },
  {
    title: "Digital Transformation",
    discipline: "engineering",
    description: "Modernising the systems and ways of working that hold a business back, in stages the organisation can absorb.",
  },
  {
    title: "AI Workflow Engineering",
    discipline: "engineering",
    description: "Designing AI into specific workflows — intake, research, reporting, support — with people kept firmly in the loop.",
  },
  {
    title: "Business Process Automation",
    discipline: "engineering",
    description: "Removing repetitive manual work and the errors that come with it, so teams can focus on judgement and relationships.",
  },
  {
    title: "Digital Visibility and AI Discovery",
    discipline: "growth",
    description: "Making sure a business is accurately found and represented — in search, on the platforms that matter, and in AI-generated answers.",
  },
  {
    title: "Customer Experience Strategy",
    discipline: "growth",
    description: "Mapping how customers actually experience the business and redesigning the moments that shape trust and loyalty.",
  },
  {
    title: "Strategic Partnerships",
    discipline: "strategy",
    description: "Identifying, structuring and developing partnerships that open markets, capabilities or channels a business could not reach alone.",
  },
  {
    title: "International Market Entry",
    discipline: "growth",
    description: "Assessing new markets and planning a considered entry — positioning, partners, sequencing and risk.",
  },
  {
    title: "Revenue Opportunity Development",
    discipline: "strategy",
    description: "Finding and shaping new revenue streams from existing strengths, relationships and assets.",
  },
];

/* -------------------------------------------------------------- approach */

export const FRAMEWORK = [
  {
    word: "Identify.",
    title: "Identify the opportunity",
    body: "We start by understanding the business in depth — its market, customers, operations and ambitions — to uncover overlooked possibilities and the strategic gaps standing in the way.",
    involves: ["Discovery conversations with leadership", "Market, competitor and customer analysis", "Operational and systems review", "A prioritised view of opportunity"],
  },
  {
    word: "Engineer.",
    title: "Engineer the solution",
    body: "We turn direction into something real: strategic plans, intelligent systems and the operational changes needed to support them — designed around how the business actually works.",
    involves: ["Strategic direction and roadmap", "AI and automation design", "Systems integration and implementation", "Team enablement and adoption"],
  },
  {
    word: "Accelerate.",
    title: "Accelerate the growth",
    body: "With the foundations in place, we focus on momentum — visibility, customer experience, partnerships and new markets — and keep measuring what is working so effort follows results.",
    involves: ["Go-to-market and visibility work", "Partnership and market development", "Agreed measures of progress", "Ongoing refinement and expansion"],
  },
] as const;

export const ENGAGEMENT_STEPS = [
  { title: "Strategic introduction", body: "A considered first conversation to understand your business, your ambitions and whether we are the right partner." },
  { title: "Discovery", body: "A structured look at the opportunity — market, operations, systems and customers — before anything is recommended." },
  { title: "Direction", body: "A clear, prioritised plan with the reasoning behind it, and agreement on how progress will be measured." },
  { title: "Engineering", body: "Implementation of the strategy, systems and automation the plan calls for, alongside your team." },
  { title: "Expansion", body: "Measuring outcomes against what was agreed, refining what works and identifying the next opportunity." },
] as const;

export const OUTCOMES = [
  "Stronger Digital Visibility",
  "Better Customer Experiences",
  "Operational Efficiency",
  "Strategic Partnerships",
  "New Revenue Opportunities",
  "Market Expansion",
] as const;


export const INTERESTS = ["Business Strategy", "AI Engineering", "Market Growth", "Not sure yet — exploring"] as const;
