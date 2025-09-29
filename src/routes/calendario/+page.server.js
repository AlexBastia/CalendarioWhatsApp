import { Evento } from '$lib/models/Event.js';
import { Pomodoro } from '$lib/models/Pomodoro.js'; // Aggiunto per caricarlo nel form
import { redirect, fail } from '@sveltejs/kit';
import { startOfDay, set, differenceInMilliseconds, add } from 'date-fns';
import { Task } from '$lib/models/Task.js';
import { mkLastDate } from '$lib/utils/eventRecursion.js'; 

async function updateTask(userId, today) {
  const startOfToday = startOfDay(today);
  // Trova tutte le attività con stato 'todo' e deadline precedente a oggi
  const tasksToUpdate = await Task.find({
    userId: userId,
    status: 'todo',
    deadline: { $lt: startOfToday }
  });

  for (const task of tasksToUpdate) {
    await Task.findByIdAndUpdate(task._id, {
      $set: { status: 'late' } // Aggiorna lo stato a 'in ritardo'
    });
  }

}
async function updatePom(userId, today) {

  const startOfToday = startOfDay(today);

  // Trova tutti i pomodori pianificati per oggi o prima
  const events2update = await Evento.find({
    userID: userId,
    eventType: 'POMODORO',
    status: 'PIANIFICATO',
    start: { $lt: (today) }
  });

  for (const evento of events2update) {
    const oldStart = new Date(evento.start);
    const oldFinish = new Date(evento.end);

    // calola la durata (in ms)
    const durataMs = differenceInMilliseconds(oldFinish, oldStart);

    // crea nuove date
    const newStart = set(today, {
      hours: oldStart.getHours(),
      minutes: oldStart.getMinutes(),
      seconds: oldStart.getSeconds()
    });

    // roba
    const newFinish = add(newStart, { milliseconds: durataMs });

    await Evento.findByIdAndUpdate(evento._id, {
      $set: {
        start: newStart,
        end: newFinish
      }
    });
  }
}

export async function load({ locals }) {
  console.log(`Caricamento +page.server.js per /calendario`);
  // CORREZIONE 1: Usa 'throw redirect'
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  
  console.log(`Caricamento calendario per utente ${locals.user.id}`);
  const today = locals.user.virtualTime ? new Date(locals.user.virtualTime) : new Date();

  // Esegue gli aggiornamenti in parallelo per efficienza
  await Promise.all([
      updatePom(locals.user.id, today),
      updateTask(locals.user.id, today)
  ]);
  console.log(`Aggiornamenti completati per utente ${locals.user.id} alla data ${today}`);

  // CORREZIONE 2: Carica anche le 'Task'
  const [eventiUtente, attivitaUtente, pomodoriUtente] = await Promise.all([
    Evento.find({ userID: locals.user.id }).lean(),
    Task.find({ userId: locals.user.id }).lean(), 
    Pomodoro.find({ userID: locals.user.id }).lean()
  ]);
  console.log(`Eventi trovati: ${eventiUtente.length}, Attività trovate: ${attivitaUtente.length}, Pomodori trovati: ${pomodoriUtente.length}`);

  return {
    events: eventiUtente.map((evento) => ({
      _id: evento._id.toString(),
      title: evento.title,
      start: evento.start,
      end: evento.end,
      eventType: evento.eventType,
      pomodoroPreset: evento.pomodoroPreset?.toString()
    })),
    // Aggiungi questo al return object!
    tasks: attivitaUtente.map((task) => ({
      _id: task._id.toString(),
      title: task.title,
      deadline: task.deadline,
      status: task.status
    })),
    pomodori: pomodoriUtente.map((p) => ({
      _id: p._id.toString(),
      title: p.title
    }))
  };
}

export const actions = {
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
    //popola substruct ripetizione con i dati del form
    let ripetizione = {
      isRepeatable: data.isRepeatable === 'on',
      frequenza: data.frequenza || null,
      giorniSettimana: data.giorniSettimana
        ? Array.isArray(data.giorniSettimana)
          ? data.giorniSettimana.map(Number)
          : [Number(data.giorniSettimana)]
        : [],
      dayOfMonth: data.dayOfMonth ? Number(data.dayOfMonth) : null,
      nthWeekday: data.week && data.weekday
        ? {
            week: Number(data.week),
            weekday: Number(data.weekday)
          }
        : null,
      endCondition: {
        type: data.endType || 'MAI',
        lastDate: data.endDate ? new Date(data.endDate) : null,
        nVolte: data.endCount ? Number(data.endCount) : null
      }
    };

    // Calcola lastInstance solo se ripetizione attiva
    if (ripetizione.isRepeatable) {
      ripetizione.lastInstance = mkLastDate({ start, ripetizione });
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
  }
};