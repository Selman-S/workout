export interface Exercise {
  order: number;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  tip: string;
}

export type DayKey = "monday" | "wednesday" | "friday";

export interface WorkoutDay {
  day: DayKey;
  dayLabel: string;
  dayTitle: string;
  daySubtitle: string;
  color: string;
  exercises: Exercise[];
}

export interface SetData {
  completed: boolean;
  weight?: number;
  reps?: number;
}

export interface SessionExercise {
  exerciseIndex: number;
  completedSets: SetData[];
}

export interface IWorkoutSession {
  _id: string;
  date: string;
  day: string;
  exercises: SessionExercise[];
  startedAt: string;
  completedAt?: string | null;
  totalSets: number;
  completedSetCount: number;
}

export interface IBodyWeight {
  _id: string;
  date: string;
  weight: number;
}

export interface PRRecord {
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  date: string;
}

export interface HomeStats {
  activeSession: IWorkoutSession | null;
  weeklyCompleted: { monday: boolean; wednesday: boolean; friday: boolean };
  streak: number;
}

// Exercise settings configured in the settings page
export interface ExerciseSettingData {
  exerciseIndex: number;
  weight: number;
  targetReps: number;
  setDuration: number;
}

export interface DaySettings {
  _id?: string;
  day: string;
  exercises: ExerciseSettingData[];
}

// Auto-flow workout step (warmup/cooldown phases included)
export interface WorkoutStep {
  type: "warmup" | "prepare" | "exercise" | "rest" | "cooldown";
  duration: number;
  exerciseIndex: number;
  setIndex: number;
  label?: string;
  tip?: string;
  isSuperset?: boolean;
}

// Progressive overload suggestion
export interface ProgressionSuggestion {
  currentWeight: number;
  suggestedWeight: number;
  reason: "up" | "hold" | "new";
}

// Muscle group volume data
export interface MuscleGroupVolume {
  group: string;
  actual: number;
  target: number;
}
