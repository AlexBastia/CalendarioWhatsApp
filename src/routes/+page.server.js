import { redirect, fail } from "@sveltejs/kit"
import { Notifica } from "$lib/models/Notification";
import { Pomodoro } from "$lib/models/Pomodoro.js";
import {computeLevel} from '$lib/utils/UpdateTasks.js';
import { getNotificationDataForTasks } from "$lib/utils/notification.js";
import { timingStore } from '$lib/stores/timing.js'
import { Note } from "$lib/models/Note.js";
import { Evento } from "$lib/models/Event.js";
import { User } from "$lib/models/User";
import mongoose from "mongoose";
import { Query } from "mongoose";
import { startOfWeek, addDays, endOfWeek, endOfWeek } from "date-fns";

export async function load(event) {
  console.log("Loading homepage data...");
  const sessionUser = event.locals.user;
  
  if (sessionUser === null) {
    redirect(302, "/login");
  }
  const userId = sessionUser._id;
  const userData = await User.findById(userId).select('virtualTime').lean();
  const today = userData ? userData.virtualTime : new Date();  
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  try {
    // 1. Fetch latest Note (or an array of recent notes)
    const latestNote = await Note.findOne({ userID: userId })
      .sort({ timeCreation: -1 })
      .lean();
    // 2. Fetch Calendar events for the current week
    // Assuming Event has a 'date' field and an 'owner' field
    const weeklyEvents = await Evento.find({
      userID: userId, // Campo corretto come da schema Evento
      $or: [
        { start: { $gte: weekStart, $lt: weekEnd } }, // Inizio evento nella settimana
        { end: { $gte: weekStart, $lt: weekEnd } }     // Fine evento nella settimana
      ]
    })
    .sort('start')
    .lean();
    
    // 3. Fetch latest Pomodoro report/activity
    const latestPomodoro = await Pomodoro.findOne({ 
      $or: [{ owner: userId }, { sharedUsers: userId }] 
    }).sort({ timeLastUsed: -1 }).lean();


    // Return the fetched data to the Svelte component
  return {
      latestNote: latestNote ? { 
        _id: latestNote._id, 
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
    // You might want to return an error state or null values
    return {
      latestNote: null,
      weeklyEvents: [],
      latestPomodoro: null,
      error: "Could not load preview data."
    }
  }
}

export const actions = {
  acceptPomodoro: async ({ request, locals }) => {
    const data = await request.formData();
    const pomodoroId = data.get("pomodoroId");
    const notificaId = data.get("notificationId");
    console.log(pomodoroId, notificaId)
    const userId = locals.user._id;

    const pomodoro = await Pomodoro.findOne({_id: pomodoroId});
    console.log('asdads')
    if(!pomodoro) {console.log('d'); return fail(400, {message: 'f', success: false})}
    console.log(pomodoro);
    // devo controllare se l'utente sia in sheredUSer
    if (!pomodoro.sharedUsers.some(id => id.equals(userId))) {
      // il pomdooro non contiene già l'utente possiamo inserirlo in sharedUsers
      pomodoro.sharedUsers.push(userId);
      await pomodoro.save();
    }
    else{
      return fail(
        403, {
          message: 'utente già nello shared user',
          success: false
        }
      )
    }
    // cancella notifica
    await Notifica.deleteOne({ _id: notificaId  });
    
    return { success: true, messaggio: "Pomodoro accettato con successo" };
  },

  deleteNotification: async ({ request, locals }) => {
    const data = await request.formData();
    const notificaId = data.get("notificationId");
    const userId = locals.user._id;

    // cancella notifica
    await Notifica.deleteOne({ _id: notificaId, destinatario: userId });
    
    return { success: true, messaggio: "Notifica eliminata con successo" };
  }
}