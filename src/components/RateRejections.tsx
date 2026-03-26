"use client";

import { useState, useEffect, useMemo } from "react";
import { jargonData, categoryLabels, categoryColors } from "@/data/jargon";

interface Votes {
  [phrase: string]: { up: number; down: number };
}

const STORAGE_KEY = "vc-jargon-votes";
const USER_VOTES_KEY = "vc-jargon-user-votes";

function getStoredVotes(): Votes {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function getUserVotes(): Record<string, "up" | "down"> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USER_VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default function RateRejections() {
  const [votes, setVotes] = useState<Votes>({});
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down">>({});
  const [sortBy, setSortBy] = useState<"brutal" | "accurate" | "recent">("brutal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVotes(getStoredVotes());
    setUserVotes(getUserVotes());
    setMounted(true);

    // Seed some initial votes so it doesn't look empty
    const stored = getStoredVotes();
    if (Object.keys(stored).length === 0) {
      const seeded: Votes = {};
      jargonData.forEach((entry) => {
        const base = entry.severity * 3;
        seeded[entry.phrase] = {
          up: base + Math.floor(Math.random() * 15),
          down: Math.floor(Math.random() * 5),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      setVotes(seeded);
    }
  }, []);

  const handleVote = (phrase: string, direction: "up" | "down") => {
    const prev = userVotes[phrase];
    const newUserVotes = { ...userVotes };
    const newVotes = { ...votes };

    if (!newVotes[phrase]) {
      newVotes[phrase] = { up: 0, down: 0 };
    }

    // If same vote, undo it
    if (prev === direction) {
      delete newUserVotes[phrase];
      newVotes[phrase] = {
        ...newVotes[phrase],
        [direction]: Math.max(0, newVotes[phrase][direction] - 1),
      };
    } else {
      // If switching vote, undo previous first
      if (prev) {
        newVotes[phrase] = {
          ...newVotes[phrase],
          [prev]: Math.max(0, newVotes[phrase][prev] - 1),
        };
      }
      newUserVotes[phrase] = direction;
      newVotes[phrase] = {
        ...newVotes[phrase],
        [direction]: newVotes[phrase][direction] + 1,
      };
    }

    setUserVotes(newUserVotes);
    setVotes(newVotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVotes));
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(newUserVotes));
  };

  const getScore = (phrase: string) => {
    const v = votes[phrase];
    if (!v) return 0;
    return v.up - v.down;
  };

  const getAccuracy = (phrase: string) => {
    const v = votes[phrase];
    if (!v || v.up + v.down === 0) return 0;
    return Math.round((v.up / (v.up + v.down)) * 100);
  };

  const sorted = useMemo(() => {
    const items = [...jargonData];
    if (sortBy === "brutal") {
      items.sort((a, b) => getScore(b.phrase) - getScore(a.phrase));
    } else if (sortBy === "accurate") {
      items.sort((a, b) => getAccuracy(b.phrase) - getAccuracy(a.phrase));
    }
    return items.slice(0, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, votes]);

  if (!mounted) return null;

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rate the Rejections</h2>
        <p className="text-white/60 text-base sm:text-lg">
          Vote on the most brutal translations. The truth hurts — rate how much.
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {([
          { key: "brutal", label: "Most Brutal" },
          { key: "accurate", label: "Most Accurate" },
          { key: "recent", label: "All Phrases" },
        ] as const).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              sortBy === opt.key
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-transparent"
                : "bg-white/[0.05] text-white/60 border-white/15 hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {sorted.map((entry, i) => {
          const score = getScore(entry.phrase);
          const accuracy = getAccuracy(entry.phrase);
          const userVote = userVotes[entry.phrase];
          const v = votes[entry.phrase] || { up: 0, down: 0 };

          return (
            <div
              key={entry.phrase}
              className="group bg-white/[0.05] border border-white/15 rounded-xl p-4 sm:p-5 card-hover animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s`, opacity: 0 }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Rank */}
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  i < 3 ? "bg-gradient-to-br from-red-500/30 to-orange-500/30 text-orange-300" : "bg-white/[0.05] text-white/40"
                }`}>
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base mb-1">
                    &quot;{entry.phrase}&quot;
                  </p>
                  <p className="text-white/60 text-xs sm:text-sm mb-3 leading-relaxed">
                    {entry.translation}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${categoryColors[entry.category]}`}>
                      {categoryLabels[entry.category]}
                    </span>
                    <span className="text-white/40 text-xs">{accuracy}% say accurate</span>
                    <span className="text-white/40 text-xs">{v.up + v.down} votes</span>
                  </div>
                </div>

                {/* Vote buttons */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleVote(entry.phrase, "up")}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      userVote === "up"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/[0.03] text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                    title="Accurate"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className={`text-sm font-bold ${score > 0 ? "text-emerald-400" : score < 0 ? "text-red-400" : "text-white/40"}`}>
                    {score}
                  </span>
                  <button
                    onClick={() => handleVote(entry.phrase, "down")}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      userVote === "down"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-white/[0.03] text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                    title="Not accurate"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
