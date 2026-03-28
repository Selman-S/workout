import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/lib/models/session";

// GET /api/stats/home — active session, weekly progress, streak
export async function GET() {
  try {
    await connectDB();

    // Find incomplete session (for resume)
    const activeSession = await Session.findOne({ completedAt: null })
      .sort({ startedAt: -1 })
      .lean();

    // This week's completed sessions (Mon-Sun)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekSessions = await Session.find({
      completedAt: { $ne: null },
      startedAt: { $gte: weekStart },
    }).lean();

    const weeklyCompleted = {
      monday: weekSessions.some((s) => s.day === "monday"),
      wednesday: weekSessions.some((s) => s.day === "wednesday"),
      friday: weekSessions.some((s) => s.day === "friday"),
    };

    // Calculate streak: consecutive full weeks (3/3) going backwards
    let streak = 0;
    const completedThisWeek = Object.values(weeklyCompleted).filter(Boolean).length;

    // Check if current week is full so far (only count past/today days)
    const currentDayNum = dayOfWeek === 0 ? 7 : dayOfWeek;
    const expectedDays = [1, 3, 5].filter((d) => d <= currentDayNum);
    const currentWeekOnTrack =
      expectedDays.length > 0 &&
      expectedDays.every((d) => {
        const key = { 1: "monday", 3: "wednesday", 5: "friday" }[d] as keyof typeof weeklyCompleted;
        return weeklyCompleted[key];
      });

    // Check previous weeks
    for (let w = 1; w <= 52; w++) {
      const wStart = new Date(weekStart);
      wStart.setDate(wStart.getDate() - 7 * w);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 7);

      const pastWeekSessions = await Session.find({
        completedAt: { $ne: null },
        startedAt: { $gte: wStart, $lt: wEnd },
      }).lean();

      const days = new Set(pastWeekSessions.map((s) => s.day));
      if (days.has("monday") && days.has("wednesday") && days.has("friday")) {
        streak++;
      } else {
        break;
      }
    }

    // Add current week if on track
    if (currentWeekOnTrack || completedThisWeek === 3) {
      streak++;
    }

    return NextResponse.json({
      activeSession: activeSession
        ? JSON.parse(JSON.stringify(activeSession))
        : null,
      weeklyCompleted,
      streak,
    });
  } catch (error) {
    console.error("Home stats error:", error);
    return NextResponse.json(
      { activeSession: null, weeklyCompleted: { monday: false, wednesday: false, friday: false }, streak: 0 },
    );
  }
}
