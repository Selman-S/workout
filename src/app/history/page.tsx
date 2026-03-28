"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IWorkoutSession, DayKey } from "@/types";
import { workoutProgram } from "@/data/workouts";
import CalendarHeatmap from "@/components/CalendarHeatmap";

const dayConfig: Record<DayKey, { label: string; color: string }> = {
  monday: { label: "Pazartesi", color: "#ef4444" },
  wednesday: { label: "Çarşamba", color: "#3b82f6" },
  friday: { label: "Cuma", color: "#22c55e" },
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function getRelativeDay(dateStr: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

function getDuration(start: string, end?: string | null): string {
  if (!end) return "Devam ediyor";
  const mins = Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
  if (mins < 60) return `${mins} dk`;
  return `${Math.floor(mins / 60)}s ${mins % 60}dk`;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<IWorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/sessions?limit=100")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then(setSessions)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Geçmiş</h1>
          <p className="text-xs text-gray-500">Tamamlanan antrenmanlar</p>
        </div>
      </div>

      {/* Calendar heatmap */}
      {!loading && !error && (
        <section className="mb-6">
          <CalendarHeatmap sessions={sessions} />
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/2 border border-white/5 animate-shimmer" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-1">Veriler yüklenemedi</p>
          <p className="text-xs text-gray-600">MongoDB bağlantısını kontrol edin.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sessions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14.4 14.4 9.6 9.6" />
              <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.829l2.829-2.828a2 2 0 1 1 2.828 2.829l1.768 1.767a2 2 0 1 1 2.828 2.829z" />
              <path d="m21.5 21.5-1.4-1.4" />
              <path d="M3.9 3.9 2.5 2.5" />
              <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l-1.768 1.768a2 2 0 1 1 2.829 2.828z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-1">Henüz antrenman yok</p>
          <p className="text-xs text-gray-600 mb-4">İlk antrenmanını tamamla ve burada gör.</p>
          <Link href="/" className="inline-block px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors">
            Antrenmana Git
          </Link>
        </div>
      )}

      {/* Session list */}
      {!loading && !error && sessions.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Son Antrenmanlar
          </h3>
          <div className="space-y-3">
            {sessions.map((session) => {
              const config = dayConfig[session.day as DayKey];
              const workout = workoutProgram.find((w) => w.day === session.day);
              const pct = session.totalSets > 0
                ? Math.round((session.completedSetCount / session.totalSets) * 100)
                : 0;

              return (
                <div key={session._id} className="relative rounded-2xl border border-white/5 bg-white/2 p-4 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: config?.color || "#888" }} />
                  <div className="pl-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: `${config?.color || "#888"}18`,
                              color: config?.color || "#888",
                            }}
                          >
                            {config?.label || session.day}
                          </span>
                          <span className="text-[11px] text-gray-600">
                            {getRelativeDay(session.startedAt)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white mt-1.5">
                          {workout?.dayTitle || "Antrenman"}
                        </p>
                      </div>
                      <span className="text-lg font-bold" style={{ color: config?.color || "#888" }}>
                        %{pct}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/5">
                      <span className="text-[11px] text-gray-500">
                        {session.completedSetCount}/{session.totalSets} set
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {formatTime(session.startedAt)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {getDuration(session.startedAt, session.completedAt)}
                      </span>
                      {session.completedAt && (
                        <span className="text-[10px] text-emerald-500/80 font-medium ml-auto">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: config?.color || "#888" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary tiles */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
              <p className="text-[10px] text-gray-500 mt-1">Toplam</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {sessions.reduce((a, s) => a + s.completedSetCount, 0)}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Set</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {sessions.filter((s) => s.completedAt).length}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Tamamlanan</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
