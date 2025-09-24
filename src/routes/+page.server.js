import { redirect } from "@sveltejs/kit"
import { Notifica } from "$lib/models/Notification";
import { Pomodoro } from "$lib/models/Pomodoro.js";
import {computeLevel} from '$lib/utils/UpdateTasks.js';
import { getNotificationForTsks } from "$lib/utils/notification.js";
import { fail } from "assert";
import { timingStore } from '$lib/stores/timing.js'

export async function load(event) {
  if (event.locals.user === null) {
    redirect(302, "/login")
  }


  const unreadNotifications = await Notifica.find({ destinatario: event.locals.user._id});
  await computeLevel(user.locals.user._id, $timingStore);
  const notificationsForTasks = getNotificationForTsks(event.locals.user._id);

  return { unreadNotifications: JSON.parse(JSON.stringify(unreadNotifications)) };

}

export const actions = {
  acceptPomodoro: async ({ request, locals }) => {
    const data = await request.formData();
    const pomodoroId = data.get("pomodoroId");
    const notificaId = data.get("notificationId");
    console.log(pomodoroId, notificaId)
    const userId = locals.user._id;

    const pomodoro = await Pomodoro.findById({_id: pomodoroId});
    if(!pomodoro) return fail(400, {message: 'f', success: false})
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