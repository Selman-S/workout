"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import { workoutProgram } from "@/data/workouts";
import { PRRecord, IBodyWeight, MuscleGroupVolume } from "@/types";

interface DashboardData {
  weeklyVolume: { week: string; volume: number; sessions: number }[];
  exerciseTrends: Record<string, { date: string; weight: number; reps: number }[]>;
  consistency: { week: string; count: number }[];
  totalSessions: number;
  muscleGroupVolume: MuscleGroupVolume[];
}

export default function StatsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [prs, setPrs] = useState<Record<string, PRRecord>>({});
  const [bodyWeights, setBodyWeights] = useState<IBodyWeight[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/dashboard").then((r) => r.json()),
      fetch("/api/stats/prs").then((r) => r.json()),
      fetch("/api/bodyweight").then((r) => r.json()),
    ])
      .then(([dashData, prData, bwData]) => {
        setData(dashData);
        setPrs(prData);
        setBodyWeights(bwData);
        const exerciseNames = Object.keys(dashData.exerciseTrends || {});
        if (exerciseNames.length > 0) setSelectedExercise(exerciseNames[0]);
      })
      .catch(console.error);
  }, []);

  const handleSaveWeight = useCallback(async () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bodyweight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w }),
      });
      if (res.ok) {
        const entry = await res.json();
        setBodyWeights((prev) => [entry, ...prev]);
        setWeightInput("");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }, [weightInput]);

  const allExercises = workoutProgram.flatMap((d) => d.exercises.map((e) => e.name));
  const uniqueExercises = [...new Set(allExercises)];

  const tooltipStyle = {
    backgroundColor: "#1a1a24",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#eee",
  };

  if (!data) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">İstatistikler</h1>
            <p className="text-xs text-gray-500">Yükleniyor...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/2 border border-white/5 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const last4 = data.consistency.slice(-4);
  const totalPossible = last4.length * 3;
  const totalDone = last4.reduce((a, c) => a + c.count, 0);
  const consistencyPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const currentWeekVol = data.weeklyVolume[data.weeklyVolume.length - 1]?.volume || 0;
  const prevWeekVol = data.weeklyVolume[data.weeklyVolume.length - 2]?.volume || 0;
  const volChange = prevWeekVol > 0 ? Math.round(((currentWeekVol - prevWeekVol) / prevWeekVol) * 100) : 0;

  const bwChartData = [...bodyWeights]
    .reverse()
    .slice(-20)
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      kg: e.weight,
    }));

  // Radar chart: actual vs target muscle group sets
  const hasRadarData = data.muscleGroupVolume?.some((g) => g.actual > 0 || g.target > 0);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-6" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">İstatistikler</h1>
          <p className="text-xs text-gray-500">İlerleme ve analiz</p>
        </div>
      </div>

      {/* Weekly Summary Card */}
      <section className="mb-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
            <p className="text-2xl font-bold text-white">{data.totalSessions}</p>
            <p className="text-[10px] text-gray-500 mt-1">Toplam Antrenman</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
            <p className="text-2xl font-bold text-white">%{consistencyPct}</p>
            <p className="text-[10px] text-gray-500 mt-1">Tutarlılık (4 Hf)</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
            <p className={`text-2xl font-bold ${volChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {volChange >= 0 ? "+" : ""}{volChange}%
            </p>
            <p className="text-[10px] text-gray-500 mt-1">Haftalık Hacim</p>
          </div>
        </div>
      </section>

      {/* Muscle Group Radar Chart */}
      {hasRadarData && (
        <section className="mb-5 rounded-2xl border border-white/5 bg-white/2 p-4">
          <h3 className="text-xs font-semibold text-gray-300 mb-3">
            Kas Grubu Hacim Analizi (Bu Hafta)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={data.muscleGroupVolume} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="group"
                tick={{ fill: "#999", fontSize: 10 }}
              />
              <Radar
                name="Hedef"
                dataKey="target"
                stroke="#6b7280"
                fill="#6b7280"
                fillOpacity={0.1}
                strokeDasharray="5 5"
              />
              <Radar
                name="Bu Hafta"
                dataKey="actual"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", color: "#999" }}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Consistency Chart */}
      <section className="mb-5 rounded-2xl border border-white/5 bg-white/2 p-4">
        <h3 className="text-xs font-semibold text-gray-300 mb-3">
          Haftalık Tutarlılık
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data.consistency}>
            <XAxis
              dataKey="week"
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 3]}
              ticks={[1, 2, 3]}
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Volume Chart */}
      {data.weeklyVolume.length > 0 && (
        <section className="mb-5 rounded-2xl border border-white/5 bg-white/2 p-4">
          <h3 className="text-xs font-semibold text-gray-300 mb-3">
            Haftalık Toplam Hacim (kg × tekrar)
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.weeklyVolume.slice(-8)}>
              <XAxis
                dataKey="week"
                tick={{ fill: "#666", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Exercise Trend */}
      <section className="mb-5 rounded-2xl border border-white/5 bg-white/2 p-4">
        <h3 className="text-xs font-semibold text-gray-300 mb-3">
          Egzersiz Ağırlık Trendi
        </h3>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-3
            focus:outline-none focus:border-white/20"
        >
          {uniqueExercises.map((name) => (
            <option key={name} value={name} className="bg-[#1a1a24]">
              {name}
            </option>
          ))}
        </select>
        {selectedExercise && data.exerciseTrends[selectedExercise]?.length > 0 ? (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data.exerciseTrends[selectedExercise]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#666", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-gray-600 text-center py-6">
            Henüz veri yok. Ağırlık girmeye başla!
          </p>
        )}
      </section>

      {/* Personal Records */}
      {Object.keys(prs).length > 0 && (
        <section className="mb-5 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
          <h3 className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
            <span>🏆</span> Kişisel Rekorlar
          </h3>
          <div className="space-y-2">
            {Object.entries(prs)
              .filter(([, v]) => v.maxWeight > 0)
              .sort(([, a], [, b]) => b.maxWeight - a.maxWeight)
              .map(([name, record]) => (
                <div key={name} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-gray-300">{name}</span>
                  <span className="text-xs font-bold text-amber-400">
                    {record.maxWeight}kg × {record.maxReps}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Body Weight Tracking */}
      <section className="mb-5 rounded-2xl border border-white/5 bg-white/2 p-4">
        <h3 className="text-xs font-semibold text-gray-300 mb-3">
          Vücut Ağırlığı
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="kg gir..."
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
              placeholder:text-gray-600 focus:outline-none focus:border-white/20 tabular-nums"
          />
          <button
            onClick={handleSaveWeight}
            disabled={saving || !weightInput}
            className="px-4 py-2.5 rounded-lg bg-white/10 text-sm font-medium text-white
              hover:bg-white/15 disabled:opacity-40 transition-all active:scale-95"
          >
            Kaydet
          </button>
        </div>
        {bwChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={bwChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#666", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: "#ec4899", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : bwChartData.length === 1 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Son kayıt: <span className="text-white font-bold">{bwChartData[0].kg} kg</span>
            <br />
            <span className="text-gray-600">Grafik için en az 2 kayıt gerekli.</span>
          </p>
        ) : (
          <p className="text-xs text-gray-600 text-center py-4">
            Henüz kayıt yok. Kilonuzu girin.
          </p>
        )}
        {bodyWeights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-gray-500 mb-2">Son kayıtlar</p>
            <div className="flex gap-2 flex-wrap">
              {bodyWeights.slice(0, 5).map((e) => (
                <span
                  key={e._id}
                  className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-gray-400"
                >
                  {new Date(e.date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                  : <span className="text-white font-medium">{e.weight}kg</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
