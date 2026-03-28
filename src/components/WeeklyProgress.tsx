"use client";

const days = [
  { key: "monday" as const, label: "Pzt", num: 1 },
  { key: "wednesday" as const, label: "Çar", num: 3 },
  { key: "friday" as const, label: "Cum", num: 5 },
];

const colors: Record<string, string> = {
  monday: "#ef4444",
  wednesday: "#3b82f6",
  friday: "#22c55e",
};

interface WeeklyProgressProps {
  weeklyCompleted: { monday: boolean; wednesday: boolean; friday: boolean };
}

export default function WeeklyProgress({
  weeklyCompleted,
}: WeeklyProgressProps) {
  const count = Object.values(weeklyCompleted).filter(Boolean).length;
  const today = new Date().getDay();
  const todayNum = today === 0 ? 7 : today;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium">Bu Hafta</span>
        <span className="text-xs font-bold text-white">{count}/3</span>
      </div>
      <div className="flex gap-2">
        {days.map(({ key, label, num }) => {
          const done = weeklyCompleted[key];
          const isPast = todayNum > num;
          const isToday = todayNum === num;
          const color = colors[key];

          return (
            <div
              key={key}
              className={`flex-1 rounded-xl p-2.5 text-center border transition-all ${
                done
                  ? "border-transparent"
                  : isToday
                  ? "border-white/10 bg-white/4"
                  : isPast
                  ? "border-red-500/10 bg-red-500/5"
                  : "border-white/5"
              }`}
              style={done ? { background: `${color}15`, borderColor: `${color}30` } : {}}
            >
              <p className="text-[10px] text-gray-500 mb-1">{label}</p>
              {done ? (
                <svg
                  className="w-5 h-5 mx-auto"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isPast ? (
                <svg
                  className="w-5 h-5 mx-auto text-red-500/40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <div
                  className={`w-5 h-5 mx-auto rounded-full ${
                    isToday ? "border-2 border-white/20" : "border border-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${(count / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}
