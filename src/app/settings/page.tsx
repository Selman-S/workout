"use client";

import { useEffect, useState, useCallback } from "react";
import { workoutProgram } from "@/data/workouts";
import { ExerciseSettingData, DayKey, ProgressionSuggestion } from "@/types";
import { getDefaultSetDuration, getDefaultTargetReps } from "@/lib/workoutHelpers";

const dayTabs: { key: DayKey; label: string; color: string }[] = [
  { key: "monday", label: "Pazartesi", color: "#ef4444" },
  { key: "wednesday", label: "Çarşamba", color: "#3b82f6" },
  { key: "friday", label: "Cuma", color: "#22c55e" },
];

export default function SettingsPage() {
  const [activeDay, setActiveDay] = useState<DayKey>("monday");
  const [settings, setSettings] = useState<Record<string, ExerciseSettingData[]>>({});
  const [suggestions, setSuggestions] = useState<Record<string, ProgressionSuggestion>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  const workout = workoutProgram.find((w) => w.day === activeDay)!;

  // Load settings for all days + progression suggestions
  useEffect(() => {
    for (const dt of dayTabs) {
      fetch(`/api/exercise-settings?day=${dt.key}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.exercises) {
            setSettings((prev) => ({ ...prev, [dt.key]: data.exercises }));
          }
        })
        .catch(() => {});
    }

    fetch("/api/stats/suggestions")
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => {});

    // Check notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  function getSetting(exIdx: number): ExerciseSettingData {
    const s = settings[activeDay]?.find((s) => s.exerciseIndex === exIdx);
    if (s) return s;
    const ex = workout.exercises[exIdx];
    return {
      exerciseIndex: exIdx,
      weight: 0,
      targetReps: getDefaultTargetReps(ex.reps),
      setDuration: getDefaultSetDuration(ex.reps),
    };
  }

  function updateSetting(exIdx: number, field: keyof ExerciseSettingData, value: number) {
    setSettings((prev) => {
      const daySettings = [...(prev[activeDay] || [])];
      const existing = daySettings.findIndex((s) => s.exerciseIndex === exIdx);
      const current = getSetting(exIdx);
      const updated = { ...current, [field]: value };

      if (existing >= 0) {
        daySettings[existing] = updated;
      } else {
        daySettings.push(updated);
      }
      return { ...prev, [activeDay]: daySettings };
    });
    setSaved(false);
  }

  // Apply a suggestion to the weight field
  function applySuggestion(exIdx: number, suggestedWeight: number) {
    updateSetting(exIdx, "weight", suggestedWeight);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    const exercises = workout.exercises.map((_, i) => getSetting(i));

    try {
      await fetch("/api/exercise-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: activeDay, exercises }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }, [activeDay, settings, workout]);

  async function requestNotifications() {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === "granted") {
        new Notification("FitTracker", {
          body: "Bildirimler açıldı! Antrenman günlerinde hatırlatma alacaksın.",
        });
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Ayarlar</h1>
          <p className="text-xs text-gray-500">Egzersiz ağırlık ve süreleri</p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 mb-5">
        {dayTabs.map((dt) => (
          <button
            key={dt.key}
            onClick={() => setActiveDay(dt.key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeDay === dt.key
                ? "text-white"
                : "text-gray-500 bg-white/2 hover:bg-white/4"
            }`}
            style={
              activeDay === dt.key
                ? { background: `${dt.color}20`, color: dt.color, border: `1px solid ${dt.color}30` }
                : {}
            }
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Exercise settings */}
      <div className="space-y-3">
        {workout.exercises.map((ex, idx) => {
          const setting = getSetting(idx);
          const dayColor = dayTabs.find((d) => d.key === activeDay)?.color || "#888";
          const suggestion = suggestions[ex.name];
          const showSuggestion = suggestion && suggestion.reason === "up";

          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/5 bg-white/2 p-4 relative overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: ex.rest === 0 ? "#a855f7" : dayColor }}
              />
              <div className="pl-3">
                {/* Exercise name and info */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: `${dayColor}18`, color: dayColor }}
                  >
                    {ex.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-white truncate">{ex.name}</h3>
                      {ex.rest === 0 && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 shrink-0">
                          SÜPERSET
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {ex.sets} × {ex.reps} • Dinlenme: {ex.rest > 0 ? `${ex.rest}sn` : "Yok"}
                    </p>
                  </div>
                </div>

                {/* Progression suggestion banner */}
                {showSuggestion && (
                  <button
                    onClick={() => applySuggestion(idx, suggestion.suggestedWeight)}
                    className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                      hover:bg-emerald-500/15 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    <span className="text-[10px] text-emerald-400">
                      <strong>Artır:</strong> {suggestion.currentWeight}kg → {suggestion.suggestedWeight}kg
                      <span className="text-emerald-500/60 ml-1">(Son 2 antrenman başarılı)</span>
                    </span>
                  </button>
                )}
                {suggestion && suggestion.reason === "hold" && (
                  <div className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="text-[10px] text-amber-400/80">
                      Mevcut ağırlığı koru — henüz artırma zamanı değil
                    </span>
                  </div>
                )}

                {/* Inputs row */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-500 block mb-1">Ağırlık (kg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={setting.weight || ""}
                      onChange={(e) =>
                        updateSetting(idx, "weight", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white
                        placeholder:text-gray-600 focus:outline-none focus:border-white/20 tabular-nums text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 block mb-1">Tekrar</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={setting.targetReps || ""}
                      onChange={(e) =>
                        updateSetting(idx, "targetReps", parseInt(e.target.value) || 0)
                      }
                      placeholder="10"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white
                        placeholder:text-gray-600 focus:outline-none focus:border-white/20 tabular-nums text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 block mb-1">Süre (sn)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={setting.setDuration || ""}
                      onChange={(e) =>
                        updateSetting(idx, "setDuration", parseInt(e.target.value) || 0)
                      }
                      placeholder="40"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white
                        placeholder:text-gray-600 focus:outline-none focus:border-white/20 tabular-nums text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] ${
            saved ? "bg-emerald-600" : "bg-white/10 hover:bg-white/15"
          } disabled:opacity-50`}
        >
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>

      {/* Notification Settings */}
      <section className="mt-8 rounded-2xl border border-white/5 bg-white/2 p-4">
        <h3 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          Bildirimler
        </h3>
        {notifPermission === "granted" ? (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Bildirimler açık — antrenman günlerinde hatırlatma alacaksın.
          </p>
        ) : notifPermission === "denied" ? (
          <p className="text-xs text-gray-500">
            Bildirimler engellendi. Tarayıcı ayarlarından izin verebilirsin.
          </p>
        ) : (
          <button
            onClick={requestNotifications}
            className="text-xs text-white bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-lg transition-all active:scale-95"
          >
            Bildirimleri Aç
          </button>
        )}
      </section>
    </div>
  );
}
