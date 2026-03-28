"use client";

import { useState } from "react";
import { Exercise, SetData } from "@/types";
import SetTracker from "./SetTracker";

interface ExerciseCardProps {
  exercise: Exercise;
  color: string;
  isActive: boolean;
  completedSets?: SetData[];
  previousSets?: SetData[];
  prWeight?: number;
  isNewPR?: boolean;
  onCompleteSet?: (setIndex: number, data: SetData) => void;
  onUncompleteSet?: (setIndex: number) => void;
}

export default function ExerciseCard({
  exercise,
  color,
  isActive,
  completedSets = [],
  previousSets = [],
  prWeight,
  isNewPR = false,
  onCompleteSet,
  onUncompleteSet,
}: ExerciseCardProps) {
  const [showTip, setShowTip] = useState(false);

  const allSetsCompleted =
    isActive && completedSets.length > 0 && completedSets.every((s) => s.completed);
  const hasSomeCompleted = isActive && completedSets.some((s) => s.completed);

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        allSetsCompleted
          ? "border-white/5 bg-white/2"
          : hasSomeCompleted
          ? "border-white/10 bg-white/4"
          : "border-white/5 bg-white/2"
      }`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{
          background: allSetsCompleted ? `${color}66` : color,
          opacity: allSetsCompleted ? 0.4 : 1,
        }}
      />

      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                allSetsCompleted ? "bg-white/5" : ""
              }`}
              style={
                allSetsCompleted
                  ? { color: `${color}88` }
                  : { background: `${color}18`, color }
              }
            >
              {allSetsCompleted ? "✓" : exercise.order}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold text-[15px] leading-tight ${
                    allSetsCompleted
                      ? "text-gray-500 line-through"
                      : "text-white"
                  }`}
                >
                  {exercise.name}
                </h3>
                {/* New PR badge */}
                {isNewPR && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 animate-scale-in">
                    PR!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">
                  {exercise.sets} × {exercise.reps}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {exercise.rest > 0 ? `${exercise.rest}sn` : "Yok"}
                </span>
                {/* Show previous best weight */}
                {prWeight !== undefined && prWeight > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-[11px] text-amber-500/70">
                      PR: {prWeight}kg
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technique tip */}
        <button
          onClick={() => setShowTip(!showTip)}
          className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Teknik İpucu
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${showTip ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showTip && (
          <div
            className="mt-2 text-xs leading-relaxed rounded-lg px-3 py-2.5 animate-fade-in"
            style={{
              color: `${color}cc`,
              background: `${color}08`,
              border: `1px solid ${color}15`,
            }}
          >
            {exercise.tip}
          </div>
        )}

        {/* Set tracker (active mode) */}
        {isActive && onCompleteSet && onUncompleteSet && (
          <div className="mt-4">
            <SetTracker
              totalSets={exercise.sets}
              completedSets={completedSets}
              color={color}
              previousSets={previousSets}
              onCompleteSet={onCompleteSet}
              onUncompleteSet={onUncompleteSet}
            />
          </div>
        )}
      </div>
    </div>
  );
}
