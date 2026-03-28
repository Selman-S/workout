import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/lib/models/session";

// GET /api/sessions — list sessions. ?limit=N, ?day=monday, ?last=true (last completed for a day)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;
    const day = req.nextUrl.searchParams.get("day");
    const last = req.nextUrl.searchParams.get("last") === "true";

    const filter: Record<string, unknown> = {};
    if (day) filter.day = day;
    if (last) filter.completedAt = { $ne: null };

    const sessions = await Session.find(filter)
      .sort({ startedAt: -1 })
      .limit(last ? 1 : limit)
      .lean();

    return NextResponse.json(last ? sessions[0] || null : sessions);
  } catch (error) {
    console.error("GET sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/sessions — create a new workout session
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { day, exercises, totalSets } = body;

    const session = await Session.create({
      date: new Date(),
      day,
      exercises,
      startedAt: new Date(),
      completedAt: null,
      totalSets,
      completedSetCount: 0,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("POST session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
