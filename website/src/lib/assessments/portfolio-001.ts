import type { AssessmentDefinition } from "./types";

/** Pat's Private Property & Legacy Assessment (wording as approved in the build request). */
export const portfolio001: AssessmentDefinition = {
  id: "portfolio-001",
  title: "Pat's Property & Legacy Assessment",
  subtitle: "A private assessment designed to explore the opportunities, organization, and long-term potential of your family's property portfolio.",
  recipientName: "Pat",
  introduction: [
    "Pat, this preliminary assessment will help us better understand the properties, their current uses, and your vision for the future. You can answer at your convenience, skip questions you're unsure about, and provide additional information later.",
  ],
  questions: [
    {
      title: "Portfolio Overview",
      prompt: "Approximately how many properties does your father own, and where are they located?",
      helper: "Neighborhoods, addresses, or general locations are fine.",
    },
    {
      title: "Property Types",
      prompt: "What types of properties are included in the portfolio?",
      helper: "Examples: Residential homes, apartments, commercial buildings, vacant land, mixed-use properties.",
    },
    {
      title: "Current Utilization",
      prompt: "How are the properties currently being used?",
      helper: "Examples: Rented, occupied by family, vacant, undeveloped, informal commercial use.",
    },
    {
      title: "Ownership",
      prompt: "Which properties are registered in your name, your father's name, or another ownership structure?",
      helper: "A general breakdown is sufficient. No legal documents are needed at this stage.",
    },
    {
      title: "Existing Income",
      prompt: "Do any properties currently generate rental or business income?",
      helper: "Approximate information is fine. Exact financial details are not required.",
    },
    {
      title: "Known Obligations",
      prompt: "Are you aware of any mortgages, outstanding property taxes, title concerns, or other obligations affecting the properties?",
    },
    {
      title: "Property Condition",
      prompt: "Are any properties in need of major repairs, renovations, or redevelopment?",
      followUp: "Which properties would you prioritize?",
    },
    {
      title: "Proposed Commercial Development",
      prompt: "Regarding the property you mentioned potentially converting into offices or retail spaces, what is your vision?",
      helper: "You may describe existing ideas, plans, or drawings. Photos can be shared separately.",
    },
    {
      title: "Your Father's Vision",
      prompt: "Has your father ever expressed a long-term vision or development plan for the properties?",
    },
    {
      title: "Family Participation",
      prompt: "How open do you believe your father would be to discussing a coordinated property strategy?",
      followUp: "Would he be comfortable with you helping organize an initial conversation?",
    },
    {
      title: "Legacy Planning",
      prompt: "Are you aware of any existing wills, trusts, family agreements, or other succession arrangements involving these properties?",
      helper: "A general answer is sufficient. Please do not upload confidential documents.",
    },
    {
      title: "Your Priorities",
      prompt: "What are your three biggest priorities for the properties over the next three to five years?",
      helper: "Examples: Rental income, redevelopment, asset preservation, clearer ownership, family legacy, or something else.",
    },
  ],
  completion: {
    heading: "Thank you, Pat.",
    paragraphs: [
      "Your Property & Legacy Assessment has been received.",
      "We'll review the information you've shared and use it to begin identifying potential opportunities, priorities, and next steps.",
      "Thank you for taking the time to share your vision.",
    ],
  },
  accessCodeEnv: "ASSESSMENT_PORTFOLIO_001_CODE",
};
