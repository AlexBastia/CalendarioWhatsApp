import { redirect, fail } from "@sveltejs/kit";
import { Notifica } from "$lib/models/Notification";
import { Pomodoro } from "$lib/models/Pomodoro.js";
import { Note } from "$lib/models/Note.js";
import { Evento } from "$lib/models/Event.js";
import { User } from "$lib/models/User";
import { startOfWeek, endOfWeek } from "date-fns";

export async function load(event) {
  console.log("Loading homepage data...");
  const sessionUser = event.locals.user;
  
  if (sessionUser === null) {
    redirect(302, "/login");
  }

  const userId = sessionUser._id;
  const userData = await User.findById(userId).select('virtualTime').lean();
  const today = userData?.virtualTime || new Date();  
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  try {
    // 1. Fetch latest Note
    const latestNote = await Note.findOne({ userID: userId })
      .sort({ timeCreation: -1 })
      .lean();

    // 2. Fetch Calendar events for the current week
    const weeklyEvents = await Evento.find({
      userID: userId,
      $or: [
        { start: { $gte: weekStart, $lt: weekEnd } },
        { end: { $gte: weekStart, $lt: weekEnd } }
      ]
    })
    .sort('start')
    .lean();
    
    // 3. Fetch latest Pomodoro report/activity
    const latestPomodoro = await Pomodoro.findOne({ 
      $or: [{ owner: userId }, { sharedUsers: userId }] 
    })
    .sort({ timeLastUsed: -1 })
    .lean();

    return {
      latestNote: latestNote ? { 
        _id: latestNote._id.toString(), 
        title: latestNote.title, 
        snippet: latestNote.textStart, 
        timeCreation: latestNote.timeCreation
      } : null,
      weeklyEvents: weeklyEvents.map(event => ({ 
        title: event.title, 
        start: event.start, 
        eventType: event.eventType
      })),
      latestPomodoro: latestPomodoro ? {
        completionTime: latestPomodoro.timeLastUsed, 
        cycles: latestPomodoro.cycles,
        title: latestPomodoro.title
      } : null,
    };

  } catch (error) {
    console.error("Error fetching homepage previews:", error);
    return {
      latestNote: null,
      weeklyEvents: [],
      latestPomodoro: null,
      error: "Could not load preview data."
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