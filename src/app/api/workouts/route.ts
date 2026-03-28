import { NextResponse } from "next/server";
import { workoutProgram } from "@/data/workouts";

// GET /api/workouts — return the static workout program
export async function GET() {
  return NextResponse.json(workoutProgram);
}
