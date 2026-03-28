"use client";

import { useEffect, useState } from "react";
import { workoutProgram, getTodayWorkoutDay, getNextWorkoutDay } from "@/data/workouts";
import DayCard from "@/components/DayCard";
import WeeklyProgress from "@/components/WeeklyProgress";
import StreakCounter from "@/components/StreakCounter";
import ResumeCard from "@/components/ResumeCard";
import type { HomeStats, DayKey } from "@/types";

export default function HomePage() {
  const [stats, setStats] = useState<HomeStats | null>(null);

  const todayKey = getTodayWorkoutDay();
  const todayWorkout = workoutProgram.find((w) => w.day === todayKey);
  const nextWorkout = todayWorkout || getNextWorkoutDay();
  const isRestDay = !todayWorkout;

  // Check if today's workout is not yet completed
  const todayCompleted =
    todayKey && stats?.weeklyCompleted
      ? stats.weeklyCompleted[todayKey as DayKey]
      : false;
  const showReminder = !isRestDay && !todayCompleted && stats !== null;
  const currentHour = new Date().getHours();
  const isUrgent = showReminder && currentHour >= 16;

  useEffect(() => {
    fetch("/api/stats/home")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // Fire browser notification on workout days (once per day)
  useEffect(() => {
    if (!showReminder) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const lastNotif = localStorage.getItem("fittracker-notif-date");
    const today = new Date().toDateString();
    if (lastNotif === today) return;

    try {
      new Notification("FitTracker", {
        body: isUrgent
          ? "Antrenman saati geçiyor! Hadi başla!"
          : "Bugün antrenman günü! Programına sadık kal.",
      });
      localStorage.setItem("fittracker-notif-date", today);
    } catch {}
  }, [showReminder, isUrgent]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.4 14.4 9.6 9.6" />
            <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.829l2.829-2.828a2 2 0 1 1 2.828 2.829l1.768 1.767a2 2 0 1 1 2.828 2.829z" />
            <path d="m21.5 21.5-1.4-1.4" />
            <path d="M3.9 3.9 2.5 2.5" />
            <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l-1.768 1.768a2 2 0 1 1 2.829 2.828z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">FitTracker</h1>
          <p className="text-xs text-gray-500">Antrenman Takip</p>
        </div>
      </div>

      {/* Workout day reminder banner */}
      {showReminder && (
        <section className="mb-5">
          <div
            className={`rounded-2xl border p-4 ${
              isUrgent
                ? "border-red-500/20 bg-red-500/5"
                : "border-amber-500/20 bg-amber-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isUrgent ? "bg-red-500/20" : "bg-amber-500/20"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${isUrgent ? "text-red-400" : "text-amber-400"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isUrgent ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {isUrgent ? "Antrenman Saati Geçiyor!" : "Bugün Antrenman Günü!"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {isUrgent
                    ? "Hala antrenmanını yapmadın. Hadi başla!"
                    : "Programına sadık kal, harika gidiyorsun."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Streak counter */}
      {stats && stats.streak > 0 && (
        <section className="mb-5">
          <StreakCounter streak={stats.streak} />
        </section>
      )}

      {/* Resume card */}
      {stats?.activeSession && (
        <section className="mb-5">
          <p className="text-xs text-gray-400 mb-2">Yarım kalan antrenman</p>
          <ResumeCard session={stats.activeSession} />
        </section>
      )}

      {/* Weekly progress */}
      {stats && (
        <section className="mb-6">
          <WeeklyProgress weeklyCompleted={stats.weeklyCompleted} />
        </section>
      )}

      {/* Today / Next workout hero */}
      <section className="mb-8">
        {isRestDay ? (
          <p className="text-sm text-gray-400 mb-3">
            Bugün dinlenme günü. Sıradaki antrenman:
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-3">Bugünün Antrenmanı</p>
        )}
        <DayCard workout={nextWorkout} isToday={!isRestDay} />
      </section>

      {/* Weekly program */}
      <section id="program">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Haftalık Program</h2>
          <span className="text-[11px] text-gray-600">3 gün / hafta</span>
        </div>
        <div className="space-y-3">
          {workoutProgram.map((workout) => (
            <DayCard
              key={workout.day}
              workout={workout}
              isToday={workout.day === todayKey}
              isCompact
            />
          ))}
        </div>
      </section>

      {/* Pro tips */}
      <section className="mt-8 rounded-2xl border border-white/5 bg-white/2 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Profesyonel Notlar
        </h3>
        <ul className="space-y-2.5 text-xs text-gray-400 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-amber-500/80 mt-0.5">•</span>
            <span>
              <strong className="text-gray-300">Isınma:</strong> Her antrenman
              öncesi 5 dakika yerinde hafif koşu ve eklem çevirme yap.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500/80 mt-0.5">•</span>
            <span>
              <strong className="text-gray-300">Aşamalı Artış:</strong> Her hafta
              tekrar sayısını 1-2 adet artırmaya çalış.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500/80 mt-0.5">•</span>
            <span>
              <strong className="text-gray-300">Duruş:</strong> Evden çalıştığın
              için Row hareketlerine ekstra önem ver; omuzların öne çökmesini
              engeller.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
