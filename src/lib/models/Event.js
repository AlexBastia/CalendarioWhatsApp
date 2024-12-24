import { Schema, model } from "mongoose";

const eventSchema = new Schema(
    {
        title: String,
        start: Date,
        end: Date,
        place: String,
        allDay: Boolean,
        note: String
    }
)
export const Evento = model('Event', eventSchema);
