"use client";

import { useState, useMemo } from "react";
import {
  jargonData,
  categoryLabels,
  categoryColors,
  Category,
  JargonEntry,
} from "@/data/jargon";

const loadingMessages = [
  "Decoding VC speak...",
  "Removing the fluff...",
  "Reading between the lines...",
  "Translating corporate to human...",
  "Stripping the niceties...",
  "Detecting passive aggression...",
];

function matchJargon(input: string): JargonEntry[] {
  const lower = input.toLowerCase().trim();
  if (!lower) return [];

  const scored = jargonData
    .map((entry) => {
      const phraseLower = entry.phrase.toLowerCase();
      // Exact match
      if (lower.includes(phraseLower)) {
        return { entry, score: 100 + entry.phrase.length };
      }
      // Word overlap scoring
      const inputWords = lower.split(/\s+/);
      const phraseWords = phraseLower.split(/\s+/);
      const matchedWords = phraseWords.filter((w) =>
        inputWords.some(
          (iw) => iw === w || iw.includes(w) || w.includes(iw)
        )
      );
      const overlapRatio = matchedWords.length / phraseWords.length;
      if (overlapRatio >= 0.5) {
        return { entry, score: overlapRatio * 50 };
      }
      return { entry, score: 0 };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.entry);
}

function TranslatorSection() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<JargonEntry[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasTranslated, setHasTranslated] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleTranslate = () => {
    if (!input.trim()) return;
    setIsTranslating(true);
    setLoadingMsg(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    );

    setTimeout(() => {
      const matches = matchJargon(input);
      setResults(matches);
      setIsTranslating(false);
      setHasTranslated(true);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleTranslate();
    }
  };

  const handleShare = (entry: JargonEntry) => {
    const text = `VC: "${entry.phrase}"\n\nTranslation: "${entry.translation}"\n\nvia @Trace_Cohen`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Paste a VC email, rejection, or phrase... e.g. "We&#39;d love to stay in touch"'
          className="w-full h-36 bg-white/5 border border-white/10 rounded-2xl p-5 text-lg text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30 transition-colors"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className="text-white/20 text-xs hidden sm:block">
            {"\u2318"}+Enter
          </span>
          <button
            onClick={handleTranslate}
            disabled={!input.trim() || isTranslating}
            className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isTranslating ? loadingMsg : "Translate"}
          </button>
        </div>
      </div>

      {/* Results */}
      {hasTranslated && (
        <div className="mt-8 space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 text-lg">
                No matches found. Try a common VC phrase like &quot;keep us
                posted&quot; or &quot;the timing isn&apos;t right&quot;
              </p>
            </div>
          ) : (
            <>
              <p className="text-white/40 text-sm mb-4">
                Found {results.length} translation
                {results.length !== 1 ? "s" : ""}
              </p>
              {results.map((entry, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {/* Original */}
                    <div className="p-6">
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                        What they said
                      </p>
                      <p className="text-white text-lg leading-relaxed">
                        &quot;{entry.phrase}&quot;
                      </p>
                    </div>
                    {/* Translation */}
                    <div className="p-6 bg-white/[0.02]">
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                        What they meant
                      </p>
                      <p className="text-white text-lg leading-relaxed">
                        &quot;{entry.translation}&quot;
                      </p>
                    </div>
                  </div>
                  {/* Bottom bar */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${categoryColors[entry.category]}`}
                      >
                        {categoryLabels[entry.category]}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div
                            key={si}
                            className={`w-2 h-2 rounded-full ${
                              si < entry.severity
                                ? "bg-red-500"
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                        <span className="text-white/30 text-xs ml-1.5">
                          Brutality
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShare(entry)}
                      className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1.5"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function DictionarySection() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const categories: (Category | "all")[] = [
    "all",
    "rejection",
    "stalling",
    "interest",
    "fomo",
    "negotiation",
    "fundraising",
    "pitch-meeting",
  ];

  const filtered = useMemo(() => {
    return jargonData.filter((entry) => {
      const matchesCategory =
        activeCategory === "all" || entry.category === activeCategory;
      const matchesSearch =
        !search ||
        entry.phrase.toLowerCase().includes(search.toLowerCase()) ||
        entry.translation.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handleShare = (entry: JargonEntry) => {
    const text = `VC: "${entry.phrase}"\n\nTranslation: "${entry.translation}"\n\nvia @Trace_Cohen`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          The VC Dictionary
        </h2>
        <p className="text-white/40">
          {jargonData.length} phrases decoded. Search or filter by category.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phrases..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              activeCategory === cat
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat === "all"
              ? `All (${jargonData.length})`
              : `${categoryLabels[cat]} (${jargonData.filter((e) => e.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Dictionary grid */}
      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50">No phrases match your search.</p>
          </div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={i}
              className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium mb-1.5">
                    &quot;{entry.phrase}&quot;
                  </p>
                  <p className="text-white/50 text-sm">
                    {entry.translation}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[entry.category]}`}
                  >
                    {categoryLabels[entry.category]}
                  </span>
                  <button
                    onClick={() => handleShare(entry)}
                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all p-1"
                    title="Share on Twitter"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="pt-16 pb-12 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-sm mb-6">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {jargonData.length} phrases decoded
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          What VCs
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            Actually Mean
          </span>
        </h1>
        <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto">
          Paste a VC email, rejection, or meeting note.
          <br />
          Get the brutally honest translation.
        </p>
      </div>

      {/* Translator */}
      <div className="px-4 pb-20">
        <TranslatorSection />
      </div>

      {/* Divider */}
      <div className="w-full border-t border-white/5" />

      {/* Dictionary */}
      <div className="px-4 py-20">
        <DictionarySection />
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            Built for founders tired of decoding VC emails.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://x.com/Trace_Cohen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors text-sm"
            >
              Twitter
            </a>
            <a
              href="mailto:t@nyvp.com"
              className="text-white/40 hover:text-white transition-colors text-sm"
            >
              t@nyvp.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
