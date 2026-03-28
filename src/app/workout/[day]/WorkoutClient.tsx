"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { WorkoutDay, ExerciseSettingData, WorkoutStep } from "@/types";
import { getTotalSets } from "@/data/workouts";
import { getDefaultSetDuration, getDefaultTargetReps, formatTimer } from "@/lib/workoutHelpers";
import { warmupExercises, WARMUP_TOTAL_SECONDS } from "@/data/warmup";
import { cooldownExercises, COOLDOWN_TOTAL_SECONDS } from "@/data/cooldown";

interface Props {
  workout: WorkoutDay;
}

type Phase = "idle" | "running" | "paused" | "finished";

const PREP_DURATION = 5;

export default function WorkoutClient({ workout }: Props) {
  const [exerciseSettings, setExerciseSettings] = useState<ExerciseSettingData[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const stateRef = useRef({ phase: "idle" as Phase, stepIdx: 0, timeLeft: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSets = useMemo(() => getTotalSets(workout), [workout]);

  // Load exercise settings on mount
  useEffect(() => {
    fetch(`/api/exercise-settings?day=${workout.day}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.exercises) setExerciseSettings(data.exercises);
      })
      .catch(() => {});
  }, [workout.day]);

  function getSetting(exIdx: number): ExerciseSettingData {
    const saved = exerciseSettings.find((s) => s.exerciseIndex === exIdx);
    if (saved) return saved;
    const ex = workout.exercises[exIdx];
    return {
      exerciseIndex: exIdx,
      weight: 0,
      targetReps: getDefaultTargetReps(ex.reps),
      setDuration: getDefaultSetDuration(ex.reps),
    };
  }

  // Build flat step sequence: warmup → prepare → exercise/rest cycles → cooldown
  const steps = useMemo<WorkoutStep[]>(() => {
    const result: WorkoutStep[] = [];

    // Warmup phase
    warmupExercises.forEach((wu, i) => {
      result.push({
        type: "warmup",
        duration: wu.duration,
        exerciseIndex: -1,
        setIndex: i,
        label: wu.name,
        tip: wu.tip,
      });
    });

    // Preparation countdown
    result.push({ type: "prepare", duration: PREP_DURATION, exerciseIndex: 0, setIndex: 0 });

    // Exercise / rest cycles
    workout.exercises.forEach((ex, exIdx) => {
      const setting = exerciseSettings.find((s) => s.exerciseIndex === exIdx);
      const setDuration = setting?.setDuration || getDefaultSetDuration(ex.reps);
      const isSuperset = ex.rest === 0;

      for (let s = 0; s < ex.sets; s++) {
        result.push({
          type: "exercise",
          duration: setDuration,
          exerciseIndex: exIdx,
          setIndex: s,
          isSuperset,
        });

        const isLastSetOfLastExercise =
          exIdx === workout.exercises.length - 1 && s === ex.sets - 1;

        if (!isLastSetOfLastExercise) {
          if (ex.rest > 0) {
            result.push({ type: "rest", duration: ex.rest, exerciseIndex: exIdx, setIndex: s });
          }
          // Superset exercises (rest=0): no rest step at all
        }
      }
    });

    // Cooldown phase
    cooldownExercises.forEach((cd, i) => {
      result.push({
        type: "cooldown",
        duration: cd.duration,
        exerciseIndex: -1,
        setIndex: i,
        label: cd.name,
        tip: cd.tip,
      });
    });

    return result;
  }, [workout, exerciseSettings]);

  const currentStep = steps[stepIdx] || steps[0];
  const currentExercise = currentStep?.exerciseIndex >= 0
    ? workout.exercises[currentStep.exerciseIndex]
    : null;

  // Progress: overall step progress (0-100)
  const progress = steps.length > 1 ? (stepIdx / (steps.length - 1)) * 100 : 0;

  // Completed exercise sets for display
  const totalExSteps = steps.filter((s) => s.type === "exercise").length;
  const completedExSteps = steps.slice(0, stepIdx).filter((s) => s.type === "exercise").length;

  // Count warmup / cooldown steps for sub-progress
  const warmupSteps = steps.filter((s) => s.type === "warmup");
  const cooldownSteps = steps.filter((s) => s.type === "cooldown");
  const warmupProgress = warmupSteps.length > 0
    ? Math.min(steps.slice(0, stepIdx).filter((s) => s.type === "warmup").length / warmupSteps.length, 1)
    : 0;
  const cooldownProgress = cooldownSteps.length > 0
    ? Math.min(steps.slice(0, stepIdx).filter((s) => s.type === "cooldown").length / cooldownSteps.length, 1)
    : 0;

  // Next exercise info (for rest / prepare phase)
  const nextExStep = steps.slice(stepIdx + 1).find((s) => s.type === "exercise");
  const nextExercise = nextExStep ? workout.exercises[nextExStep.exerciseIndex] : null;
  const nextSetLabel = nextExStep
    ? `${workout.exercises[nextExStep.exerciseIndex].name} — Set ${nextExStep.setIndex + 1}`
    : "";

  // Next warmup/cooldown info
  const nextWarmupStep = steps.slice(stepIdx + 1).find((s) => s.type === "warmup");
  const nextCooldownStep = steps.slice(stepIdx + 1).find((s) => s.type === "cooldown");

  // Phase flags
  const isWarmup = currentStep?.type === "warmup";
  const isCooldown = currentStep?.type === "cooldown";
  const isExercise = currentStep?.type === "exercise";
  const isRest = currentStep?.type === "rest";
  const isPrep = currentStep?.type === "prepare";
  const isSuperset = currentStep?.isSuperset;

  // Timer tick
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "running") return;

    const newTime = s.timeLeft - 1;

    // Haptic on countdown 3, 2, 1
    if (newTime <= 3 && newTime > 0) {
      try { navigator.vibrate(50); } catch {}
    }

    if (newTime <= 0) {
      const nextIdx = s.stepIdx + 1;
      if (nextIdx >= steps.length) {
        stateRef.current = { phase: "finished", stepIdx: s.stepIdx, timeLeft: 0 };
        setPhase("finished");
        setTimeLeft(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      stateRef.current = { phase: "running", stepIdx: nextIdx, timeLeft: steps[nextIdx].duration };
      setStepIdx(nextIdx);
      setTimeLeft(steps[nextIdx].duration);

      // Haptic feedback by phase type
      try {
        const nextType = steps[nextIdx].type;
        if (nextType === "exercise") navigator.vibrate([100, 50, 100]);
        else if (nextType === "rest") navigator.vibrate(200);
        else if (nextType === "warmup" || nextType === "cooldown") navigator.vibrate(80);
        else navigator.vibrate(50);
      } catch {}
    } else {
      stateRef.current = { ...s, timeLeft: newTime };
      setTimeLeft(newTime);
    }
  }, [steps]);

  // Save session when finished
  useEffect(() => {
    if (phase !== "finished" || !startTime) return;

    const exercises = workout.exercises.map((ex, i) => {
      const setting = getSetting(i);
      return {
        exerciseIndex: i,
        completedSets: Array(ex.sets)
          .fill(null)
          .map(() => ({
            completed: true,
            weight: setting.weight || undefined,
            reps: setting.targetReps || undefined,
          })),
      };
    });

    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: workout.day, exercises, totalSets }),
    })
      .then((r) => r.json())
      .then((session) => {
        if (session._id) {
          fetch(`/api/sessions/${session._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completedAt: new Date().toISOString() }),
          }).catch(console.error);
        }
      })
      .catch(console.error);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleStart() {
    const initial = { phase: "running" as Phase, stepIdx: 0, timeLeft: steps[0].duration };
    stateRef.current = initial;
    setPhase("running");
    setStepIdx(0);
    setTimeLeft(steps[0].duration);
    setStartTime(new Date());

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 1000);

    try { navigator.vibrate([100, 50, 100]); } catch {}
  }

  function togglePause() {
    if (phase === "running") {
      stateRef.current = { ...stateRef.current, phase: "paused" };
      setPhase("paused");
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (phase === "paused") {
      stateRef.current = { ...stateRef.current, phase: "running" };
      setPhase("running");
      intervalRef.current = setInterval(tick, 1000);
    }
  }

  // Skip warmup → jump to preparation step
  function skipWarmup() {
    const prepIdx = steps.findIndex((s) => s.type === "prepare");
    if (prepIdx >= 0) {
      stateRef.current = { phase: "running", stepIdx: prepIdx, timeLeft: steps[prepIdx].duration };
      setStepIdx(prepIdx);
      setTimeLeft(steps[prepIdx].duration);
    }
  }

  // Skip cooldown → finish workout
  function skipCooldown() {
    stateRef.current = { phase: "finished", stepIdx: steps.length - 1, timeLeft: 0 };
    setPhase("finished");
    setTimeLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  // SVG timer values
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const maxTime = currentStep?.duration || 1;
  const strokeDashoffset = circumference * (1 - timeLeft / maxTime);

  // Elapsed time
  const elapsedMs = startTime ? Date.now() - startTime.getTime() : 0;
  const elapsedMin = Math.floor(elapsedMs / 60000);

  // Duration breakdown for idle view
  const warmupMin = Math.round(WARMUP_TOTAL_SECONDS / 60);
  const cooldownMin = Math.round(COOLDOWN_TOTAL_SECONDS / 60);
  const workoutOnlySteps = steps.filter((s) => ["prepare", "exercise", "rest"].includes(s.type));
  const workoutMin = Math.round(workoutOnlySteps.reduce((a, s) => a + s.duration, 0) / 60);
  const totalMin = warmupMin + workoutMin + cooldownMin;

  // Ring and glow colors per phase
  const dayColor = workout.color;
  const ringColor = isWarmup
    ? "#f59e0b"
    : isCooldown
    ? "#818cf8"
    : isExercise
    ? isSuperset
      ? "#a855f7"
      : dayColor
    : isPrep
    ? "#fbbf24"
    : "#6b7280";

  const bgGlow = isWarmup
    ? "#f59e0b08"
    : isCooldown
    ? "#818cf808"
    : isExercise
    ? `${dayColor}08`
    : "transparent";

  // ─── IDLE: Exercise overview ─────────────────────
  if (phase === "idle") {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm">{workout.dayLabel}</span>
          </Link>
          <Link
            href="/settings"
            className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5"
          >
            Ayarlar
          </Link>
        </div>

        <div className="mb-5">
          <h1 className="text-xl font-bold text-white">{workout.dayTitle}</h1>
          <p className="text-xs text-gray-500 mt-1">{workout.daySubtitle}</p>
        </div>

        {/* Exercise preview list */}
        <div className="space-y-2 mb-6">
          {workout.exercises.map((ex, idx) => {
            const setting = getSetting(idx);
            const isSupersetEx = ex.rest === 0;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-white/2 p-3 flex items-center gap-3 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: isSupersetEx ? "#a855f7" : dayColor }} />
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: `${dayColor}18`, color: dayColor }}
                >
                  {ex.order}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-white font-medium truncate">{ex.name}</p>
                    {isSupersetEx && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 shrink-0">
                        SÜPERSET
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {ex.sets} × {ex.reps} • {ex.rest > 0 ? `${ex.rest}sn din.` : "Dinlenme yok"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {setting.weight > 0 && (
                    <p className="text-xs text-white font-semibold">{setting.weight}kg</p>
                  )}
                  <p className="text-[10px] text-gray-500">{setting.setDuration}sn/set</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time breakdown */}
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500">
            Tahmini süre:{" "}
            <span className="text-white font-medium">{totalMin} dk</span>
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            Isınma {warmupMin}dk + Antrenman {workoutMin}dk + Soğuma {cooldownMin}dk
          </p>
        </div>

        {/* Start button */}
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl text-base font-bold text-white
                transition-all duration-200 active:scale-[0.98] shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${dayColor}, ${dayColor}cc)`,
                boxShadow: `0 8px 32px ${dayColor}40`,
              }}
            >
              Antrenmana Başla
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── FINISHED: Celebration ────────────────────────
  if (phase === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in bg-[#08080d]">
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                background: [dayColor, "#fbbf24", "#a855f7", "#ec4899", "#06b6d4", "#22c55e"][i % 6],
                animation: `confetti ${2 + Math.random() * 2}s ${Math.random() * 0.5}s ease-out forwards`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center px-8 animate-scale-in">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `${dayColor}20`, boxShadow: `0 0 60px ${dayColor}30` }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke={dayColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Tebrikler!</h2>
          <p className="text-gray-400 text-sm mb-1">
            {workout.dayLabel} antrenmanını tamamladın.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 mb-8">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{workout.exercises.length}</p>
              <p className="text-[10px] text-gray-500">Egzersiz</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalSets}</p>
              <p className="text-[10px] text-gray-500">Set</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{elapsedMin}</p>
              <p className="text-[10px] text-gray-500">Dakika</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-block px-10 py-3.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: dayColor, boxShadow: `0 4px 20px ${dayColor}40` }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // ─── RUNNING / PAUSED: Full-screen auto-flow ──────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#08080d] select-none"
      style={{ background: `radial-gradient(ellipse at center 40%, ${bgGlow}, #08080d 70%)` }}
      onClick={togglePause}
    >
      {/* Top bar */}
      <div className="w-full max-w-lg px-4 pt-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
            {isWarmup && "Isınma"}
            {isPrep && "Hazırlan"}
            {isExercise && (isSuperset ? "Süperset" : "Egzersiz")}
            {isRest && "Dinlenme"}
            {isCooldown && "Soğuma"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isWarmup && `${steps.slice(0, stepIdx).filter((s) => s.type === "warmup").length + 1}/${warmupSteps.length}`}
            {(isPrep || isExercise || isRest) && `${completedExSteps}/${totalExSteps} set`}
            {isCooldown && `${steps.slice(0, stepIdx).filter((s) => s.type === "cooldown").length + 1}/${cooldownSteps.length}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{elapsedMin} dk</p>
        </div>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
        {/* Phase-specific content above the timer */}
        <div className="text-center mb-6">
          {isWarmup && (
            <>
              <p className="text-lg font-bold text-amber-400 mb-1 animate-pulse-slow">ISINMA</p>
              <p className="text-base font-semibold text-white">{currentStep.label}</p>
              {nextWarmupStep && (
                <p className="text-[10px] text-gray-500 mt-1">Sıradaki: {nextWarmupStep.label}</p>
              )}
              {!nextWarmupStep && (
                <p className="text-[10px] text-gray-500 mt-1">Son ısınma hareketi</p>
              )}
            </>
          )}
          {isPrep && (
            <>
              <p className="text-lg font-bold text-amber-400 mb-1 animate-pulse-slow">HAZIRLAN</p>
              <p className="text-sm text-gray-400">Sıradaki: {currentExercise?.name}</p>
            </>
          )}
          {isExercise && (
            <>
              {isSuperset && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 mb-2">
                  SÜPERSET
                </span>
              )}
              <p className="text-xl font-bold text-white mb-1">{currentExercise?.name}</p>
              <p className="text-sm font-medium" style={{ color: isSuperset ? "#a855f7" : dayColor }}>
                Set {currentStep.setIndex + 1}/{currentExercise?.sets}
              </p>
              {getSetting(currentStep.exerciseIndex).weight > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {getSetting(currentStep.exerciseIndex).weight}kg ×{" "}
                  {getSetting(currentStep.exerciseIndex).targetReps || currentExercise?.reps}
                </p>
              )}
            </>
          )}
          {isRest && (
            <>
              <p className="text-lg font-bold text-gray-300 mb-1">DİNLENME</p>
              <p className="text-sm text-gray-500">Sonraki: {nextSetLabel}</p>
            </>
          )}
          {isCooldown && (
            <>
              <p className="text-lg font-bold text-indigo-400 mb-1 animate-pulse-slow">SOĞUMA</p>
              <p className="text-base font-semibold text-white">{currentStep.label}</p>
              {nextCooldownStep && (
                <p className="text-[10px] text-gray-500 mt-1">Sıradaki: {nextCooldownStep.label}</p>
              )}
              {!nextCooldownStep && (
                <p className="text-[10px] text-gray-500 mt-1">Son esneme hareketi</p>
              )}
            </>
          )}
        </div>

        {/* Circular timer */}
        <div className="relative w-56 h-56">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
            <circle
              cx="110" cy="110" r={radius}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"
            />
            <circle
              cx="110" cy="110" r={radius}
              fill="none" stroke={ringColor} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="timer-ring"
              style={{ opacity: isRest ? 0.5 : 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-5xl font-bold tabular-nums ${
                timeLeft <= 3 && phase === "running" ? "animate-pulse-slow" : ""
              }`}
              style={{ color: ringColor }}
            >
              {formatTimer(timeLeft)}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">
              {currentStep?.duration}sn
            </span>
          </div>
        </div>

        {/* Tip during exercise / warmup / cooldown */}
        {isExercise && currentExercise?.tip && (
          <p className="text-xs text-gray-500 text-center mt-6 max-w-xs leading-relaxed">
            {currentExercise.tip}
          </p>
        )}
        {(isWarmup || isCooldown) && currentStep.tip && (
          <p className="text-xs text-gray-500 text-center mt-6 max-w-xs leading-relaxed">
            {currentStep.tip}
          </p>
        )}
      </div>

      {/* Bottom: skip buttons + progress bar + pause hint */}
      <div className="w-full max-w-lg px-6 pb-8">
        {/* Skip button for warmup / cooldown */}
        {(isWarmup || isCooldown) && (
          <div className="flex justify-center mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                isWarmup ? skipWarmup() : skipCooldown();
              }}
              className="text-xs text-gray-500 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 active:scale-95"
            >
              {isWarmup ? "Isınmayı Atla →" : "Esnemeleri Atla →"}
            </button>
          </div>
        )}

        {/* Overall progress bar */}
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: ringColor }}
          />
        </div>
        <p className="text-center text-[10px] text-gray-600">
          {phase === "paused" ? (
            <span className="text-amber-400 font-medium">DURDURULDU — Devam etmek için dokun</span>
          ) : (
            "Duraklatmak için dokun"
          )}
        </p>
      </div>

      {/* Pause overlay */}
      {phase === "paused" && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className="text-white font-semibold">Durduruldu</p>
            <p className="text-xs text-gray-400 mt-1">Devam etmek için dokun</p>
          </div>
        </div>
      )}
    </div>
  );
}
