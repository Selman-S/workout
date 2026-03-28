"use client";

import { useState } from "react";
import { SetData } from "@/types";

interface SetTrackerProps {
  totalSets: number;
  completedSets: SetData[];
  color: string;
  previousSets?: SetData[];
  onCompleteSet: (setIndex: number, data: SetData) => void;
  onUncompleteSet: (setIndex: number) => void;
}

export default function SetTracker({
  totalSets,
  completedSets,
  color,
  previousSets = [],
  onCompleteSet,
  onUncompleteSet,
}: SetTrackerProps) {
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const allDone = completedSets.every((s) => s.completed);

  function openSetInput(index: number) {
    if (completedSets[index]?.completed) {
      onUncompleteSet(index);
      return;
    }

    // Pre-fill from previous set in this workout, or from last session
    const prevInSession = completedSets
      .slice(0, index)
      .reverse()
      .find((s) => s.completed);
    const prevFromLast = previousSets[index];
    const source = prevInSession || prevFromLast;

    setWeight(source?.weight?.toString() || "");
    setReps(source?.reps?.toString() || "");
    setEditingSet(index);
  }

  function handleSave() {
    if (editingSet === null) return;

    const w = parseFloat(weight) || undefined;
    const r = parseInt(reps) || undefined;

    onCompleteSet(editingSet, { completed: true, weight: w, reps: r });
    setEditingSet(null);
    setWeight("");
    setReps("");
  }

  function handleCancel() {
    setEditingSet(null);
    setWeight("");
    setReps("");
  }

  return (
    <div>
      {/* Set circles */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-gray-500 font-medium mr-1">SET</span>
        {Array.from({ length: totalSets }, (_, i) => {
          const set = completedSets[i];
          const done = set?.completed;
          const isEditing = editingSet === i;

          return (
            <button
              key={i}
              onClick={() => openSetInput(i)}
              className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 active:scale-90 ${
                  isEditing
                    ? "border-white/30 ring-2 ring-offset-1 ring-offset-[#08080d]"
                    : done
                    ? "border-transparent"
                    : "border-white/10 hover:border-white/20"
                }`}
              style={{
                ...(done
                  ? { background: `${color}20`, borderColor: color }
                  : {}),
                ...(isEditing ? { ringColor: color } : {}),
              }}
            >
              {done ? (
                <div className="flex flex-col items-center animate-check">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-bold">{i + 1}</span>
              )}
            </button>
          );
        })}
        {allDone && totalSets > 0 && (
          <span className="text-xs font-bold ml-1" style={{ color }}>
            Tamam!
          </span>
        )}
      </div>

      {/* Weight/rep summary for completed sets */}
      {completedSets.some((s) => s.completed && s.weight) && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {completedSets.map(
            (s, i) =>
              s.completed &&
              s.weight && (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded-md"
                  style={{ background: `${color}10`, color: `${color}bb` }}
                >
                  S{i + 1}: {s.weight}kg × {s.reps || "?"}
                </span>
              )
          )}
        </div>
      )}

      {/* Inline input for weight/reps */}
      {editingSet !== null && (
        <div
          className="mt-3 rounded-xl p-3 animate-fade-in border"
          style={{
            background: `${color}08`,
            borderColor: `${color}20`,
          }}
        >
          <p className="text-[11px] text-gray-400 mb-2.5 font-medium">
            Set {editingSet + 1}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                inputMode="decimal"
                placeholder="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                  placeholder:text-gray-600 focus:outline-none focus:border-white/20 tabular-nums"
                autoFocus
              />
              <span className="text-[10px] text-gray-600 mt-0.5 block ml-1">
                Ağırlık
              </span>
            </div>
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="tekrar"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                  placeholder:text-gray-600 focus:outline-none focus:border-white/20 tabular-nums"
              />
              <span className="text-[10px] text-gray-600 mt-0.5 block ml-1">
                Tekrar
              </span>
            </div>
            <div className="flex gap-1.5 self-start">
              <button
                onClick={handleSave}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all active:scale-90"
                style={{ background: color }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 bg-white/5
                  transition-all active:scale-90 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
