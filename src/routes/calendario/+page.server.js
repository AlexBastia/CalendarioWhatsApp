import { Evento } from '$lib/models/Event.js';
import { Pomodoro } from '$lib/models/Pomodoro.js'; // Aggiunto per caricarlo nel form
import { redirect, fail } from '@sveltejs/kit';
import { startOfDay, set, differenceInMilliseconds, add } from 'date-fns';

/**
 * Funzione LOAD: Carica sia gli eventi che i preset pomodoro per l'utente loggato.
 */
export async function load({ locals }) {
  if (!locals.user) {
    redirect(301, '/login');
  }

  // FIX: Cerca solo gli elementi dell'utente loggato
  const eventiUtente = await Evento.find({ userID: locals.user.id });
  const pomodoriUtente = await Pomodoro.find({ userID: locals.user.id });

  return {
    events: eventiUtente.map((evento) => ({
      _id: evento._id.toString(),
      title: evento.title,
      start: evento.start,
      end: evento.end,
      // Aggiungi altri campi se necessari nel frontend
      eventType: evento.eventType,
      pomodoroPreset: evento.pomodoroPreset?.toString()
    })),
    // Passa i preset pomodoro al frontend per popolarli nel form
    pomodori: pomodoriUtente.map((p) => ({
      _id: p._id.toString(),
      title: p.title
    }))
  };
}

export const actions = {
  /**
   * Azione unificata per CREARE e AGGIORNARE un evento.
   * Gestisce sia eventi STANDARD che POMODORO.
   */
  saveEvent: async ({ locals, request }) => {
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

  deleteEvent: async ({ locals, request }) => {
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

  updatePomStatus : async ({request, locals}) => {
   if (!locals.user) {
    redirect(301, '/login');
  }

    const formData = await request.formData();
    const eventId = formData.get('eventId');
    const newStatus = formData.get('status');

    await Evento.findByIdAndUpdate({
      _id: eventId, userID: locals.user.id 
    },  
    {$set:{
      status: newStatus 
    }});

    throw redirect(303, '/calendario');
  },

  hanldePom: async ({ locals }) =>{
    if (!locals.user) {
    redirect(301, '/login');
  }

    const oggi = startOfDay();

    const eventi = await Evento.find({
      userID: locals.user.id,
            eventType: 'POMODORO',
            status: 'PIANIFICATO',
            start: { $lt: oggi }
    });

    for (const evento of eventi){
      const vecchiaDataInizio = new Date(evento.start);
      const vecchiaDataFine = new Date(evento.end);

      const durataMs = differenceInMilliseconds(vecchiaDataFine, vecchiaDataInizio);

      const nuovaDataInizio = set(oggi, {
        hours: vecchiaDataInizio.getHours(),
        minutes: vecchiaDataInizio.getMinutes(),
        seconds: vecchiaDataInizio.getSeconds()
      });
            
      const nuovaDataFine = add(nuovaDataInizio, { milliseconds: durataMs });

      await Evento.findByIdAndUpdate(evento._id, {
        $set: {
          start: nuovaDataInizio,
          end: nuovaDataFine
        }
      });
    }

  }
};