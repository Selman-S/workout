import { workoutProgram } from "./workouts";

// Exercise name → target muscle groups
export const exerciseMuscleMap: Record<string, string[]> = {
  "Goblet Squat": ["Bacak", "Core"],
  "Dumbbell Floor Press": ["Göğüs", "Triceps"],
  "Tek Kol Dumbbell Row": ["Sırt", "Biceps"],
  "DB Shoulder Press": ["Omuz", "Triceps"],
  "Romanian Deadlift": ["Bacak", "Sırt"],
  "Dumbbell Curl": ["Biceps"],
  "Overhead Triceps Ext.": ["Triceps"],
  "Plank": ["Core"],
  "Bulgarian Split Squat": ["Bacak"],
  "Şınav (Push-up)": ["Göğüs", "Triceps"],
  "Direnç Bandı Row": ["Sırt", "Biceps"],
  "Lateral Raise": ["Omuz"],
  "Hip Thrust": ["Bacak"],
  "Hammer Curl": ["Biceps"],
  "Triceps Pushdown": ["Triceps"],
  "Leg Raise": ["Core"],
  "Dumbbell Squat": ["Bacak", "Core"],
  "Incline Push-up": ["Göğüs", "Triceps"],
  "Dumbbell Row": ["Sırt", "Biceps"],
  "Pike Push-up": ["Omuz", "Triceps"],
  "Curl + Tricep Süperset": ["Biceps", "Triceps"],
  "Russian Twist": ["Core"],
};

export const ALL_MUSCLE_GROUPS = ["Göğüs", "Sırt", "Bacak", "Omuz", "Biceps", "Triceps", "Core"];

// Weekly target sets per muscle group (if all 3 days completed)
export function getWeeklyTargetSets(): Record<string, number> {
  const target: Record<string, number> = {};
  for (const day of workoutProgram) {
    for (const ex of day.exercises) {
      const groups = exerciseMuscleMap[ex.name] || [];
      for (const g of groups) {
        target[g] = (target[g] || 0) + ex.sets;
      }
    }
  }
  return target;
}
