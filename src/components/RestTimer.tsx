"use client";

import { useEffect, useState, useCallback } from "react";

interface RestTimerProps {
  duration: number; // seconds
  color: string;
  onComplete: () => void;
  onSkip: () => void;
  nextExerciseName?: string;
}

export default function RestTimer({
  duration,
  color,
  onComplete,
  onSkip,
  nextExerciseName,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);

  const handleComplete = useCallback(() => {
    // Vibrate on mobile when timer ends
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (remaining <= 0) {
      handleComplete();
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, handleComplete]);

  const progress = 1 - remaining / duration;
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6 px-8 animate-scale-in">
        <p className="text-sm font-bold tracking-widest uppercase text-gray-400">
          Dinlenme
        </p>

        {/* Circular timer */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="5"
              fill="none"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={color}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="timer-ring"
              style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold tabular-nums"
              style={{ color }}
            >
              {timeStr}
            </span>
            <span className="text-xs text-gray-500 mt-1">{duration} sn</span>
          </div>
        </div>

        {/* Next exercise info */}
        {nextExerciseName && (
          <div className="text-center">
            <p className="text-xs text-gray-500">Sonraki</p>
            <p className="text-sm font-semibold text-gray-300">
              {nextExerciseName}
            </p>
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="px-8 py-3 rounded-full text-sm font-semibold transition-all
            active:scale-95 border border-white/10 hover:border-white/20
            text-gray-300 hover:text-white"
        >
          Atla →
        </button>
      </div>
    </div>
  );
}
