"use client";

import { useState, useMemo, useEffect } from "react";
import {
  jargonData,
  categoryLabels,
  categoryColors,
  Category,
  JargonEntry,
} from "@/data/jargon";
import RandomRejection from "@/components/RandomRejection";
import BingoCard from "@/components/BingoCard";
import RateRejections from "@/components/RateRejections";
import Quiz from "@/components/Quiz";

// ─── Fallback sarcastic translations for unmatched input ───

const fallbackTranslations = {
  positive: [
    "Translation: They're being nice because saying 'no' directly would make them feel bad about themselves.",
    "Translation: This is the VC equivalent of 'it's not you, it's me.' It's definitely you.",
    "Translation: They rehearsed this exact phrasing to sound warm while meaning absolutely nothing.",
    "Translation: If a VC sounds enthusiastic but doesn't mention a check size, they're not enthusiastic.",
    "Translation: The warmth of this message is inversely proportional to their interest in investing.",
  ],
  negative: [
    "Translation: At least they were honest. This is the VC equivalent of ripping off a Band-Aid.",
    "Translation: The rare VC who tells you what they actually think. Respect the honesty, hate the message.",
    "Translation: This is actually refreshing — most VCs would've wrapped this in three layers of fake excitement first.",
  ],
  vague: [
    "Translation: This is deliberately vague so they can claim they were interested if you succeed and never followed up if you don't.",
    "Translation: If you can't tell whether this is a yes or a no, it's a no.",
    "Translation: This was written by someone who has perfected the art of saying nothing in many words.",
    "Translation: The vaguer the VC, the less interested they are. This is fog-machine-level vague.",
    "Translation: They spent more time wordsmithing this non-answer than they did looking at your deck.",
  ],
  followup: [
    "Translation: 'Getting back to you' is VC code for 'forgetting about you within 24 hours.'",
    "Translation: The probability of them actually following up is roughly the same as your odds of winning the lottery.",
    "Translation: They will not get back to you. You will follow up. They will not respond. This is the way.",
    "Translation: 'I'll circle back' is the corporate cousin of 'I'll call you.' Nobody's calling anybody.",
  ],
  meeting: [
    "Translation: The meeting went fine. 'Fine' in VC means they've already mentally moved on to their next one.",
    "Translation: They took the meeting because someone they respect intro'd you. That goodwill expires in about 48 hours.",
    "Translation: Any meeting that doesn't end with 'let me send you a term sheet' is basically a rejection with better catering.",
  ],
  generic: [
    "Translation: Whatever they said, what they meant is: 'We need to see if anyone else is investing first so we can pretend we had conviction all along.'",
    "Translation: In VC, words are decorative. The only thing that matters is whether they wire money. Everything else is theater.",
    "Translation: This is classic VC-speak — professionally warm, strategically meaningless, and engineered to keep you hopeful without committing to anything.",
    "Translation: Run this through any VC decoder and the answer is the same: they're buying time while they figure out if you're going to be huge without them.",
    "Translation: A VC once told me: 'If we're excited, you'll know because we won't shut up about term sheets.' Silence and pleasantries? That's a no.",
    "Translation: The effort-to-interest ratio in VC communications is inverted. The more effort they put into being nice, the less interested they are.",
  ],
};

function generateFallback(input: string): { translation: string; category: string } {
  const lower = input.toLowerCase();
  const positiveWords = ["love", "great", "excited", "amazing", "fantastic", "awesome", "impressive", "incredible", "wonderful", "brilliant", "strong", "interesting"];
  const negativeWords = ["pass", "unfortunately", "not a fit", "decline", "won't be", "can't", "don't think", "not right", "not aligned"];
  const followupWords = ["get back", "follow up", "circle back", "touch base", "reconnect", "reach out", "check in", "run through", "review", "look into"];
  const meetingWords = ["meeting", "call", "chat", "coffee", "catch up", "sit down", "discuss", "presentation", "pitch"];
  const vagueWords = ["maybe", "potentially", "possibly", "might", "could", "exploring", "considering", "thinking about", "looking at"];

  let pool: string[];
  let category: string;

  if (followupWords.some((w) => lower.includes(w))) {
    pool = fallbackTranslations.followup;
    category = "Stalling";
  } else if (negativeWords.some((w) => lower.includes(w))) {
    pool = fallbackTranslations.negative;
    category = "Rejection";
  } else if (positiveWords.some((w) => lower.includes(w))) {
    pool = fallbackTranslations.positive;
    category = "Soft Pass";
  } else if (meetingWords.some((w) => lower.includes(w))) {
    pool = fallbackTranslations.meeting;
    category = "Pitch Meeting";
  } else if (vagueWords.some((w) => lower.includes(w))) {
    pool = fallbackTranslations.vague;
    category = "Stalling";
  } else {
    pool = fallbackTranslations.generic;
    category = "Classic VC";
  }

  return { translation: pool[Math.floor(Math.random() * pool.length)], category };
}

