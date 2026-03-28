import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExerciseSettings from "@/lib/models/exerciseSettings";

// GET /api/exercise-settings?day=monday
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const day = req.nextUrl.searchParams.get("day");

    if (day) {
      const settings = await ExerciseSettings.findOne({ day }).lean();
      return NextResponse.json(settings || null);
    }

    const all = await ExerciseSettings.find().lean();
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET exercise-settings error:", error);
    return NextResponse.json(null);
  }
}

// POST /api/exercise-settings — upsert settings for a day
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { day, exercises } = await req.json();

    const settings = await ExerciseSettings.findOneAndUpdate(
      { day },
      { day, exercises },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error("POST exercise-settings error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
