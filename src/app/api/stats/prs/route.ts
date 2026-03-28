import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/lib/models/session";
import { workoutProgram } from "@/data/workouts";

// GET /api/stats/prs — personal records per exercise
export async function GET() {
  try {
    await connectDB();

    const sessions = await Session.find({ completedAt: { $ne: null } })
      .sort({ startedAt: -1 })
      .lean();

    // Build exercise name list from program
    const exerciseNames = new Set<string>();
    workoutProgram.forEach((day) =>
      day.exercises.forEach((ex) => exerciseNames.add(ex.name))
    );

    // Calculate PRs
    const prs: Record<string, { maxWeight: number; maxReps: number; date: string }> = {};

    for (const session of sessions) {
      const dayProgram = workoutProgram.find((d) => d.day === session.day);
      if (!dayProgram) continue;

      for (const ex of session.exercises) {
        const exerciseDef = dayProgram.exercises[ex.exerciseIndex];
        if (!exerciseDef) continue;

        const name = exerciseDef.name;
        if (!prs[name]) {
          prs[name] = { maxWeight: 0, maxReps: 0, date: "" };
        }

        for (const set of ex.completedSets) {
          // Handle both old boolean format and new object format
          const setData = typeof set === "boolean"
            ? { completed: set }
            : set;

          if (!setData.completed) continue;

          const w = setData.weight || 0;
          const r = setData.reps || 0;

          if (w > prs[name].maxWeight || (w === prs[name].maxWeight && r > prs[name].maxReps)) {
            prs[name].maxWeight = w;
            prs[name].maxReps = r;
            prs[name].date = session.startedAt?.toString() || "";
          }
        }
      }
    }

    return NextResponse.json(prs);
  } catch (error) {
    console.error("PRs error:", error);
    return NextResponse.json({});
  }
}
