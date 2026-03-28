import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Workout from "@/lib/models/workout";
import { workoutProgram } from "@/data/workouts";

// POST /api/workouts/seed — seed the workout program into MongoDB
export async function POST() {
  try {
    await connectDB();

    await Workout.deleteMany({});
    await Workout.insertMany(workoutProgram);

    return NextResponse.json({
      message: "Workout program seeded successfully",
      count: workoutProgram.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed workout data" },
      { status: 500 }
    );
  }
}
