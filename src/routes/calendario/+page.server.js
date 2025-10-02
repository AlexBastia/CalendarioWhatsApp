import { Evento } from '$lib/models/Event.js';
import { User } from '$lib/models/User.js';
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
  console.log(' OGGI È', today)

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
  if (!locals.user) {
    redirect(303, '/login');
  }


  const user = await User.findById(locals.user.id, 'virtualTime').lean();
  console.log(user)
  const today = user?.virtualTime ? new Date(user.virtualTime) : new Date();
  console.log('zio pera', today);

  await Promise.all([
    updatePom(locals.user.id, today),
    updateTask(locals.user.id, today)
  ]);
  console.log(`Aggiornamenti completati per utente ${locals.user.id} alla data ${today}`);

  const [eventiUtente, attivitaUtente, pomodoriUtente] = await Promise.all([
    Evento.find({ userID: locals.user.id }).lean(),
    Task.find({ userId: locals.user.id }).lean(),
    Pomodoro.find({ userID: locals.user.id }).lean()
  ]);
  console.log(`Eventi trovati: ${eventiUtente.length}, Attività trovate: ${attivitaUtente.length}, Pomodori trovati: ${pomodoriUtente.length}`);
  console.log('Primo evento caricato:', JSON.stringify(eventiUtente[0]?.ripetizione, null, 2));
  return {
    virtualTime: user?.virtualTime,
    events: eventiUtente.map((evento) => ({
      _id: evento._id.toString(),
      title: evento.title,
      allDay: evento.allDay,
      start: evento.start,
      end: evento.end,
      eventType: evento.eventType,
      pomodoroPreset: evento.pomodoroPreset?.toString(),
      ripetizione: evento.ripetizione || {
        isRepeatable: false,
        frequenza: null,
        giorniSettimana: [],
        monthlyMode: 'dayOfMonth',
        nthWeekday: { week: null, weekday: null },
        endCondition: { type: 'MAI', nVolte: null, endDate: null },
        lastInstance: null
      }
    })),
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

    const isGoogle = data.isGoogle ?? false;

    let ripetizione = {
      isRepeatable: data.isRepeatable === 'true',
      frequenza: data.frequenza || null,
      giorniSettimana: Object.keys(data)
        .filter((key) => key.startsWith('giorniSettimana')) 
        .map((key) => Number(data[key]))                    
        .sort((a, b) => a - b),
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
    };
    const eventData = {
      title: data.title,
      note: data.note,
      start: start,
      end: end,
      place: data.location,
      allDay: allDay,
      eventType: data.eventType,
      pomodoroPreset: data.eventType === 'POMODORO' ? data.pomodoroPreset : null,
      ripetizione: ripetizione,
      status: data.eventType === 'POMODORO' ? 'PIANIFICATO' : null,
      userID: locals.user.id,
      isGoogle
    };

    const eventId = data.id || null;
    console.log('Dati ripetizione da salvare:', JSON.stringify(ripetizione, null, 2));
    if (eventId) {
      await Evento.findOneAndUpdate({ _id: eventId, userID: locals.user.id }, eventData);
    } else {
      const savedEvent = await Evento.create(eventData);
      console.log('Evento salvato:', JSON.stringify(savedEvent.ripetizione, null, 2));
    }

    throw redirect(303, '/calendario');
  },


  deleteEvent: async ({ locals, request }) => {
    if (!locals.user) {
      redirect(301, '/login');
    }
    const formData = await request.formData();
    const eventId = formData.get('id');

    await Evento.deleteOne({ _id: eventId, userID: locals.user.id });

    throw redirect(303, '/calendario');
  },

  updatePomStatus: async ({ request, locals }) => {
    if (!locals.user) {
      redirect(301, '/login');
    }

    const formData = await request.formData();
    const eventId = formData.get('eventId');
    const newStatus = formData.get('status');

    await Evento.findByIdAndUpdate({
      _id: eventId, userID: locals.user.id
    },
      {
        $set: {
          status: newStatus
        }
      });

    throw redirect(303, '/calendario');
  },

  refreshGoogleEvents: async ({ request, locals }) => {
    if (!locals.user) {
      redirect(301, '/login');
    }

    const data = await request.json();

    let res = await Evento.deleteMany({ isGoogle: true, userID: locals.user._id })
    if (!res) return fail(500, { failed: true })

    res = await Evento.insertMany(data.events.map(event => {
      return {
        title: event.title,
        start: event.start,
        end: event.end,
        place: event.place,
        allDay: false,
        note: event.note,
        userID: locals.user._id,
        eventType: 'STANDARD',
        isGoogle: true
      }
    }))
    if (!res) return fail(500, { failed: true })

    return { success: true }
  }
};
