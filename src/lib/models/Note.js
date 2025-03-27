import { Schema, Types, model } from "mongoose";

export const noteSchema = new Schema({
  title: String,
  text: String,
  charNum: Number,
  textStart: String,
  tagIDs: [Types.ObjectId],
  timeCreation: Date,
  timeLastModified: Date,
  userID: Types.ObjectId,
  isPublic: { type: Boolean, default: false },
  sharedUsers: [
    {
      email: String,
      userID: Types.ObjectId
    }
  ]
});

export const Note = model('Note', noteSchema);
