import { Evento } from '$lib/models/Event.js';
import { redirect } from '@sveltejs/kit';
import {sub, parse} from "date-fns"

export async function load({ locals }) {
    // Proteggi la rotta: se l'utente non è loggato, reindirizzalo
    if (!locals.user) {
        redirect(303, '/login');
    }
}

export const actions = {
     deleteEvent: async ({ locals, request }) => {
        console.log("deleteEvent action called");
        
        if (!locals.user) {
          redirect(301, '/login');
        }
        const formData = await request.formData();
        const eventId = formData.get('id');
    
        // FIX di sicurezza: assicurati che l'utente possa eliminare solo i propri eventi
        await Evento.deleteOne({ _id: eventId, userID: locals.user.id });
    
        // Reindirizza anche dopo l'eliminazione
        throw redirect(303, '/calendario');
      },
    saveEvent: async ({ locals, request }) => {
        console.log('Azione saveEvent invocata');
        if (!locals.user) {
          redirect(301, '/login');
        }
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        const allDay = data.allDay === 'on';
        let start, end;

                if (allDay) {
            // Questo blocco era già corretto
            start = parse(data.dateStart, 'yyyy-MM-dd', new Date());
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
        } else {
            start = parse(`${data.dateStart} ${data.timeStart}`, 'yyyy-MM-dd HH:mm', new Date());
            end = parse(`${data.dateStart} ${data.timeEnd}`, 'yyyy-MM-dd HH:mm', new Date());
        }

        let ripetizione = {
          isRepeatable: data.isRepeatable === 'true',
          frequenza: data.frequenza || null,
          giorniSettimana: data.giorniSettimana
            ? Array.isArray(data.giorniSettimana)
              ? data.giorniSettimana.map(Number)
              : [Number(data.giorniSettimana)]
            : [],
          monthlyMode: data.monthlyMode || null,
          nthWeekday: data.week && data.weekday
            ? {
              week: Number(data.week),
              weekday: Number(data.weekday)
            }
            : null,
          endCondition: {
            type: data.endType || 'MAI',
            nVolte: data.endCount ? Number(data.endCount) : null,
            endDate: data.endDate ? new Date(data.endDate) : null
          },
          //lastDate = mkLastDate(event_object); OPTIMIZATION POSSIBLE
        };


        const notificationSettings = {
        enabled: data.notificationEnabled === 'on',
        advanceValue: parseInt(data.notificationAdvanceValue, 10) || 0,
        advanceUnit: data.notificationAdvanceUnit || 'minutes',
        repeat: data.notificationRepeat || 'none',
        // CORRETTO: era 'repeatNumber', ora è 'notificationRepeatNumber'
        repeat_number: (data.notificationRepeat && data.notificationRepeat !== 'none') 
            ? (parseInt(data.notificationRepeatNumber, 10) || 1) 
            : 0  // Usa 0 invece di null quando repeat è 'none'
    };


        // Se le notifiche sono abilitate, calcoliamo il campo 'notifyAt'
        if (notificationSettings.enabled) {
            notificationSettings.notifyAt = sub(start, {
                [notificationSettings.advanceUnit]: notificationSettings.advanceValue
            });
        }
        
        // MODIFICATO: Aggiungiamo 'notificationSettings' all'oggetto da salvare
        const eventData = {
          title: data.title,
          note: data.note,
          start: start,
          end: end,
          place: data.location,
          allDay: allDay,
          eventType: data.eventType,
          ripetizione: ripetizione,
          pomodoroPreset: data.eventType === 'POMODORO' ? data.pomodoroPreset : null,
          status: data.eventType === 'POMODORO' ? 'PIANIFICATO' : null,
          userID: locals.user.id,
          notificationSettings: notificationSettings // Aggiunto qui
        };
        
        const eventId = data.id || null;

        if (eventId) {
          await Evento.findOneAndUpdate({ _id: eventId, userID: locals.user.id }, eventData);
        } else {
          await Evento.create(eventData);
        }

        throw redirect(303, '/calendario');
    },
}
