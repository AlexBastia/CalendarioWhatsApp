import { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
  username: String,
  email: String,
  passwordHash: String,
  tags: [
    {
      name: String,
      noteIDs: [Types.ObjectId]
    }
  ]
});

export const User = model('User', userSchema);
