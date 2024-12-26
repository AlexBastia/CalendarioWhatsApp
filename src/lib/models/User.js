import { Schema, model } from "mongoose";
import { appuntoSchema } from "./Appunto";

const userSchema = new Schema({
  username: String,
  email: String,
  passwordHash: String,
});

export const User = model('User', userSchema);