// ─── Matching logic ───

const loadingMessages = [
  "Decoding VC speak...",
  "Removing the fluff...",
  "Reading between the lines...",
  "Translating corporate to human...",
  "Stripping the niceties...",
  "Detecting passive aggression...",
  "Consulting the BS detector...",
  "Cross-referencing with rejection database...",
];

const STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "it", "its", "he", "she",
  "they", "them", "this", "that", "what", "which", "who", "whom",
  "a", "an", "the", "and", "but", "or", "so", "if", "then",
  "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "can", "may", "might", "shall", "must",
  "to", "of", "in", "for", "on", "with", "at", "by", "from", "up",
  "about", "into", "through", "during", "before", "after",
  "not", "no", "nor", "just", "also", "very", "too", "quite",
  "let", "get", "got", "go", "going", "come", "here", "there",
  "how", "when", "where", "why", "all", "each", "every", "some",
  "any", "few", "more", "most", "other", "than", "out", "over",
  "hey", "hi", "hello", "thanks", "thank", "please",
]);

function getSignificantWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s'-]/g, "").split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

interface TranslationResult {
  type: "match" | "fallback";
  entry?: JargonEntry;
  fallbackTranslation?: string;
  fallbackCategory?: string;
  originalText: string;
}

function matchJargon(input: string): TranslationResult[] {
  const lower = input.toLowerCase().trim();
  if (!lower) return [];

  const inputSignificant = getSignificantWords(input);
  const scored = jargonData
    .map((entry) => {
      const phraseLower = entry.phrase.toLowerCase();
      if (lower.includes(phraseLower)) return { entry, score: 200 + entry.phrase.length };
      const phraseSignificant = getSignificantWords(entry.phrase);
      if (phraseSignificant.length === 0) return { entry, score: 0 };
      const matchedWords = phraseSignificant.filter((pw) =>
        inputSignificant.some((iw) => iw === pw || (pw.length > 4 && iw.startsWith(pw.slice(0, -1))))
      );
      const overlapRatio = matchedWords.length / phraseSignificant.length;
      if (overlapRatio >= 0.6 && matchedWords.length >= 2) return { entry, score: overlapRatio * 50 + matchedWords.length * 5 };
      return { entry, score: 0 };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, 5).map((s) => ({ type: "match" as const, entry: s.entry, originalText: input }));
  }

  const fallback = generateFallback(input);
  return [{ type: "fallback" as const, fallbackTranslation: fallback.translation, fallbackCategory: fallback.category, originalText: input }];
}

// ─── Example phrases ───

const examplePhrases = [
  "We'd love to stay in touch",
  "The space is a bit crowded",
  "Let me bring this to the partnership",
  "We're founder-friendly",
  "Come back when you have more traction",
  "We invest in lines, not dots",
  "The valuation is a bit rich",
  "We've been tracking this space",
];

// ─── Random daily phrase ───

function getDailyPhrase() {
  const day = new Date().getDate();
  const idx = day % jargonData.length;
  return jargonData[idx];
}

// ─── Components ───

function TypingExample() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = examplePhrases[currentIndex];
    let timeout: NodeJS.Timeout;
    if (!isDeleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
    } else if (!isDeleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setCurrentIndex((i) => (i + 1) % examplePhrases.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentIndex]);

  return (
    <span className="text-white/60">
      {displayed}
      <span className="inline-block w-0.5 h-5 bg-white/40 ml-0.5 animate-pulse align-middle" />
    </span>
  );
}

