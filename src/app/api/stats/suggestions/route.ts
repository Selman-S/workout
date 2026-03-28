import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/lib/models/session";
import { workoutProgram } from "@/data/workouts";

// GET /api/stats/suggestions — progressive overload suggestions per exercise
export async function GET() {
  try {
    await connectDB();

    const sessions = await Session.find({ completedAt: { $ne: null } })
      .sort({ startedAt: -1 })
      .limit(120)
      .lean();

    // Group recent history per exercise: { weight, allSetsCompleted }
    const history: Record<string, { weight: number; allDone: boolean }[]> = {};

    for (const session of sessions) {
      const dayProgram = workoutProgram.find((d) => d.day === session.day);
      if (!dayProgram) continue;

      for (const ex of session.exercises) {
        const def = dayProgram.exercises[ex.exerciseIndex];
        if (!def) continue;

        if (!history[def.name]) history[def.name] = [];

        let maxWeight = 0;
        let allDone = true;
        for (const set of ex.completedSets) {
          const s = typeof set === "boolean" ? { completed: set } : set;
          if (!s.completed) allDone = false;
          if ((s.weight || 0) > maxWeight) maxWeight = s.weight || 0;
        }

        if (maxWeight > 0) {
          history[def.name].push({ weight: maxWeight, allDone });
        }
      }
    }

    const suggestions: Record<
      string,
      { currentWeight: number; suggestedWeight: number; reason: string }
    > = {};

    for (const [name, entries] of Object.entries(history)) {
      if (entries.length === 0) continue;

      const current = entries[0].weight;
      const recent = entries.slice(0, 3);

      if (recent.length >= 2) {
        const lastTwoCompleted = recent.slice(0, 2).every((h) => h.allDone);
        const sameWeight = recent.slice(0, 2).every((h) => h.weight === current);

        if (lastTwoCompleted && sameWeight) {
          // All sets completed at same weight 2x in a row → increase
          suggestions[name] = { currentWeight: current, suggestedWeight: current + 2.5, reason: "up" };
        } else if (!recent[0].allDone) {
          suggestions[name] = { currentWeight: current, suggestedWeight: current, reason: "hold" };
        } else {
          suggestions[name] = { currentWeight: current, suggestedWeight: current, reason: "hold" };
        }
      } else {
        suggestions[name] = { currentWeight: current, suggestedWeight: current, reason: "new" };
      }
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({});
  }
}
