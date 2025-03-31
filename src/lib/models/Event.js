import { Schema, model } from "mongoose";

const eventSchema = new Schema(
    {
        title: String,
        start: Date,
        end: Date,
        place: String,
        allDay: Boolean,
        note: String,
        userID: Types.ObjectId,
        isPublic: { type: Boolean, default: false },
        sharedUsers: [
            {
              email: String,
              userID: Types.ObjectId
            }
          ],
        isPomodoro: { type: Boolean, default: false },
        pomodoroID: Types.ObjectId
    }
);
export const Evento = model('Evento', eventSchema);
