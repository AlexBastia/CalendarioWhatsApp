import { Evento } from '$lib/models/Event.js';
import { redirect } from '@sveltejs/kit';

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
      start = new Date(data.dateStart + 'T00:00:00');
      end = new Date(data.dateStart + 'T23:59:59');
    } else {
      start = new Date(`${data.dateStart}T${data.timeStart}`);
      end = new Date(`${data.dateStart}T${data.timeEnd}`);
    }

    // Prepara il pacchetto di dati da salvare, includendo i campi pomodoro
    const eventData = {
      title: data.title,
      note: data.note,
      start: start,
      end: end,
      place: data.location,
      allDay: allDay,
      eventType: data.eventType,
      pomodoroPreset: data.eventType === 'POMODORO' ? data.pomodoroPreset : null,
      status: data.eventType === 'POMODORO' ? 'PIANIFICATO' : null,
      userID: locals.user.id 
    };
    
    const eventId = data.id || null;

    if (eventId) {
      // Se c'è un ID, aggiorna l'evento esistente
      await Evento.findOneAndUpdate({ _id: eventId, userID: locals.user.id }, eventData);
    } else {
      // Altrimenti, crea un nuovo evento
      await Evento.create(eventData);
    }

    // Reindirizza l'utente al calendario dopo l'operazione
    throw redirect(303, '/calendario');
  },
}
