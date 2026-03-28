import mongoose, { Schema, Document } from "mongoose";

export interface IBodyWeight extends Document {
  date: Date;
  weight: number;
}

const BodyWeightSchema = new Schema<IBodyWeight>(
  {
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.BodyWeight ||
  mongoose.model<IBodyWeight>("BodyWeight", BodyWeightSchema);
