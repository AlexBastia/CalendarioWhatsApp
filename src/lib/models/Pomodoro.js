import mongoose  from "mongoose";

export const pomodoroSchema = new mongoose.Schema({
    timeStudy: Date, 
    timeBreak: Date,
    userID: mongoose.Schema.Types.ObjectId,
    sharedUsers: [
        {
          email: String,
          userID: mongoose.Schema.Types.ObjectId
        }
    ],
    title: String,
    cycles: Number
  });

export const Pomodoro = mongoose.models.Pomodoro || mongoose.model('Pomodoro', pomodoroSchema) ;