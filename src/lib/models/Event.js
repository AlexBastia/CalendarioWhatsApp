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
        ripetizione: {
            isRepeatable: {type: Boolean, default: false},
            frequenza: {type: String, enum: ['GIORNALIERO', 'SETTIMANALE', 'MENSILE', 'ANNUALE'], default: null},
            giorniSettimana: [Number], // es: [2,4] → martedì e giovedì. 0 = domenica, 6 = sabato
            monthlyMode: {type: String, enum: ['dayOfMonth', 'nthWeekday'], default: 'dayOfMonth'},
            nthWeekday: {
            week: Number,       // es: 1 = primo, 2 = secondo ...
            weekday: Number     // es: 1 = lunedì
            },
            endCondition: {
                type: {type: String, enum: ['MAI', 'N_VOLTE', 'FINO AL'], default: 'MAI'},
                nVolte: Number,      
                endDate: Date     
            }
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