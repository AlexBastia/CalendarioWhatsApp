import { redirect, fail } from "@sveltejs/kit";
import { Notifica } from "$lib/models/Notification";
import { Pomodoro } from "$lib/models/Pomodoro.js";
import { Note } from "$lib/models/Note.js";
import { Evento } from "$lib/models/Event.js";
import { User } from "$lib/models/User";

export async function load(event) {
  console.log("Loading homepage data...");
  const sessionUser = event.locals.user;
  
  if (sessionUser === null) {
    redirect(302, "/login");
  }

  const userId = sessionUser._id;

  try {
    // Fetch all notes
    const notes = await Note.find({ userID: userId })
      .sort({ timeCreation: -1 })
      .lean();

    // Fetch all events
    const events = await Evento.find({ userID: userId })
      .sort('start')
      .lean();

    // Fetch all pomodori
    const pomodori = await Pomodoro.find({ 
      $or: [{ owner: userId }, { sharedUsers: userId }] 
    })
    .sort({ timeLastUsed: -1 })
    .lean();

    return {
      notes: notes.map(note => ({
        _id: note._id.toString(),
        title: note.title,
        textStart: note.textStart,
        timeCreation: note.timeCreation
      })),
      events: events.map(event => ({
        _id: event._id.toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        eventType: event.eventType,
        repetition: event.repetition,
        repetitionEnd: event.repetitionEnd
      })),
      pomodori: pomodori.map(pom => ({
        _id: pom._id.toString(),
        title: pom.title,
        cycles: pom.cycles,
        timeLastUsed: pom.timeLastUsed
      }))
    };

  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      notes: [],
      events: [],
      pomodori: [],
      error: "Could not load data."
    };
  }
}

export const actions = {
  acceptPomodoro: async ({ request, locals }) => {
    const data = await request.formData();
    const pomodoroId = data.get("pomodoroId");
    const notificaId = data.get("notificationId");
    const userId = locals.user._id;

    const pomodoro = await Pomodoro.findOne({ _id: pomodoroId });
    
    if (!pomodoro) {
      return fail(400, { message: 'Pomodoro non trovato', success: false });
    }

    // Controlla se l'utente è già in sharedUsers
    if (!pomodoro.sharedUsers.some(id => id.equals(userId))) {
      pomodoro.sharedUsers.push(userId);
      await pomodoro.save();
    } else {
      return fail(403, {
        message: 'Utente già presente nello shared users',
        success: false
      });
    }

    // Cancella notifica
    await Notifica.deleteOne({ _id: notificaId });
    
    return { success: true, message: "Pomodoro accettato con successo" };
  },

  deleteNotification: async ({ request, locals }) => {
    const data = await request.formData();
    const notificaId = data.get("notificationId");
    const userId = locals.user._id;

    await Notifica.deleteOne({ _id: notificaId, destinatario: userId });
    
    return { success: true, message: "Notifica eliminata con successo" };
  }
};