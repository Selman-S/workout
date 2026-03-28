import mongoose, { Schema, Document } from "mongoose";

export interface IExerciseSettings extends Document {
  day: string;
  exercises: {
    exerciseIndex: number;
    weight: number;
    targetReps: number;
    setDuration: number;
  }[];
}

const ExerciseSettingSchema = new Schema(
  {
    exerciseIndex: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    targetReps: { type: Number, default: 10 },
    setDuration: { type: Number, default: 40 },
  },
  { _id: false }
);

const ExerciseSettingsSchema = new Schema<IExerciseSettings>(
  {
    day: { type: String, required: true, unique: true },
    exercises: [ExerciseSettingSchema],
  },
  { timestamps: true }
);

export default mongoose.models.ExerciseSettings ||
  mongoose.model<IExerciseSettings>("ExerciseSettings", ExerciseSettingsSchema);
