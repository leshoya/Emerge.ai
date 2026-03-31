export const currentRoles = [
  { id: "Software Engineer", label: "Software Engineer", description: "Working as a software developer" },
  { id: "CS Student", label: "CS Student", description: "Currently studying computer science" },
]

export const targetRoleCategories = {
  "Product Management": [
    { id: "Product Manager", label: "Product Manager", description: "Lead product strategy at tech companies" },
    { id: "Associate PM (APM)", label: "Associate PM (APM)", description: "Entry-level PM at Google, Meta, etc." },
    { id: "Product Analyst", label: "Product Analyst", description: "Data-driven product decisions" },
    { id: "Strategy & Ops", label: "Strategy & Ops", description: "Business strategy and operations" },
  ],
  Consulting: [
    { id: "Management Consultant", label: "Management Consultant", description: "MBB and Big 4 consulting" },
    { id: "Business Analyst", label: "Business Analyst", description: "Entry-level consulting role" },
    { id: "Strategy Consultant", label: "Strategy Consultant", description: "Corporate strategy focus" },
    { id: "Tech Consultant", label: "Tech Consultant", description: "Technology advisory roles" },
  ],
}

export const companies: Record<string, string[]> = {
  "Product Management": [
    "Google", "Meta", "Amazon", "Apple", "Microsoft", "Stripe", "Airbnb",
    "Uber", "Netflix", "Spotify", "Salesforce", "LinkedIn",
  ],
  Consulting: [
    "McKinsey", "BCG", "Bain", "Deloitte", "Accenture", "EY-Parthenon",
    "Kearney", "Oliver Wyman", "Roland Berger", "L.E.K. Consulting", "Strategy&", "Alvarez & Marsal",
  ],
}

export const interviewTypes = ["Product Sense", "Case Interview", "Behavioral", "Estimation"]
export const difficulties = ["Entry", "Mid-Level", "Senior"]
export const lengths = [
  { label: "Quick (3 questions)", value: 3 },
  { label: "Standard (5 questions)", value: 5 },
  { label: "Full (8 questions)", value: 8 },
]

export const skillMappings: Record<string, Record<string, { transferable: string[]; toLearn: string[] }>> = {
  "Software Engineer": {
    "Product Management": {
      transferable: ["Technical depth", "System design thinking", "Data analysis", "Agile methodology"],
      toLearn: ["User research", "Go-to-market strategy", "Stakeholder management", "Roadmap prioritization"],
    },
    Consulting: {
      transferable: ["Problem decomposition", "Analytical thinking", "Technical expertise", "Project delivery"],
      toLearn: ["Business frameworks", "Client communication", "Slide storytelling", "Case math"],
    },
  },
  "CS Student": {
    "Product Management": {
      transferable: ["Technical understanding", "Logical thinking", "Project experience", "Curiosity"],
      toLearn: ["Industry knowledge", "Product intuition", "Business metrics", "Communication skills"],
    },
    Consulting: {
      transferable: ["Problem solving", "Analytical skills", "Quick learning", "Team projects"],
      toLearn: ["Business fundamentals", "Case frameworks", "Professional communication", "Industry expertise"],
    },
  },
}

export const roleExpectations: Record<string, { skills: string[]; behaviors: string[]; mistakes: string[] }> = {
  "Product Manager": {
    skills: ["Product sense", "Data analysis", "Technical communication", "User empathy"],
    behaviors: ["Structured thinking", "Customer obsession", "Bias for action", "Collaborative leadership"],
    mistakes: ["Jumping to solutions", "Ignoring constraints", "Weak prioritization", "No metrics focus"],
  },
  "Associate PM (APM)": {
    skills: ["Analytical ability", "Communication", "Technical aptitude", "Curiosity"],
    behaviors: ["Fast learning", "Ownership mentality", "Cross-functional collaboration", "User focus"],
    mistakes: ["Over-engineering answers", "Not asking clarifying questions", "Ignoring business impact"],
  },
  "Product Analyst": {
    skills: ["SQL & data tools", "A/B testing", "Metrics definition", "Statistical analysis"],
    behaviors: ["Proactive insight sharing", "Collaboration with PMs", "Attention to detail"],
    mistakes: ["Analysis without recommendation", "Missing the business context", "Over-complicating"],
  },
  "Strategy & Ops": {
    skills: ["Process optimization", "Cross-functional coordination", "Data analysis", "Project management"],
    behaviors: ["Systems thinking", "Stakeholder management", "Execution focus"],
    mistakes: ["Focusing on tactics over strategy", "Poor prioritization", "Lack of measurable outcomes"],
  },
  "Management Consultant": {
    skills: ["Structured problem solving", "Quantitative analysis", "Communication", "Business acumen"],
    behaviors: ["Hypothesis-driven", "MECE thinking", "Executive presence", "Adaptability"],
    mistakes: ["Boiling the ocean", "Weak math", "No clear recommendation", "Poor structure"],
  },
  "Business Analyst": {
    skills: ["Data analysis", "Problem structuring", "Presentation", "Excel/modeling"],
    behaviors: ["Detail orientation", "Initiative", "Team collaboration", "Client focus"],
    mistakes: ["Missing the big picture", "Weak synthesis", "Poor time management"],
  },
  "Strategy Consultant": {
    skills: ["Market analysis", "Competitive strategy", "Financial modeling", "Executive communication"],
    behaviors: ["Big picture thinking", "Persuasive communication", "Client relationship building"],
    mistakes: ["Lack of actionable recommendations", "Ignoring implementation", "Weak evidence"],
  },
  "Tech Consultant": {
    skills: ["Technical architecture", "Digital transformation", "Vendor evaluation", "Implementation planning"],
    behaviors: ["Bridging tech and business", "Stakeholder alignment", "Risk assessment"],
    mistakes: ["Over-focusing on technology", "Ignoring change management", "Poor estimation"],
  },
}
