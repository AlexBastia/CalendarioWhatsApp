import mongoose  from "mongoose";

export const pomodoroSchema = new mongoose.Schema({
    timeStudy: Date, 
    timeBreak: Date,
    timeLastUsed: Date,
    userID: mongoose.Schema.Types.ObjectId,
    sharedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    title: String,
    cycles: Number
  });

export const Pomodoro = mongoose.models.Pomodoro || mongoose.model('Pomodoro', pomodoroSchema) ;