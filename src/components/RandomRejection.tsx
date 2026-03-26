"use client";

import { useState, useEffect } from "react";
import { jargonData, categoryLabels, categoryColors } from "@/data/jargon";

export default function RandomRejection() {
  const [current, setCurrent] = useState(() => jargonData[Math.floor(Math.random() * jargonData.length)]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinIndex, setSpinIndex] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  const streakMessages = [
    "",
    "First rejection of the day. It only gets worse.",
    "Two down. Building character.",
    "Three rejections. You're warming up.",
    "Four! You're on a roll... of pain.",
    "FIVE. At this point, it's a lifestyle.",
    "Six rejections. VCs are shaking.",
    "Seven. You might be addicted to rejection.",
    "Eight?! Touch grass. Or raise a friends & family round.",
    "Nine. You've seen more rejections than most VCs have sent.",
    "TEN. Legend status. Frame this page.",
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinIndex(0);

    // Rapid cycle through phrases for slot-machine effect
    let count = 0;
    const totalCycles = 15;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * jargonData.length);
      setCurrent(jargonData[randomIdx]);
      setSpinIndex((s) => s + 1);
      count++;

      if (count >= totalCycles) {
        clearInterval(interval);
        const final = jargonData[Math.floor(Math.random() * jargonData.length)];
        setCurrent(final);
        setIsSpinning(false);
        setSessionCount((c) => c + 1);
      }
    }, 80 + count * 8); // Gradually slows down
  };

  // Shake to randomize on mobile
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = Date.now();
      if (now - lastTime < 300) return;

      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);

      if (deltaX + deltaY + deltaZ > 30) {
        handleSpin();
        lastTime = now;
      }

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  });

  const handleShare = () => {
    const text = `VC: "${current.phrase}"\n\nTranslation: "${current.translation}"\n\nvia @Trace_Cohen`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Random Rejection</h2>
        <p className="text-white/60 text-base sm:text-lg">
          Shake your phone or hit the button. Brace yourself.
        </p>
      </div>

      <div className="bg-white/[0.05] border border-white/15 rounded-2xl overflow-hidden">
        {/* The phrase display */}
        <div className={`p-6 sm:p-10 text-center transition-all duration-200 ${isSpinning ? "opacity-60" : ""}`}>
          <div className={`mb-6 ${isSpinning ? "animate-pulse" : "animate-fade-in"}`} key={isSpinning ? spinIndex : current.phrase}>
            <p className="text-white text-xl sm:text-2xl font-medium mb-4 leading-relaxed">
              &quot;{current.phrase}&quot;
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent mx-auto mb-4" />
            <p className="text-orange-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
              {current.translation}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${categoryColors[current.category]}`}>
              {categoryLabels[current.category]}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, si) => (
                <div key={si} className={`w-2 h-2 rounded-full ${si < current.severity ? "bg-red-500" : "bg-white/15"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t border-white/20 bg-white/[0.06] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl text-base transition-all glow-btn disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSpinning ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Spinning...
              </>
            ) : (
              <>
                <span className="text-lg">&#x1F3B0;</span>
                Hit Me With Another
              </>
            )}
          </button>
          <button onClick={handleShare} className="text-white/70 hover:text-white text-sm transition-all flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share this rejection
          </button>
        </div>

        {/* Streak counter */}
        {sessionCount > 0 && (
          <div className="border-t border-white/20 bg-white/[0.06] px-4 sm:px-6 py-3 text-center">
            <p className="text-white/70 text-sm">
              <span className="text-white font-bold">{sessionCount}</span> rejection{sessionCount !== 1 ? "s" : ""} viewed this session.{" "}
              <span className="text-white/70 italic">
                {streakMessages[Math.min(sessionCount, streakMessages.length - 1)]}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
