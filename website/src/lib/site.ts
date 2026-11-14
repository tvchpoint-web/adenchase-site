/**
 * All corporate copy in one place. Source of truth: the consolidated copy & positioning brief
 * (corporate identity, philosophy, the three disciplines, Government & Institutions).
 * Rules: the tagline is SITE.statement and is never substituted; the three disciplines are named
 * exactly as SITE.disciplines; no invented clients, credentials, statistics or endorsements.
 */
export const SITE = {
  name: "ADEN-CHASE Strategies",
  /** The approved corporate tagline. */
  statement: "Identifying Opportunity. Engineering Growth.",
  disciplines: "Business Development • AI Engineering • Market Growth",
  /** Primary philosophy statement (supporting, never a replacement for the tagline). */
  philosophy: "We see opportunities others overlook—and engineer the solutions to realize them.",
  /** Supporting brand statement. */
  belief: "Opportunity is not always obvious. Growth is not always conventional.",
  /** Closing statement used across pages. */
  closing: "Every business is different. Every opportunity deserves its own strategy.",
  description:
    "ADEN-CHASE Strategies connects business development, AI engineering, and market growth to identify opportunities and develop tailored solutions for businesses and institutions.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://adenchase.com",
  /** The Client Portal is a separate application; this is only a link to it. */
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://aden-chase-portal.vercel.app/login",
} as const;

export const NAV = [
  { href: "/about", label: "About" },
  { href: "/business-development", label: "Business Development" },
  { href: "/ai-engineering", label: "AI Engineering" },
  { href: "/market-growth", label: "Market Growth" },
  { href: "/government-institutions", label: "Government & Institutions" },
  { href: "/contact", label: "Contact" },
] as const;

export const CTA = {
  conversation: "Start a Conversation",
  consultation: "Request a Private Consultation",
  capabilities: "Explore Our Capabilities",
} as const;

/** Operating philosophy: four connected steps (a real sequence). */
export const OPERATING_PHILOSOPHY = ["Identify the opportunity.", "Connect the possibilities.", "Engineer the solution.", "Create measurable value."] as const;

export const PRINCIPLES = [
  "Opportunity identification is a core competency.",
  "Strategy must connect to execution.",
  "Technology serves business objectives, not the reverse.",
  "Every engagement deserves a tailored approach.",
  "Sustainable growth is built through practical, measurable improvements.",
] as const;

/* ------------------------------------------------------------- disciplines */

export interface Capability {
  title: string;
  description: string;
}

export interface Discipline {
  id: "business-development" | "ai-engineering" | "market-growth";
  href: string;
  region: 0 | 1 | 2;
  index: string;
  title: string;
  /** Homepage discipline headline and copy. */
  headline: string;
  copy: string[];
  /** Discipline page. */
  pageLines: string[];
  pageIntro: string[];
  capabilities: Capability[];
  closing: { title: string; copy: string; cta: string };
  metaDescription: string;
}

