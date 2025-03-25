import { Schema, Types, model } from "mongoose";

export const noteSchema = new Schema({
  title: String,
  text: String,
  charNum: Number,
  textStart: String,
  tagIDs: [Types.ObjectId],
  timeCreation: Date,
  timeLastModified: Date,
  userID: Types.ObjectId
});

export const Note = model('Note', noteSchema);
