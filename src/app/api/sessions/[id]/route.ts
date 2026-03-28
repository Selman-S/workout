import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/lib/models/session";

// PATCH /api/sessions/[id] — update set completion with weight/reps, or finish session
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Update a specific set with weight/reps
    if (body.exerciseIndex !== undefined && body.setIndex !== undefined) {
      const ex = session.exercises[body.exerciseIndex];
      if (ex) {
        ex.completedSets[body.setIndex] = {
          completed: body.completed ?? false,
          weight: body.weight,
          reps: body.reps,
        };
        session.completedSetCount = session.exercises.reduce(
          (acc: number, e: { completedSets: { completed: boolean }[] }) =>
            acc + e.completedSets.filter((s) => s.completed).length,
          0
        );
      }
    }

    if (body.completedAt) {
      session.completedAt = new Date(body.completedAt);
    }

    await session.save();
    return NextResponse.json(session);
  } catch (error) {
    console.error("PATCH session error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// GET /api/sessions/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await Session.findById(id).lean();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("GET session error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