export const DISCIPLINES: Discipline[] = [
  {
    id: "business-development",
    href: "/business-development",
    region: 0,
    index: "01",
    title: "Business Development",
    headline: "Discover the Opportunity.",
    copy: [
      "We identify untapped commercial potential, develop new revenue opportunities, strengthen business positioning, and connect organizations with strategic relationships that support sustainable growth.",
      "From market intelligence to commercial concept development, we help determine where meaningful growth can come from—and how to pursue it.",
    ],
    pageLines: ["See the Opportunity.", "Build the Advantage."],
    pageIntro: [
      "Growth is not always about doing more. Sometimes it's about recognizing what others have missed.",
      "ADEN-CHASE helps organizations uncover commercial opportunities, strengthen their strategic position, and develop practical pathways toward new revenue, stronger relationships, and long-term growth.",
      "We look beyond conventional boundaries to identify how existing capabilities, market conditions, customer relationships, and emerging opportunities can be connected to create value.",
    ],
    capabilities: [
      { title: "Strategic Business Development", description: "Identifying opportunities that support commercial expansion, stronger positioning, and sustainable business performance." },
      { title: "Revenue Opportunity Development", description: "Exploring new products, services, channels, and commercial models that complement existing business operations." },
      { title: "Strategic Partnerships", description: "Identifying and structuring relationships that create mutual value and expand organizational capabilities." },
      { title: "Market Intelligence", description: "Researching market conditions, competitive positioning, customer needs, and emerging commercial opportunities." },
      { title: "Commercial Concept Development", description: "Turning promising ideas into structured propositions with clear business rationale, execution considerations, and measurable objectives." },
      { title: "Customer Experience Strategy", description: "Identifying opportunities to improve customer journeys, strengthen engagement, and build more valuable long-term relationships." },
      { title: "International Market Entry", description: "Helping organizations assess opportunities, positioning, partnerships, and practical considerations for entering new markets." },
      { title: "Business Model Innovation", description: "Exploring new ways organizations can create, deliver, and capture value." },
    ],
    closing: {
      title: "Growth Begins With a Different Perspective.",
      copy: "The right opportunity can change the direction of a business. Our role is to identify it, evaluate its potential, and develop a practical path forward.",
      cta: "Explore a Business Opportunity",
    },
    metaDescription: "Explore strategic business development, commercial opportunity identification, partnerships, market intelligence, and new revenue strategies.",
  },
  {
    id: "ai-engineering",
    href: "/ai-engineering",
    region: 1,
    index: "02",
    title: "AI Engineering",
    headline: "Engineer the Advantage.",
    copy: [
      "We develop intelligent systems that improve how organizations operate, communicate, and deliver value.",
      "Our approach integrates AI with existing workflows, technologies, and business processes—reducing friction while expanding operational capability.",
    ],
    pageLines: ["Intelligence That", "Works With Your", "Business."],
    pageIntro: [
      "Artificial intelligence should make organizations more capable—not more complicated.",
      "ADEN-CHASE engineers intelligent solutions that integrate with existing systems, teams, and workflows. We focus on practical applications that reduce friction, improve information access, strengthen customer experiences, and support better operational decisions.",
      "Our approach begins with understanding the business challenge, not selecting a technology.",
    ],
    capabilities: [
      { title: "AI Strategy & Implementation", description: "Identifying practical AI use cases and developing appropriate implementation approaches." },
      { title: "Intelligent Workflow Automation", description: "Reducing repetitive tasks and improving coordination across existing processes." },
      { title: "AI Assistants & Customer Interfaces", description: "Developing intelligent interfaces that help customers and teams access information, navigate services, and complete appropriate tasks." },
      { title: "Systems Integration", description: "Connecting relevant tools, platforms, and information sources to support more cohesive operations." },
      { title: "Business Intelligence", description: "Improving how organizations access, organize, interpret, and use business information." },
      { title: "Custom Intelligent Applications", description: "Developing purpose-built digital tools and AI-enabled applications around specific operational or commercial requirements." },
      { title: "AI Discovery & Visibility", description: "Helping organizations improve how their services, locations, and expertise are accurately represented and discovered across relevant AI-assisted experiences." },
      { title: "Continuous Optimization", description: "Evaluating performance and refining solutions as business needs and technologies evolve." },
    ],
    closing: {
      title: "Let's Engineer Something Useful.",
      copy: "Tell us where friction, disconnected systems, or slow information are holding the business back.",
      cta: "Explore AI Engineering",
    },
    metaDescription: "Intelligent systems, AI integration, workflow automation, and tailored applications engineered around real business needs.",
  },
  {
    id: "market-growth",
    href: "/market-growth",
    region: 2,
    index: "03",
    title: "Market Growth",
    headline: "Expand What's Possible.",
    copy: [
      "We help brands and organizations become more visible, relevant, and competitive.",
      "Through market positioning, digital infrastructure, customer engagement, strategic partnerships, and intelligent discovery, we connect organizations with new audiences and commercial opportunities.",
    ],
    pageLines: ["Build Visibility.", "Create Demand.", "Expand Opportunity."],
    pageIntro: [
      "A strong market position requires more than simply being present. Organizations must be discoverable, relevant, credible, and capable of converting attention into meaningful relationships.",
      "ADEN-CHASE develops market-growth strategies that connect brand positioning, digital infrastructure, customer experience, and intelligent discovery.",
      "We look at how organizations are found, understood, evaluated, and chosen—and identify opportunities to strengthen that journey.",
    ],
    capabilities: [
      { title: "Market Positioning", description: "Developing clearer differentiation and stronger commercial relevance." },
      { title: "Brand Development", description: "Strengthening how organizations communicate their identity, value, and market proposition." },
      { title: "Digital Experience Strategy", description: "Developing websites, platforms, and digital customer journeys that support business objectives." },
      { title: "AI Search & Discovery Visibility", description: "Improving the accuracy, structure, and discoverability of organizational information across relevant search and AI-assisted platforms." },
      { title: "Customer Acquisition Strategy", description: "Identifying opportunities to attract and engage commercially relevant audiences." },
      { title: "Customer Retention & Engagement", description: "Developing approaches that strengthen relationships and encourage continued engagement." },
      { title: "Content & Communications Strategy", description: "Creating coherent messaging and content systems that support brand recognition and customer understanding." },
      { title: "Partnership-Led Growth", description: "Exploring collaborative opportunities that expand reach and create shared commercial value." },
      { title: "Market Expansion", description: "Identifying new customer segments, geographic opportunities, and routes to market." },
      { title: "Performance Optimization", description: "Measuring relevant outcomes and refining initiatives based on evidence." },
    ],
    closing: {
      title: "Visibility Is the Beginning. Growth Is the Objective.",
      copy: "We connect market intelligence, digital experience, and commercial strategy to help organizations turn attention into opportunity.",
      cta: "Explore Market Growth",
    },
    metaDescription: "Brand positioning, digital visibility, intelligent discovery, customer engagement, and market expansion strategies.",
  },
];

