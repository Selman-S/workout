import Link from "next/link";
import { WorkoutDay } from "@/types";
import { getTotalSets } from "@/data/workouts";

interface DayCardProps {
  workout: WorkoutDay;
  isToday: boolean;
  isCompact?: boolean;
}

export default function DayCard({
  workout,
  isToday,
  isCompact = false,
}: DayCardProps) {
  const totalSets = getTotalSets(workout);
  const totalExercises = workout.exercises.length;

  if (isCompact) {
    return (
      <Link href={`/workout/${workout.day}`} className="block group">
        <div
          className={`relative rounded-2xl border p-4 transition-all duration-200
            active:scale-[0.98] overflow-hidden ${
              isToday
                ? "border-white/10 bg-white/4"
                : "border-white/5 bg-white/2"
            }`}
        >
          {/* Top color bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: workout.color }}
          />
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{
                background: `${workout.color}15`,
                color: workout.color,
              }}
            >
              {workout.dayLabel.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {workout.dayLabel}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {totalExercises} egzersiz • {totalSets} set
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/workout/${workout.day}`} className="block group">
      <div
        className={`relative rounded-2xl border p-5 transition-all duration-200
          active:scale-[0.98] overflow-hidden ${
            isToday
              ? "border-white/10 bg-white/4"
              : "border-white/5 bg-white/2"
          }`}
      >
        {/* Gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{
            background: `linear-gradient(90deg, ${workout.color}, ${workout.color}66)`,
          }}
        />

        {isToday && (
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3"
            style={{
              background: `${workout.color}18`,
              color: workout.color,
            }}
          >
            Bugün
          </span>
        )}

        <h3 className="text-lg font-bold text-white">{workout.dayLabel}</h3>
        <p className="text-sm font-medium mt-0.5" style={{ color: workout.color }}>
          {workout.dayTitle}
        </p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {workout.daySubtitle}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              <span className="font-bold text-white">{totalExercises}</span> egzersiz
            </span>
            <span className="text-xs text-gray-400">
              <span className="font-bold text-white">{totalSets}</span> set
            </span>
          </div>
          <div
            className="flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
            style={{ color: workout.color }}
          >
            Başla
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
