export const skillImprovementTips: Record<string, Record<string, string[]>> = {
  "Software Engineer": {
    "Product Management": [
      "Translate your technical debugging skills into user problem diagnosis",
      "Practice explaining technical concepts to non-technical stakeholders",
      "Start thinking about 'why build this?' before 'how to build this?'",
      "Shadow PMs at your company to understand their decision-making process",
    ],
    Consulting: [
      "Practice structuring problems using issue trees and MECE frameworks",
      "Convert your coding logic into business case math",
      "Focus on developing slide-based communication skills",
      "Study business fundamentals: P&L, market sizing, competitive analysis",
    ],
  },
  "CS Student": {
    "Product Management": [
      "Build side projects with a focus on user problems, not technology",
      "Read PM blogs: Lenny's Newsletter, Stratechery, First Round Review",
      "Practice product teardowns of apps you use daily",
      "Network with PMs and ask about their day-to-day responsibilities",
    ],
    Consulting: [
      "Join case competition clubs or practice groups",
      "Read business publications: WSJ, FT, The Economist",
      "Practice mental math and market sizing regularly",
      "Study the consulting recruiting process and firm differences",
    ],
  },
}

export const questionFeedback: Record<string, { strength: string; improvement: string; tip: string }[]> = {
  "Product Sense": [
    { strength: "Good user-centric approach", improvement: "Could have segmented users more clearly", tip: "Start with user personas before diving into solutions" },
    { strength: "Creative solution ideas", improvement: "Missing prioritization framework", tip: "Use RICE or ICE to prioritize features" },
    { strength: "Strong technical understanding", improvement: "Needs more business metrics focus", tip: "Always tie solutions to measurable outcomes" },
  ],
  "Case Interview": [
    { strength: "Solid structure to the problem", improvement: "Math calculation could be cleaner", tip: "Round numbers aggressively for easier mental math" },
    { strength: "Good hypothesis formation", improvement: "Could have pressure-tested assumptions", tip: "Ask 'what if?' to validate your assumptions" },
    { strength: "Clear recommendation", improvement: "Missing implementation roadmap", tip: "End with next steps and timeline" },
  ],
  Behavioral: [
    { strength: "Good STAR format usage", improvement: "Impact could be more quantified", tip: "Always include specific numbers and outcomes" },
    { strength: "Authentic storytelling", improvement: "Could be more concise", tip: "Aim for 2-3 minute responses max" },
    { strength: "Clear leadership examples", improvement: "Missing reflection on learnings", tip: "Always end with what you learned" },
  ],
  Estimation: [
    { strength: "Logical breakdown of the problem", improvement: "Assumptions could be stated earlier", tip: "State assumptions upfront before calculating" },
    { strength: "Good sanity checking", improvement: "Could use multiple approaches to validate", tip: "Try top-down and bottom-up to triangulate" },
    { strength: "Clear communication of approach", improvement: "Math could be shown more clearly", tip: "Talk through each calculation step by step" },
  ],
}
