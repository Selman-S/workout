import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  date: Date;
  day: string;
  exercises: {
    exerciseIndex: number;
    completedSets: { completed: boolean; weight?: number; reps?: number }[];
  }[];
  startedAt: Date;
  completedAt: Date | null;
  totalSets: number;
  completedSetCount: number;
}

const CompletedSetSchema = new Schema(
  {
    completed: { type: Boolean, default: false },
    weight: { type: Number },
    reps: { type: Number },
  },
  { _id: false }
);

const SessionExerciseSchema = new Schema(
  {
    exerciseIndex: { type: Number, required: true },
    completedSets: { type: [CompletedSetSchema], required: true },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    date: { type: Date, required: true },
    day: { type: String, required: true },
    exercises: [SessionExerciseSchema],
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    totalSets: { type: Number, required: true },
    completedSetCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
