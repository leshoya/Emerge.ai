export const interviewQuestions: Record<string, Record<string, string[]>> = {
  "Product Sense": {
    Entry: [
      "Given your software engineering background, how would you approach improving a developer tool like GitHub? What technical considerations would influence your product decisions?",
      "As someone with CS experience, how would you design a product that helps developers collaborate more effectively? Walk me through how your technical knowledge informs your product thinking.",
      "As someone transitioning from engineering to PM, how would you leverage your understanding of system architecture and technical constraints when prioritizing features for a developer-facing product?",
    ],
    "Mid-Level": [
      "How would you improve Instagram for creators?",
      "Design a feature to increase engagement on LinkedIn.",
      "A PM comes to you saying DAUs dropped 10%. How do you investigate?",
      "How would you prioritize between these three features for Spotify?",
      "What's your framework for deciding whether to build vs buy?",
    ],
    Senior: [
      "How would you improve Instagram for creators?",
      "Design a strategy for Google to compete with TikTok.",
      "You're the PM for Gmail. Revenue is flat. What do you do?",
      "How would you build a 3-year product roadmap for Uber Eats?",
      "Walk me through how you'd launch a new product in an emerging market.",
      "How do you balance technical debt with new feature development?",
      "Describe how you'd handle a situation where engineering and design disagree.",
      "What's your approach to building products in highly regulated industries?",
    ],
  },
  "Case Interview": {
    Entry: [
      "Estimate the market size for electric scooters in San Francisco.",
      "A coffee shop chain is seeing declining profits. What would you investigate?",
      "Should a tech company enter the healthcare market?",
    ],
    "Mid-Level": [
      "Estimate the market size for electric scooters in San Francisco.",
      "A retail client's profits dropped 20%. Walk me through your approach.",
      "Should a private equity firm acquire this SaaS company?",
      "How would you help a bank reduce customer churn?",
      "A manufacturing client wants to expand to Asia. What's your recommendation?",
    ],
    Senior: [
      "Estimate the market size for electric scooters in San Francisco.",
      "A Fortune 500 client is considering a major digital transformation. Structure your approach.",
      "Private equity firm is evaluating a $2B acquisition. Walk me through due diligence.",
      "How would you help a traditional automaker transition to EVs?",
      "A healthcare client wants to reduce costs by 30%. What's your strategy?",
      "Structure a market entry strategy for a fintech entering Southeast Asia.",
      "A client's M&A integration is failing. How would you turn it around?",
      "How would you advise a media company on their streaming strategy?",
    ],
  },
  Behavioral: {
    Entry: [
      "Tell me about yourself and why you're interested in product management.",
      "Describe a time you worked on a team project. What was your role?",
      "Why are you transitioning from engineering to PM/consulting?",
    ],
    "Mid-Level": [
      "Tell me about yourself and your journey into product/consulting.",
      "Describe a time you had to influence without authority.",
      "Tell me about a product you shipped and what you learned.",
      "How do you handle disagreements with stakeholders?",
      "Describe a time you had to make a decision with incomplete data.",
    ],
    Senior: [
      "Walk me through your career and key transitions.",
      "Tell me about the most impactful product you've built.",
      "Describe a time you had to pivot a product strategy.",
      "How do you build and develop high-performing teams?",
      "Tell me about a time you failed and what you learned.",
      "How do you balance short-term wins with long-term vision?",
      "Describe a difficult stakeholder situation and how you resolved it.",
      "What's your philosophy on product leadership?",
    ],
  },
  Estimation: {
    Entry: [
      "How many golf balls fit in a school bus?",
      "Estimate the number of Uber rides in NYC per day.",
      "How much revenue does Starbucks make in Manhattan annually?",
    ],
    "Mid-Level": [
      "How many golf balls fit in a school bus?",
      "Estimate the market size for food delivery in the US.",
      "How many iPhone chargers are sold globally each year?",
      "What's the TAM for a B2B SaaS tool for restaurants?",
      "Estimate Google's cloud revenue.",
    ],
    Senior: [
      "How many golf balls fit in a school bus?",
      "Estimate the economic impact of remote work on commercial real estate.",
      "What's the market opportunity for autonomous delivery robots?",
      "Size the market for enterprise AI tools.",
      "Estimate the revenue potential of a new fintech product in Brazil.",
      "How would you size the opportunity for a healthcare AI startup?",
      "Estimate the cost savings of migrating a Fortune 500 to the cloud.",
      "What's the TAM for sustainable packaging in e-commerce?",
    ],
  },
}

export const followUpQuestions: Record<string, string[]> = {
  "Product Sense": [
    "Can you elaborate on who the target user is?",
    "What metrics would you use to measure success?",
    "How would you prioritize this against other features?",
    "What are the potential risks or downsides?",
    "Can you walk me through the user journey?",
  ],
  "Case Interview": [
    "Can you structure your approach more clearly?",
    "What assumptions are you making here?",
    "Can you quantify that estimate?",
    "What would you need to validate this hypothesis?",
    "How would you present this to the client?",
  ],
  Behavioral: [
    "Can you give me a more specific example?",
    "What was the outcome of that situation?",
    "What would you do differently next time?",
    "How did that experience shape your approach?",
    "What did you learn from that?",
  ],
  Estimation: [
    "Can you break that down further?",
    "What's driving that number?",
    "How would you validate this estimate?",
    "What's the range of uncertainty here?",
    "Are there any factors you might be missing?",
  ],
}