/* ---------------------------------------------------- who we work with */

export const AUDIENCES = [
  { title: "Businesses & Enterprises", line: "Commercial strategy, operational improvement, intelligent systems, and new growth opportunities." },
  { title: "Professional Services", line: "Digital positioning, client experience, workflow modernization, and business development for professional practices and firms." },
  { title: "Brands & Creators", line: "Digital brand infrastructure, strategic partnerships, audience development, and commercial opportunity creation." },
  { title: "Hospitality & Destination Businesses", line: "Visitor experience, intelligent engagement, digital service platforms, and destination-related commercial opportunities." },
  { title: "Government & Institutions", line: "Digital modernization, intelligent systems, service improvement, and tailored institutional solutions.", href: "/government-institutions" },
] as const;

/* -------------------------------------------------------------- approach */

/** From Opportunity to Outcome: our general philosophy, not a mandatory fixed methodology. */
export const ENGAGEMENT_STEPS = [
  { title: "Discover", body: "Understand the organization, its environment, capabilities, challenges, and objectives." },
  { title: "Identify", body: "Recognize overlooked opportunities, inefficiencies, market gaps, and strategic connections." },
  { title: "Strategize", body: "Develop a tailored approach with clear priorities, practical execution considerations, and commercial rationale." },
  { title: "Engineer", body: "Design, build, integrate, coordinate, or implement the appropriate solution." },
  { title: "Optimize", body: "Evaluate results, refine performance, and identify opportunities for continued improvement." },
] as const;

/* ------------------------------------------------ government & institutions */

export const INSTITUTIONAL_CAPABILITIES: Capability[] = [
  { title: "Digital Modernization", description: "Developing approaches to improve digital service delivery, information access, administrative processes, and institutional systems." },
  { title: "AI & Intelligent Systems", description: "Exploring practical AI applications that support operational efficiency, knowledge access, stakeholder engagement, and service coordination." },
  { title: "Citizen & Stakeholder Experience", description: "Improving how institutions communicate, engage, and deliver services to the communities and stakeholders they serve." },
  { title: "Strategic Research & Solution Development", description: "Assessing institutional challenges, identifying opportunities, and developing evidence-informed approaches to potential solutions." },
  { title: "Program & Platform Development", description: "Supporting the design, coordination, and implementation of digital platforms and institutional improvement initiatives." },
  { title: "Operational Improvement", description: "Identifying process inefficiencies, disconnected workflows, and opportunities to reduce administrative friction." },
  { title: "Public-Private Collaboration", description: "Exploring appropriate partnerships between public institutions, private enterprises, technology providers, and other stakeholders." },
];

export const INTERESTS = ["Business Development", "AI Engineering", "Market Growth", "Government & Institutions", "Not sure yet — exploring"] as const;
