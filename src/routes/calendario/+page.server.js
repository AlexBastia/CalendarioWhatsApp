import { Evento } from '$lib/models/Event.js';
import { Pomodoro } from '$lib/models/Pomodoro.js'; // Aggiunto per caricarlo nel form
import { redirect, fail } from '@sveltejs/kit';
import { startOfDay, set, differenceInMilliseconds, add } from 'date-fns';
import { Tasks } from '$lib/models/Task.js';

/*
import { Schema, Types, model } from 'mongoose';
const attivitaSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['todo', 'done'], 
      default: 'todo' 
    },
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User'
    },
    lastNotificationLevel: {
      type: String,
      enum: ['Nessuna', 'Imminente', 'Oggi', 'Scaduta'],
      default: 'Nessuna'
    }
  }
);
export const Tasks = model('Tasks', attivitaSchema);

Il Flusso Concettuale di updateTask
La tua funzione, quando viene chiamata (ad esempio, dalla load principale), deve seguire questi passaggi:

Trova le Attività a Rischio: Cerca nel database tutte le attività per userId che soddisfano due condizioni contemporaneamente:

Hanno lo stato 'Da Fare' (o 'todo').

La loro data di scadenza (deadline) è precedente alla data attuale (today).

Aggiorna il Loro Stato: Per ognuna di queste attività trovate, esegui un'operazione di aggiornamento sul database per cambiare il loro campo status da 'Da Fare' a un nuovo stato che potremmo chiamare 'In Ritardo'.

Non Fare Nulla Altrimenti: Se un'attività non è ancora scaduta, la funzione semplicemente la ignora.

Il risultato è che, dopo l'esecuzione di questa funzione, il tuo database conterrà una distinzione chiara tra attività ancora da fare e attività che sono ufficialmente in ritardo. Potrai poi usare questo nuovo stato nell'interfaccia per mostrarle in modo diverso (ad esempio, con un'icona rossa o in una sezione separata "Da Recuperare").

Per poter implementare questa logica, il primo passo è assicurarsi che il tuo schema Mongoose per le Attività possa gestire questo nuovo stato. Al momento probabilmente hai solo 'Da Fare' e 'Completata'. Vuoi che ti mostri come aggiornare lo schema e poi ti scriva il codice per la funzione updateTask basandoci su quello?
*/


async function updateTask(userId, today) {
  const startOfToday = startOfDay(today);
  // Trova tutte le attività con stato 'todo' e deadline precedente a oggi
  const tasksToUpdate = await Tasks.find({
    userId: userId,
    status: 'todo',
    deadline: { $lt: startOfToday }
  });

  for (const task of tasksToUpdate) {
    await Tasks.findByIdAndUpdate(task._id, {
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
  // CORREZIONE 1: Usa 'throw redirect'
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  
  const today = locals.user.virtualTime ? new Date(locals.user.virtualTime) : new Date();

  // Esegue gli aggiornamenti in parallelo per efficienza
  await Promise.all([
      updatePom(locals.user.id, today),
      updateTask(locals.user.id, today)
  ]);

  // CORREZIONE 2: Carica anche le 'Tasks'
  const [eventiUtente, attivitaUtente, pomodoriUtente] = await Promise.all([
    Evento.find({ userID: locals.user.id }).lean(),
    Tasks.find({ userId: locals.user.id }).lean(), // Aggiunto!
    Pomodoro.find({ userID: locals.user.id }).lean()
  ]);

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

  saveTask: async ({ locals, request }) => {
    if (!locals.user) {
      redirect(301, '/login');
    }
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    if (!data.title || !data.deadline) {
        return fail(400, { message: 'Titolo e scadenza sono obbligatori.' });
    }

    const taskData = {
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline + 'T23:59:59'), // Imposta la scadenza alla fine del giorno
      status: 'todo', // Nuove attività sono sempre 'todo'
      userId: locals.user.id 
    };

    const taskId = data.id || null;

    if (taskId) {
      // Se c'è un ID, aggiorna l'attività esistente
      await Tasks.findOneAndUpdate({ _id: taskId, userId: locals.user.id }, taskData);
    } else {
      // Altrimenti, crea una nuova attività
      await Tasks.create(taskData);
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