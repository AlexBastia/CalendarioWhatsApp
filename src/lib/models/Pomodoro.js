import mongoose  from "mongoose";

export const pomodoroSchema = new mongoose.Schema({
    timeStudy: Date, 
    timeBreak: Date,
    userID: mongoose.Schema.Types.ObjectId,
    sharedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    title: String,
    cycles: Number,
    timeLastUsed: Date
  });

export const Pomodoro = mongoose.models.Pomodoro || mongoose.model('Pomodoro', pomodoroSchema) ;