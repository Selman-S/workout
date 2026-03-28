import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  day: string;
  dayLabel: string;
  dayTitle: string;
  daySubtitle: string;
  color: string;
  exercises: {
    order: number;
    name: string;
    sets: number;
    reps: string;
    rest: number;
    tip: string;
  }[];
}

const ExerciseSchema = new Schema(
  {
    order: { type: Number, required: true },
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    rest: { type: Number, required: true },
    tip: { type: String, required: true },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>({
  day: { type: String, required: true, unique: true },
  dayLabel: { type: String, required: true },
  dayTitle: { type: String, required: true },
  daySubtitle: { type: String, required: true },
  color: { type: String, required: true },
  exercises: [ExerciseSchema],
});

export default mongoose.models.Workout ||
  mongoose.model<IWorkout>("Workout", WorkoutSchema);
