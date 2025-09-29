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
        },
          notificationSettings: {
    enabled: { type: Boolean, default: false },
    // Quando inviare la notifica (calcolato dal server)
    notifyAt: { type: Date }, 
    // Valore scelto dall'utente (es: 15)
    advanceValue: { type: Number, default: 15 }, 
    // Unità scelta dall'utente (es: 'minutes')
    advanceUnit: { type: String, enum: ['minutes', 'hours', 'days'], default: 'minutes' },
    // Ripetizione scelta dall'utente
    repeat: { type: String, enum: ['none', 'every_minute'], default: 'none' },
    // Meccanismo (per ora usiamo 'os' per 'sistema operativo')
    mechanism: [{ type: String, enum: ['os', 'email'], default: 'os' }]
  }

    }
);

export const Evento = model('Evento', eventSchema);