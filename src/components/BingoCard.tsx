"use client";

import { useState, useMemo } from "react";
import { jargonData } from "@/data/jargon";

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function checkBingo(checked: Set<number>): { hasBingo: boolean; winningCells: Set<number> } {
  const lines: number[][] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    lines.push([r * 5, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4]);
  }
  // Columns
  for (let c = 0; c < 5; c++) {
    lines.push([c, c + 5, c + 10, c + 15, c + 20]);
  }
  // Diagonals
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);

  const winningCells = new Set<number>();
  let hasBingo = false;

  for (const line of lines) {
    if (line.every((idx) => idx === 12 || checked.has(idx))) {
      hasBingo = true;
      line.forEach((idx) => winningCells.add(idx));
    }
  }

  return { hasBingo, winningCells };
}

export default function BingoCard() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [showBingo, setShowBingo] = useState(false);

  const phrases = useMemo(() => {
    const shuffled = shuffleArray(jargonData, seed);
    const selected = shuffled.slice(0, 24);
    // Insert free space at index 12
    const grid = [...selected.slice(0, 12), null, ...selected.slice(12)];
    return grid;
  }, [seed]);

  const { hasBingo, winningCells } = useMemo(() => checkBingo(checked), [checked]);

  const toggleCell = (idx: number) => {
    if (idx === 12) return; // Free space
    const next = new Set(checked);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setChecked(next);

    // Check for bingo after state update
    const result = checkBingo(next);
    if (result.hasBingo && !showBingo) {
      setShowBingo(true);
    }
  };

  const handleNewCard = () => {
    setSeed(Math.floor(Math.random() * 100000));
    setChecked(new Set());
    setShowBingo(false);
  };

  const handleShare = () => {
    const checkedCount = checked.size + 1; // +1 for free space
    const text = hasBingo
      ? `BINGO! I got VC Rejection Bingo! ${checkedCount}/25 squares checked. How many rejections have YOU heard?\n\nPlay at vcjargon.com\n\nvia @Trace_Cohen`
      : `I've checked off ${checkedCount}/25 squares on VC Rejection Bingo. How many have YOU heard?\n\nPlay at vcjargon.com\n\nvia @Trace_Cohen`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rejection Bingo</h2>
        <p className="text-white/60 text-base sm:text-lg">
          Check off every VC phrase you&apos;ve heard. Get 5 in a row for BINGO.
        </p>
      </div>

      {/* Bingo celebration */}
      {showBingo && (
        <div className="mb-6 animate-scale-in bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-orange-500/30 rounded-2xl p-5 sm:p-6 text-center">
          <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
            BINGO!
          </p>
          <p className="text-white/70 text-sm sm:text-base mb-4">
            Congratulations? You&apos;ve been rejected enough times to win. That&apos;s... something.
          </p>
          <button onClick={handleShare} className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl text-sm transition-all glow-btn">
            Share your Bingo
          </button>
        </div>
      )}

      {/* The bingo grid */}
      <div className="bg-white/[0.05] border border-white/15 rounded-2xl p-3 sm:p-5">
        {/* Header row */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {["B", "I", "N", "G", "O"].map((letter) => (
            <div key={letter} className="text-center py-2">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-orange-400">
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {phrases.map((entry, idx) => {
            const isFree = idx === 12;
            const isChecked = isFree || checked.has(idx);
            const isWinning = winningCells.has(idx);

            return (
              <button
                key={`${seed}-${idx}`}
                onClick={() => toggleCell(idx)}
                className={`relative aspect-square rounded-lg sm:rounded-xl p-1 sm:p-2 flex items-center justify-center text-center transition-all duration-200 border
                  ${isFree
                    ? "bg-gradient-to-br from-red-500/30 to-orange-500/30 border-orange-500/30 cursor-default"
                    : isChecked
                      ? isWinning
                        ? "bg-gradient-to-br from-red-500/40 to-orange-500/40 border-orange-500/50 scale-[0.97]"
                        : "bg-white/15 border-white/25 scale-[0.97]"
                      : "bg-white/[0.03] border-white/20 hover:bg-white/[0.08] hover:border-white/20"
                  }`}
              >
                {isFree ? (
                  <div>
                    <p className="text-orange-400 text-xs sm:text-sm font-bold">FREE</p>
                    <p className="text-white/70 text-[8px] sm:text-[10px] mt-0.5">SPACE</p>
                  </div>
                ) : (
                  <>
                    <p className={`text-[8px] sm:text-[10px] md:text-xs leading-tight ${isChecked ? "text-white" : "text-white/70"}`}>
                      {entry?.phrase ? (entry.phrase.length > 40 ? entry.phrase.slice(0, 37) + "..." : entry.phrase) : ""}
                    </p>
                    {isChecked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-red-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
        <div className="flex items-center gap-3 text-white/70 text-sm">
          <span>{checked.size + 1}/25 checked</span>
          <span className="text-white/60">|</span>
          <button onClick={handleShare} className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
        <button
          onClick={handleNewCard}
          className="px-5 py-2 bg-white/[0.05] border border-white/15 text-white/60 hover:text-white hover:bg-white/10 rounded-full text-sm font-medium transition-all"
        >
          New Card
        </button>
      </div>
    </section>
  );
}
