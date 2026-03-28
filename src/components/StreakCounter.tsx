"use client";

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  if (streak === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
        <span className="text-2xl">🔥</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{streak}</p>
        <p className="text-xs text-amber-500/80">
          {streak === 1 ? "Hafta Serisi" : "Hafta Serisi"}
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-[10px] text-gray-500">Devam et!</p>
        <p className="text-[10px] text-gray-600">Seriyi kırma</p>
      </div>
    </div>
  );
}
