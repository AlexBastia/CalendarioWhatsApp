import mongoose, { Schema, model, Types } from "mongoose";

const eventSchema = new Schema(
    {
        title: String,
        start: {
            type: Date,
            required: function() { 
                return this.eventType !== 'ATTIVITA'; 
            }
        },
        end: {
            type: Date,
            required: function() { 
                return this.eventType !== 'ATTIVITA'; 
            }
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
            enum: ['STANDARD', 'POMODORO', 'ATTIVITA'],
            default: 'STANDARD',
            required: true
        },
        deadline:{
            type: Date,
            required: function() { return this.eventType === 'ATTIVITA'; }
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
            required: function() { return this.eventType === 'POMODORO' || this.eventType === 'ATTIVITA' ; }
        }
    }
);

export const Evento = model('Evento', eventSchema);