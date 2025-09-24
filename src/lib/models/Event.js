import mongoose, { Schema, model, Types } from "mongoose";

const eventSchema = new Schema(
    {
        title: String,
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        place: String,
        allDay: Boolean,
        note: String,
        userID: Types.ObjectId,
        isPublic: { type: Boolean, default: false },
        sharedUsers:  [{
            type: Types.ObjectId,
            ref: 'User'
        }],
        eventType: {
            type: String,
            enum: ['STANDARD', 'POMODORO'],
            default: 'STANDARD',
            required: true
        },
        pomodoroPreset: {
            type: Types.ObjectId,
            ref: 'Pomodoro',
            required: function() { return this.eventType === 'POMODORO'; }
        },

        status: {
            type: String,
            enum: ['PIANIFICATO', 'COMPLETATO', 'INCOMPLETO'],
            default: 'PIANIFICATO',
            required: function() { return this.eventType === 'POMODORO' }
        }
    }
);

export const Evento = model('Evento', eventSchema);