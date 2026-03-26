"use client";

import { useState } from "react";
import { jargonData, categoryLabels, categoryColors, JargonEntry } from "@/data/jargon";

interface QuizQuestion {
  phrase: JargonEntry;
  options: string[];
  correctIndex: number;
}

function generateQuiz(count: number): QuizQuestion[] {
  const shuffled = [...jargonData].sort(() => Math.random() - 0.5);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const correct = shuffled[i];
    // Pick 2 random wrong translations
    const others = jargonData
      .filter((e) => e.phrase !== correct.phrase)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((e) => e.translation);

    const options = [...others, correct.translation].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correct.translation);

    questions.push({ phrase: correct, options, correctIndex });
  }

  return questions;
}

const resultMessages = [
  { min: 0, max: 2, title: "Innocent Founder", subtitle: "You clearly haven't been rejected enough. Give it time.", emoji: "&#x1F423;" },
  { min: 3, max: 5, title: "Getting There", subtitle: "You're starting to see through the BS. Keep pitching (and getting rejected).", emoji: "&#x1F914;" },
  { min: 6, max: 8, title: "Battle-Tested", subtitle: "You've sat through enough partner meetings to know what 'we'll circle back' really means.", emoji: "&#x1F4AA;" },
  { min: 9, max: 10, title: "VC Whisperer", subtitle: "You can decode a rejection before they finish the sentence. You should be a VC.", emoji: "&#x1F451;" },
];

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuiz(10));
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const question = questions[currentQ];

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setSelected(optionIndex);
    setAnswered(true);

    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setQuestions(generateQuiz(10));
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
  };

  const handleShare = () => {
    const result = resultMessages.find((r) => score >= r.min && score <= r.max) || resultMessages[0];
    const text = `I scored ${score}/10 on the VC Jargon Quiz — "${result.title}" level.\n\nCan you decode VC-speak better than me?\n\nPlay at vcjargon.com\n\nvia @Trace_Cohen`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Results screen
  if (finished) {
    const result = resultMessages.find((r) => score >= r.min && score <= r.max) || resultMessages[0];
    return (
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-12 sm:py-16">
        <div className="bg-white/[0.05] border border-white/15 rounded-2xl p-6 sm:p-10 text-center animate-scale-in">
          <p className="text-5xl sm:text-6xl mb-4" dangerouslySetInnerHTML={{ __html: result.emoji }} />
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{result.title}</h3>
          <p className="text-white/60 text-base sm:text-lg mb-6 max-w-md mx-auto">{result.subtitle}</p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                {score}/{questions.length}
              </p>
              <p className="text-white/70 text-xs mt-1">Correct</p>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-white">{bestStreak}</p>
              <p className="text-white/70 text-xs mt-1">Best streak</p>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-white">{Math.round((score / questions.length) * 100)}%</p>
              <p className="text-white/70 text-xs mt-1">Accuracy</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={handleRestart} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl transition-all glow-btn">
              Play Again
            </button>
            <button onClick={handleShare} className="w-full sm:w-auto px-8 py-3 bg-white/[0.05] border border-white/15 text-white/70 hover:text-white font-medium rounded-xl transition-all hover:bg-white/10">
              Share Results
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Guess the Meaning</h2>
        <p className="text-white/60 text-base sm:text-lg">
          10 VC phrases. 3 choices each. How well can you decode the BS?
        </p>
      </div>

      <div className="bg-white/[0.05] border border-white/15 rounded-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/[0.05]">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
            style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/20 bg-white/[0.06]">
          <span className="text-white/70 text-sm">
            Question {currentQ + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-4">
            {streak > 1 && (
              <span className="text-orange-400 text-sm font-medium animate-fade-in">
                {streak} streak &#x1F525;
              </span>
            )}
            <span className="text-white font-bold text-sm">
              {score}/{currentQ + (answered ? 1 : 0)}
            </span>
          </div>
        </div>

        {/* The phrase */}
        <div className="p-5 sm:p-8">
          <div className="text-center mb-8">
            <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">A VC says...</p>
            <p className="text-white text-xl sm:text-2xl font-medium leading-relaxed">
              &quot;{question.phrase.phrase}&quot;
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${categoryColors[question.phrase.category]}`}>
                {categoryLabels[question.phrase.category]}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">What do they actually mean?</p>
            {question.options.map((option, oi) => {
              const isCorrect = oi === question.correctIndex;
              const isSelected = oi === selected;

              let style = "bg-white/[0.03] border-white/15 text-white/80 hover:bg-white/[0.08] hover:border-white/25 cursor-pointer";

              if (answered) {
                if (isCorrect) {
                  style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
                } else if (isSelected && !isCorrect) {
                  style = "bg-red-500/15 border-red-500/40 text-red-300";
                } else {
                  style = "bg-white/[0.06] border-white/20 text-white/60";
                }
              }

              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(oi)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-sm sm:text-base leading-relaxed ${style} ${answered ? "cursor-default" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 ${
                      answered && isCorrect
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : answered && isSelected && !isCorrect
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : "bg-white/[0.05] border-white/20 text-white/70"
                    }`}>
                      {answered && isCorrect ? "✓" : answered && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + oi)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {answered && (
            <div className="mt-6 text-center animate-fade-in-up">
              {selected === question.correctIndex ? (
                <p className="text-emerald-400 font-medium mb-4">Correct! You speak fluent VC.</p>
              ) : (
                <p className="text-red-400 font-medium mb-4">Wrong! You need more rejection experience.</p>
              )}
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl transition-all glow-btn"
              >
                {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
