import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BodyWeight from "@/lib/models/bodyweight";

// GET /api/bodyweight — list entries, newest first
export async function GET() {
  try {
    await connectDB();
    const entries = await BodyWeight.find().sort({ date: -1 }).limit(100).lean();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET bodyweight error:", error);
    return NextResponse.json([]);
  }
}

// POST /api/bodyweight — add new entry
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { date, weight } = await req.json();

    const entry = await BodyWeight.create({
      date: date ? new Date(date) : new Date(),
      weight,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST bodyweight error:", error);
    return NextResponse.json(
      { error: "Failed to save weight" },
      { status: 500 }
    );
  }
}
