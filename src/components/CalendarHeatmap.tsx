"use client";

import { IWorkoutSession, DayKey } from "@/types";

const dayColors: Record<string, string> = {
  monday: "#ef4444",
  wednesday: "#3b82f6",
  friday: "#22c55e",
};

const dayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

interface CalendarHeatmapProps {
  sessions: IWorkoutSession[];
}

export default function CalendarHeatmap({ sessions }: CalendarHeatmapProps) {
  const dateMap = new Map<string, { day: DayKey; completed: boolean }>();

  for (const s of sessions) {
    const dateKey = new Date(s.startedAt).toISOString().slice(0, 10);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        day: s.day as DayKey,
        completed: !!s.completedAt,
      });
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = today.getDay();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - (todayDay === 0 ? 6 : todayDay - 1));

  // Generate last 12 weeks
  const weeks: Date[][] = [];
  for (let w = 11; w >= 0; w--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - 7 * w);
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);
      week.push(date);
    }
    weeks.push(week);
  }

  // Month labels for the top row
  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const monthHeaders: (string | null)[] = [];
  let lastMonth = -1;
  for (const week of weeks) {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      monthHeaders.push(monthNames[m]);
      lastMonth = m;
    } else {
      monthHeaders.push(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
      <h3 className="text-xs font-semibold text-gray-300 mb-3">Son 12 Hafta</h3>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-fit">
          {/* Month labels row */}
          <div className="flex gap-0.5 ml-7">
            {monthHeaders.map((label, i) => (
              <div key={i} className="w-[14px] text-center">
                {label && (
                  <span className="text-[8px] text-gray-500">{label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Grid: 7 rows (Mon-Sun) × 12 cols (weeks) */}
          {dayLabels.map((label, rowIdx) => (
            <div key={label} className="flex items-center gap-0.5">
              <span className="w-6 text-[8px] text-gray-600 text-right pr-1 shrink-0">
                {rowIdx % 2 === 0 ? label : ""}
              </span>
              {weeks.map((week, wIdx) => {
                const date = week[rowIdx];
                const dateKey = date.toISOString().slice(0, 10);
                const info = dateMap.get(dateKey);
                const isFuture = date > today;

                const jsDay = date.getDay();
                const isWorkoutDay = jsDay === 1 || jsDay === 3 || jsDay === 5;
                const isPast = date < today;
                const isMissed = isWorkoutDay && isPast && !info;
                const isToday = dateKey === today.toISOString().slice(0, 10);

                let bg = "bg-white/[0.03]";
                if (isFuture) bg = "bg-white/[0.01]";
                else if (isMissed) bg = "bg-red-500/8";

                return (
                  <div
                    key={`${wIdx}-${rowIdx}`}
                    className={`w-[14px] h-[14px] rounded-[3px] transition-all ${
                      info ? "" : bg
                    } ${isToday ? "ring-1 ring-white/30" : ""}`}
                    style={
                      info
                        ? {
                            background: info.completed
                              ? dayColors[info.day] || "#888"
                              : `${dayColors[info.day] || "#888"}30`,
                          }
                        : undefined
                    }
                    title={`${dateKey}${info ? ` — ${info.day}` : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span className="text-[9px] text-gray-500">Pzt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span className="text-[9px] text-gray-500">Çar</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
          <span className="text-[9px] text-gray-500">Cum</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500/10 border border-red-500/20" />
          <span className="text-[9px] text-gray-500">Kaçırılan</span>
        </div>
      </div>
    </div>
  );
}
