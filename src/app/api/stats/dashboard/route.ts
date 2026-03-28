import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/lib/models/session";
import { workoutProgram } from "@/data/workouts";
import { exerciseMuscleMap, ALL_MUSCLE_GROUPS, getWeeklyTargetSets } from "@/data/muscleGroups";

// GET /api/stats/dashboard — weekly volume chart, consistency, exercise trends
export async function GET() {
  try {
    await connectDB();

    const sessions = await Session.find({ completedAt: { $ne: null } })
      .sort({ startedAt: 1 })
      .lean();

    // Weekly volume: sum of (weight × reps) per week
    const weeklyVolume: { week: string; volume: number; sessions: number }[] = [];
    const weekMap = new Map<string, { volume: number; sessions: number }>();

    for (const session of sessions) {
      const d = new Date(session.startedAt);
      const dayOfWeek = d.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(d.getDate() + mondayOffset);
      const weekKey = monday.toISOString().slice(0, 10);

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { volume: 0, sessions: 0 });
      }
      const entry = weekMap.get(weekKey)!;
      entry.sessions++;

      for (const ex of session.exercises) {
        for (const set of ex.completedSets) {
          const s = typeof set === "boolean" ? { completed: set } : set;
          if (s.completed && s.weight && s.reps) {
            entry.volume += s.weight * s.reps;
          }
        }
      }
    }

    for (const [week, data] of weekMap) {
      weeklyVolume.push({ week, ...data });
    }

    // Exercise trends: weight over time per exercise
    const exerciseTrends: Record<string, { date: string; weight: number; reps: number }[]> = {};

    for (const session of sessions) {
      const dayProgram = workoutProgram.find((dp) => dp.day === session.day);
      if (!dayProgram) continue;

      for (const ex of session.exercises) {
        const def = dayProgram.exercises[ex.exerciseIndex];
        if (!def) continue;

        if (!exerciseTrends[def.name]) exerciseTrends[def.name] = [];

        let maxWeight = 0;
        let maxReps = 0;
        for (const set of ex.completedSets) {
          const s = typeof set === "boolean" ? { completed: set } : set;
          if (s.completed && (s.weight || 0) > maxWeight) {
            maxWeight = s.weight || 0;
            maxReps = s.reps || 0;
          }
        }

        if (maxWeight > 0) {
          exerciseTrends[def.name].push({
            date: new Date(session.startedAt).toISOString().slice(0, 10),
            weight: maxWeight,
            reps: maxReps,
          });
        }
      }
    }

    // Consistency: sessions per week for the last 8 weeks
    const consistency: { week: string; count: number }[] = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const wStart = new Date(now);
      const dayOfWeek = wStart.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      wStart.setDate(wStart.getDate() + mondayOffset - 7 * w);
      wStart.setHours(0, 0, 0, 0);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 7);

      const count = sessions.filter((s) => {
        const d = new Date(s.startedAt);
        return d >= wStart && d < wEnd;
      }).length;

      const label = `${wStart.getDate()}/${wStart.getMonth() + 1}`;
      consistency.push({ week: label, count });
    }

    // Muscle group volume for the current week
    const now2 = new Date();
    const dow2 = now2.getDay();
    const monOff2 = dow2 === 0 ? -6 : 1 - dow2;
    const weekStart = new Date(now2);
    weekStart.setDate(now2.getDate() + monOff2);
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekSessions = sessions.filter(
      (s) => new Date(s.startedAt) >= weekStart
    );

    const actualSets: Record<string, number> = {};
    for (const session of thisWeekSessions) {
      const dp = workoutProgram.find((d) => d.day === session.day);
      if (!dp) continue;
      for (const ex of session.exercises) {
        const def = dp.exercises[ex.exerciseIndex];
        if (!def) continue;
        const groups = exerciseMuscleMap[def.name] || [];
        const done = ex.completedSets.filter((s: boolean | { completed: boolean }) =>
          typeof s === "boolean" ? s : s.completed
        ).length;
        for (const g of groups) {
          actualSets[g] = (actualSets[g] || 0) + done;
        }
      }
    }

    const targetSets = getWeeklyTargetSets();
    const muscleGroupVolume = ALL_MUSCLE_GROUPS.map((g) => ({
      group: g,
      actual: actualSets[g] || 0,
      target: targetSets[g] || 0,
    }));

    return NextResponse.json({
      weeklyVolume,
      exerciseTrends,
      consistency,
      totalSessions: sessions.length,
      muscleGroupVolume,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({
      weeklyVolume: [],
      exerciseTrends: {},
      consistency: [],
      totalSessions: 0,
      muscleGroupVolume: [],
    });
  }
}
