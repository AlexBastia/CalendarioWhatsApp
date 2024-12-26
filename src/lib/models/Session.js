import { Schema, model, Types } from "mongoose";

const sessionSchema = new Schema({
  id: String,
  userId: Types.ObjectId,
  expiresAt: Date
});

export const Session = model('Session', sessionSchema);

