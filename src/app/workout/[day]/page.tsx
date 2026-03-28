import { notFound } from "next/navigation";
import { workoutProgram } from "@/data/workouts";
import WorkoutClient from "./WorkoutClient";
import type { DayKey } from "@/types";

interface Props {
  params: Promise<{ day: string }>;
}

export default async function WorkoutPage({ params }: Props) {
  const { day } = await params;
  const workout = workoutProgram.find((w) => w.day === day);

  if (!workout) return notFound();

  return <WorkoutClient workout={workout} />;
}

export function generateStaticParams() {
  return [{ day: "monday" }, { day: "wednesday" }, { day: "friday" }];
}

export async function generateMetadata({ params }: Props) {
  const { day } = await params;
  const workout = workoutProgram.find((w) => w.day === day);
  const dayLabels: Record<DayKey, string> = {
    monday: "Pazartesi",
    wednesday: "Çarşamba",
    friday: "Cuma",
  };
  return {
    title: workout
      ? `${dayLabels[day as DayKey] || day} — ${workout.dayTitle}`
      : "Antrenman",
  };
}