function TranslatorSection() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasTranslated, setHasTranslated] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleTranslate = () => {
    if (!input.trim()) return;
    setIsTranslating(true);
    setLoadingMsg(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    const interval = setInterval(() => {
      setLoadingMsg(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 400);
    setTimeout(() => {
      clearInterval(interval);
      setResults(matchJargon(input));
      setIsTranslating(false);
      setHasTranslated(true);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTranslate();
  };

  const handleShare = (phrase: string, translation: string) => {
    const text = `VC: "${phrase}"\n\nTranslation: "${translation}"\n\nvia @Trace_Cohen`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-0">
      {/* Input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="w-full h-32 sm:h-40 bg-white/[0.05] border border-white/15 rounded-2xl p-5 sm:p-6 text-base sm:text-lg text-white resize-none focus:outline-none focus:border-white/25 transition-all duration-300"
          />
          {!input && (
            <div className="absolute top-5 sm:top-6 left-5 sm:left-6 pointer-events-none text-base sm:text-lg">
              <TypingExample />
            </div>
          )}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
            <span className="text-white/25 text-xs hidden sm:block">{"\u2318"}+Enter</span>
            <button
              onClick={handleTranslate}
              disabled={!input.trim() || isTranslating}
              className="px-5 sm:px-7 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl text-sm sm:text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed glow-btn hover:shadow-red-500/25"
            >
              {isTranslating ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="hidden sm:inline">{loadingMsg}</span>
                  <span className="sm:hidden">Scanning...</span>
                </span>
              ) : "Translate"}
            </button>
          </div>
        </div>
      </div>

      {/* Scanning animation */}
      {isTranslating && (
        <div className="mt-6 relative overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] p-6 sm:p-8 scan-line">
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-1.5 h-8 bg-red-500/60 rounded-full" style={{ animation: `float 1s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
            <p className="text-white/60 text-sm ml-2">{loadingMsg}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasTranslated && !isTranslating && (
        <div className="mt-6 sm:mt-8 space-y-4">
          {results.map((result, i) => {
            if (result.type === "match" && result.entry) {
              const entry = result.entry;
              return (
                <div
                  key={i}
                  className="animate-fade-in-up card-hover bg-white/[0.05] border border-white/15 rounded-2xl overflow-hidden"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  {/* Two-column on desktop, stacked on mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 relative">
                    <div className="p-5 sm:p-6 animate-slide-left" style={{ animationDelay: `${i * 0.1 + 0.2}s`, opacity: 0 }}>
                      <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        What they said
                      </p>
                      <p className="text-white text-base sm:text-lg leading-relaxed">
                        &quot;{entry.phrase}&quot;
                      </p>
                    </div>

                    {/* Arrow - desktop only */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-10 h-10 rounded-full bg-[#111] border border-white/15 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>

                    {/* Arrow - mobile only */}
                    <div className="flex md:hidden items-center justify-center py-1">
                      <div className="w-8 h-8 rounded-full bg-[#111] border border-white/15 flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 bg-white/[0.06] border-t md:border-t-0 md:border-l border-white/20 animate-slide-right" style={{ animationDelay: `${i * 0.1 + 0.3}s`, opacity: 0 }}>
                      <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        What they meant
                      </p>
                      <p className="text-white text-base sm:text-lg leading-relaxed">
                        &quot;{entry.translation}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-white/20 bg-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${categoryColors[entry.category]}`}>
                        {categoryLabels[entry.category]}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div key={si} className={`w-2 h-2 rounded-full ${si < entry.severity ? "bg-red-500" : "bg-white/15"}`} />
                        ))}
                        <span className="text-red-400 text-xs ml-1.5">Brutality</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShare(entry.phrase, entry.translation)}
                      className="text-white/70 hover:text-white text-sm transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              );
            }

            // Fallback
            return (
              <div key={i} className="animate-scale-in card-hover" style={{ opacity: 0 }}>
                <div className="relative bg-gradient-to-br from-red-500/10 via-[#111] to-orange-500/10 border border-white/15 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 shimmer-bg pointer-events-none" />
                  <div className="relative p-5 sm:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center animate-float">
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 text-xs font-medium rounded-full border border-red-500/30 bg-red-500/20 text-red-400">
                          {result.fallbackCategory}
                        </span>
                        <span className="text-red-400 text-xs">BS Detector triggered</span>
                      </div>
                    </div>

                    <div className="mb-5 pl-4 border-l-2 border-white/15">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">They wrote</p>
                      <p className="text-white/80 text-sm sm:text-base italic leading-relaxed">
                        &quot;{result.originalText}&quot;
                      </p>
                    </div>

                    <div className="bg-white/[0.05] rounded-xl p-4 sm:p-5 border border-white/20">
                      <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        Decoded
                      </p>
                      <p className="text-white text-base sm:text-lg leading-relaxed">
                        {result.fallbackTranslation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 sm:px-8 py-3 border-t border-white/20 bg-white/[0.06]">
                    <p className="text-white/70 text-xs">Not in our database — but we know the type</p>
                    <button
                      onClick={() => handleShare(result.originalText, result.fallbackTranslation || "")}
                      className="text-white/70 hover:text-white text-sm transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="text-center pt-4 animate-fade-in" style={{ animationDelay: "0.5s", opacity: 0 }}>
            <button
              onClick={() => { setInput(""); setHasTranslated(false); setResults([]); }}
              className="text-white/70 hover:text-white text-sm transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
            >
              Translate another
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function DictionarySection() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [visibleCount, setVisibleCount] = useState(15);

  const categories: (Category | "all")[] = ["all", "rejection", "stalling", "interest", "fomo", "negotiation", "fundraising", "pitch-meeting"];

  const filtered = useMemo(() => {
    return jargonData.filter((entry) => {
      const matchesCategory = activeCategory === "all" || entry.category === activeCategory;
      const matchesSearch = !search || entry.phrase.toLowerCase().includes(search.toLowerCase()) || entry.translation.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  useEffect(() => { setVisibleCount(15); }, [search, activeCategory]);

  const handleShare = (entry: JargonEntry) => {
    const text = `VC: "${entry.phrase}"\n\nTranslation: "${entry.translation}"\n\nvia @Trace_Cohen`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-0">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">The VC Dictionary</h2>
        <p className="text-white/60 text-base sm:text-lg">{jargonData.length} phrases. Zero BS.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phrases..."
            className="w-full bg-white/[0.05] border border-white/15 rounded-xl pl-12 pr-5 py-3.5 text-white placeholder-white/50 focus:outline-none focus:border-white/25 transition-all duration-300"
          />
        </div>
      </div>

      {/* Category filters — horizontal scroll on mobile */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-full border whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-transparent shadow-lg shadow-red-500/20"
                : "bg-white/[0.05] text-white/60 border-white/15 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat === "all"
              ? `All (${jargonData.length})`
              : `${categoryLabels[cat]} (${jargonData.filter((e) => e.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Dictionary */}
      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No phrases match your search.</p>
          </div>
        ) : (
          <>
            {filtered.slice(0, visibleCount).map((entry, i) => (
              <div
                key={`${entry.phrase}-${activeCategory}`}
                className="group card-hover bg-white/[0.05] border border-white/15 rounded-xl p-4 sm:p-5 animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s`, opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium mb-1.5 text-sm sm:text-base">
                      &quot;{entry.phrase}&quot;
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {entry.translation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[entry.category]}`}>
                      {categoryLabels[entry.category]}
                    </span>
                    <button
                      onClick={() => handleShare(entry)}
                      className="sm:opacity-0 sm:group-hover:opacity-100 text-white/70 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-lg"
                      title="Share on Twitter"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {visibleCount < filtered.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((c) => c + 15)}
                  className="px-6 py-2.5 bg-white/[0.05] border border-white/15 text-white/60 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all"
                >
                  Show more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Daily phrase of the day ───

function DailyPhrase() {
  const entry = getDailyPhrase();
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-12">
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-white/15 rounded-2xl p-5 sm:p-8 card-hover">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">&#x1F4AC;</span>
          <h3 className="text-white font-bold text-lg">VC Phrase of the Day</h3>
        </div>
        <p className="text-white text-lg sm:text-xl font-medium mb-3">
          &quot;{entry.phrase}&quot;
        </p>
        <p className="text-orange-300 text-base sm:text-lg leading-relaxed">
          {entry.translation}
        </p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${categoryColors[entry.category]}`}>
            {categoryLabels[entry.category]}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, si) => (
              <div key={si} className={`w-2 h-2 rounded-full ${si < entry.severity ? "bg-red-500" : "bg-white/15"}`} />
            ))}
            <span className="text-red-400 text-xs ml-1.5">Brutality</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Nav with features ───

function SectionNav() {
  const [activeSection, setActiveSection] = useState<"random" | "bingo" | "rate" | "quiz" | null>(null);

  const sections = [
    { key: "random" as const, label: "Random Rejection", icon: "&#x1F3B0;", desc: "Slot machine of pain" },
    { key: "bingo" as const, label: "Rejection Bingo", icon: "&#x1F4CB;", desc: "Check off what you've heard" },
    { key: "rate" as const, label: "Rate Rejections", icon: "&#x1F525;", desc: "Vote on the most brutal" },
    { key: "quiz" as const, label: "Guess the Meaning", icon: "&#x1F9E0;", desc: "10-question quiz" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 py-8">
      {/* Feature cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(activeSection === s.key ? null : s.key)}
            className={`p-4 rounded-xl border text-center transition-all duration-300 ${
              activeSection === s.key
                ? "bg-gradient-to-br from-red-500/15 to-orange-500/15 border-orange-500/30 scale-[0.97]"
                : "bg-white/[0.05] border-white/15 hover:bg-white/[0.08] hover:border-white/20"
            }`}
          >
            <p className="text-2xl mb-1.5" dangerouslySetInnerHTML={{ __html: s.icon }} />
            <p className={`text-sm font-semibold mb-0.5 ${activeSection === s.key ? "text-orange-300" : "text-white"}`}>
              {s.label}
            </p>
            <p className="text-white/70 text-xs">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Active section content */}
      {activeSection === "random" && <RandomRejection />}
      {activeSection === "bingo" && <BingoCard />}
      {activeSection === "rate" && <RateRejections />}
      {activeSection === "quiz" && <Quiz />}
    </div>
  );
}

// ─── Stats counter ───

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(current));
    }, 50);
    return () => clearInterval(interval);
  }, [target]);
  return <span>{count}</span>;
}

// ─── Main ───

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-red-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-orange-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative">
        {/* Hero */}
        <div className="pt-12 sm:pt-20 pb-6 text-center px-4">
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.06] border border-white/15 rounded-full text-white/70 text-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <AnimatedCounter target={jargonData.length} /> phrases decoded
          </div>
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-5 tracking-tight" style={{ animationDelay: "0.1s" }}>
            What VCs
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 animate-gradient">
              Actually Mean
            </span>
          </h1>
          <p className="animate-fade-in-up text-white/60 text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed" style={{ animationDelay: "0.2s", opacity: 0 }}>
            Paste a VC email, rejection, or meeting note.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Get the brutally honest translation.
          </p>
        </div>

        {/* Stats */}
        <div className="animate-fade-in-up flex justify-center gap-6 sm:gap-8 pb-10 sm:pb-12 pt-4 px-4" style={{ animationDelay: "0.3s", opacity: 0 }}>
          {[
            { label: "Rejections decoded", value: jargonData.filter((e) => e.category === "rejection").length },
            { label: "Stall tactics exposed", value: jargonData.filter((e) => e.category === "stalling").length },
            { label: "BS categories", value: 7 },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">
                <AnimatedCounter target={stat.value} />
              </p>
              <p className="text-white/70 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Translator */}
        <div className="pb-16 sm:pb-24 animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <TranslatorSection />
        </div>

        {/* Daily phrase */}
        <DailyPhrase />

        {/* Section nav */}
        <SectionNav />

        {/* Divider */}
        <div className="w-full flex items-center justify-center py-4">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        {/* Dictionary */}
        <div className="py-16 sm:py-20">
          <DictionarySection />
        </div>

        {/* Footer */}
        <footer className="border-t border-white/15 py-8 px-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/70 text-sm">
              Built for founders tired of decoding VC emails.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors text-sm">
                Twitter
              </a>
              <a href="mailto:t@nyvp.com" className="text-white/70 hover:text-white transition-colors text-sm">
                t@nyvp.com
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
