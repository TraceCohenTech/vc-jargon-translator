export type Category =
  | "rejection"
  | "interest"
  | "stalling"
  | "fomo"
  | "negotiation"
  | "fundraising"
  | "pitch-meeting";

export interface JargonEntry {
  phrase: string;
  translation: string;
  category: Category;
  severity: number; // 1-5, how brutal the real meaning is
  tags: string[];
}

export const jargonData: JargonEntry[] = [
  // REJECTIONS
  {
    phrase: "We'd love to stay in touch",
    translation: "We're passing but don't want to burn the bridge in case you blow up",
    category: "rejection",
    severity: 3,
    tags: ["email", "meeting-followup"],
  },
  {
    phrase: "We're not leading rounds right now",
    translation: "We don't have conviction, but if someone else does, we might pile on",
    category: "rejection",
    severity: 3,
    tags: ["email", "call"],
  },
  {
    phrase: "The space is a bit crowded",
    translation: "We already funded your competitor",
    category: "rejection",
    severity: 4,
    tags: ["email", "pitch-meeting"],
  },
  {
    phrase: "Come back when you have more traction",
    translation: "No. But we want to seem helpful",
    category: "rejection",
    severity: 5,
    tags: ["email", "meeting-followup"],
  },
  {
    phrase: "We love the team",
    translation: "The product isn't working and neither is the business model",
    category: "rejection",
    severity: 4,
    tags: ["pitch-meeting", "email"],
  },
  {
    phrase: "Interesting unit economics",
    translation: "You're burning cash at an alarming rate",
    category: "rejection",
    severity: 4,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "We need to see a few more months of data",
    translation: "We're not convinced and probably never will be",
    category: "rejection",
    severity: 3,
    tags: ["email", "meeting-followup"],
  },
  {
    phrase: "This is a bit early for us",
    translation: "We think this might fail and don't want to find out firsthand",
    category: "rejection",
    severity: 4,
    tags: ["email", "pitch-meeting"],
  },
  {
    phrase: "We have some concerns about the market size",
    translation: "This isn't a billion-dollar outcome so we literally cannot care",
    category: "rejection",
    severity: 5,
    tags: ["pitch-meeting", "email"],
  },
  {
    phrase: "Let me introduce you to someone on our platform team",
    translation: "I'm passing you to someone less important so I don't have to say no directly",
    category: "rejection",
    severity: 3,
    tags: ["email"],
  },
  {
    phrase: "We're going to pass for now",
    translation: "We're going to pass forever but 'for now' makes it sound temporary",
    category: "rejection",
    severity: 5,
    tags: ["email"],
  },
  {
    phrase: "We really struggled with this one internally",
    translation: "It took us about 30 seconds to decide no, but we want you to feel respected",
    category: "rejection",
    severity: 5,
    tags: ["email"],
  },
  {
    phrase: "We just don't have bandwidth right now",
    translation: "We have bandwidth, just not for you",
    category: "rejection",
    severity: 4,
    tags: ["email"],
  },
  {
    phrase: "Keep us posted on your progress",
    translation: "We want to watch from the sidelines. If you 10x, we'll pretend we were always interested",
    category: "rejection",
    severity: 4,
    tags: ["email", "meeting-followup"],
  },
  {
    phrase: "The timing isn't quite right for us",
    translation: "There is no right timing. This is a no",
    category: "rejection",
    severity: 4,
    tags: ["email"],
  },

  // STALLING
  {
    phrase: "Let me bring this to the partnership",
    translation: "I need to get permission from the people who actually write checks",
    category: "stalling",
    severity: 2,
    tags: ["meeting-followup"],
  },
  {
    phrase: "We're still doing diligence",
    translation: "We haven't thought about you since our last call",
    category: "stalling",
    severity: 3,
    tags: ["email"],
  },
  {
    phrase: "Can you send over a few more data points?",
    translation: "We're procrastinating on making a decision",
    category: "stalling",
    severity: 3,
    tags: ["email"],
  },
  {
    phrase: "We have a partners meeting next Monday",
    translation: "Your deal might get 3 minutes of airtime between lunch plans and portfolio updates",
    category: "stalling",
    severity: 3,
    tags: ["email", "call"],
  },
  {
    phrase: "Let me loop in my colleague who covers this space",
    translation: "I don't understand your business. Maybe they will",
    category: "stalling",
    severity: 2,
    tags: ["email", "pitch-meeting"],
  },
  {
    phrase: "We're wrapping up a fund right now",
    translation: "We might literally not have money to invest, or we just need an excuse",
    category: "stalling",
    severity: 3,
    tags: ["email"],
  },
  {
    phrase: "Circle back in Q3",
    translation: "I will not remember this conversation by Q3",
    category: "stalling",
    severity: 4,
    tags: ["email", "call"],
  },

  // INTEREST
  {
    phrase: "We'd like to preempt",
    translation: "We want to invest before anyone else realizes this is good and drives up the price",
    category: "interest",
    severity: 1,
    tags: ["email", "call"],
  },
  {
    phrase: "What does the cap table look like?",
    translation: "We're actually interested. How much is already spoken for?",
    category: "interest",
    severity: 1,
    tags: ["pitch-meeting", "call"],
  },
  {
    phrase: "Can we get some time with the technical co-founder?",
    translation: "We're seriously considering this and want to make sure the tech is real",
    category: "interest",
    severity: 1,
    tags: ["meeting-followup"],
  },
  {
    phrase: "How much room is left in the round?",
    translation: "We want in. Please say there's still room",
    category: "interest",
    severity: 1,
    tags: ["email", "call"],
  },
  {
    phrase: "We'd love to spend more time with the team",
    translation: "We're doing real diligence. This is not a brush-off",
    category: "interest",
    severity: 1,
    tags: ["meeting-followup"],
  },
  {
    phrase: "Who else is in the round?",
    translation: "We need social proof before we commit our own money",
    category: "interest",
    severity: 2,
    tags: ["pitch-meeting", "call"],
  },

  // FOMO
  {
    phrase: "We've been tracking this space for a while",
    translation: "We googled your market last night after seeing your deck",
    category: "fomo",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "Are you talking to other investors?",
    translation: "Please create urgency so I can pressure my partners into a faster decision",
    category: "fomo",
    severity: 2,
    tags: ["pitch-meeting", "call"],
  },
  {
    phrase: "We don't want to miss this one",
    translation: "Other VCs are interested and now I'm scared",
    category: "fomo",
    severity: 2,
    tags: ["call"],
  },
  {
    phrase: "Our portfolio company in this space could be a great partner",
    translation: "We funded your competitor and now we're hedging by getting close to you too",
    category: "fomo",
    severity: 3,
    tags: ["pitch-meeting", "email"],
  },

  // NEGOTIATION
  {
    phrase: "The valuation is a bit rich",
    translation: "We want a bigger slice for less money",
    category: "negotiation",
    severity: 3,
    tags: ["email", "call"],
  },
  {
    phrase: "We'd want a board seat",
    translation: "We want control and to tell you how to run your company",
    category: "negotiation",
    severity: 3,
    tags: ["email", "call"],
  },
  {
    phrase: "We typically take pro-rata",
    translation: "We will fight to maintain our ownership in every future round whether you want us to or not",
    category: "negotiation",
    severity: 3,
    tags: ["email"],
  },
  {
    phrase: "We like to be hands-on",
    translation: "We will Slack you at 11pm asking about metrics",
    category: "negotiation",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "We think the option pool should be expanded",
    translation: "We want to dilute you before we invest so our price is effectively lower",
    category: "negotiation",
    severity: 4,
    tags: ["email", "call"],
  },
  {
    phrase: "Let's structure this as a SAFE for now",
    translation: "We want optionality to see if this works before committing to a real valuation",
    category: "negotiation",
    severity: 2,
    tags: ["email", "call"],
  },

  // FUNDRAISING
  {
    phrase: "We have deep expertise in this vertical",
    translation: "We invested in one company in this space three years ago",
    category: "fundraising",
    severity: 3,
    tags: ["pitch-meeting", "email"],
  },
  {
    phrase: "We're founder-friendly",
    translation: "Until things go wrong, then we're board-friendly",
    category: "fundraising",
    severity: 4,
    tags: ["pitch-meeting", "email"],
  },
  {
    phrase: "We add value beyond just capital",
    translation: "We'll send you intros you didn't ask for and schedule quarterly board meetings",
    category: "fundraising",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "We have a strong network of operators",
    translation: "We have a Notion doc of people who said they'd take calls sometimes",
    category: "fundraising",
    severity: 3,
    tags: ["pitch-meeting", "email"],
  },
  {
    phrase: "We write checks from $500K to $5M",
    translation: "We write $500K checks. The $5M is technically possible but has happened once",
    category: "fundraising",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "We're a value-add investor",
    translation: "We will forward you TechCrunch articles about your own industry",
    category: "fundraising",
    severity: 4,
    tags: ["pitch-meeting", "email"],
  },

  // PITCH MEETING
  {
    phrase: "Walk me through the competitive landscape",
    translation: "I want to see if you know who else is out there, and honestly I might invest in them instead",
    category: "pitch-meeting",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "How do you think about defensibility?",
    translation: "What stops Google from building this over a weekend?",
    category: "pitch-meeting",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "That's a really interesting approach",
    translation: "I have no idea if this will work",
    category: "pitch-meeting",
    severity: 2,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "What keeps you up at night?",
    translation: "I want to hear you say the thing I'm already worried about",
    category: "pitch-meeting",
    severity: 2,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "How did you arrive at this valuation?",
    translation: "Your valuation is too high. Justify it so I can argue it down",
    category: "pitch-meeting",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "Tell me about your unfair advantage",
    translation: "Please convince me why a well-funded competitor can't just crush you",
    category: "pitch-meeting",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "We invest in lines, not dots",
    translation: "Show me a trend line going up and to the right or we're done here",
    category: "pitch-meeting",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "Your TAM seems conservative",
    translation: "Make the number bigger so I can put it in my investment memo",
    category: "pitch-meeting",
    severity: 2,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "What does the path to profitability look like?",
    translation: "When will you stop burning my money?",
    category: "pitch-meeting",
    severity: 3,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "We love backing technical founders",
    translation: "We want founders who build the product themselves so we don't have to fund a big engineering team",
    category: "pitch-meeting",
    severity: 2,
    tags: ["pitch-meeting"],
  },
  {
    phrase: "Send me the deck and I'll share it with the team",
    translation: "I need something to forward so it looks like I'm doing work",
    category: "pitch-meeting",
    severity: 2,
    tags: ["pitch-meeting", "email"],
  },
];

export const categoryLabels: Record<Category, string> = {
  rejection: "Rejection",
  interest: "Genuine Interest",
  stalling: "Stalling",
  fomo: "FOMO",
  negotiation: "Negotiation",
  fundraising: "VC Self-Promotion",
  "pitch-meeting": "Pitch Meeting",
};

export const categoryColors: Record<Category, string> = {
  rejection: "bg-red-500/20 text-red-400 border-red-500/30",
  interest: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  stalling: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  fomo: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  negotiation: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  fundraising: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "pitch-meeting": "bg-pink-500/20 text-pink-400 border-pink-500/30",
};
