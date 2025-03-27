import { Schema, Types, model } from "mongoose";

export const listSchema = new Schema({
  title: String,
  charNum: Number,
  timeCreation: Date,
  timeLastModified: Date,
  userID: Types.ObjectId,
  items: [{
    descr: String,
    deadline: Date
  }]
});

export const List = model('List', listSchema);
