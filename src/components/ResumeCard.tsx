"use client";

import Link from "next/link";
import { IWorkoutSession, DayKey } from "@/types";

const dayConfig: Record<DayKey, { label: string; color: string }> = {
  monday: { label: "Pazartesi", color: "#ef4444" },
  wednesday: { label: "Çarşamba", color: "#3b82f6" },
  friday: { label: "Cuma", color: "#22c55e" },
};

interface ResumeCardProps {
  session: IWorkoutSession;
}

export default function ResumeCard({ session }: ResumeCardProps) {
  const config = dayConfig[session.day as DayKey];
  if (!config) return null;

  const pct =
    session.totalSets > 0
      ? Math.round((session.completedSetCount / session.totalSets) * 100)
      : 0;

  return (
    <Link href={`/workout/${session.day}`} className="block">
      <div
        className="rounded-2xl border p-4 transition-all active:scale-[0.98] overflow-hidden animate-fade-in"
        style={{
          borderColor: `${config.color}30`,
          background: `${config.color}08`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${config.color}20` }}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={config.color}
                strokeWidth={2}
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {config.label} — Devam Et
              </p>
              <p className="text-[11px] text-gray-500">
                {session.completedSetCount}/{session.totalSets} set • %{pct}
              </p>
            </div>
          </div>
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke={config.color}
            strokeWidth={2}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        {/* Mini progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: config.color }}
          />
        </div>
      </div>
    </Link>
  );
}
