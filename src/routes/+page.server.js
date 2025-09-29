import { redirect, fail } from "@sveltejs/kit"
import { Notifica } from "$lib/models/Notification";
import { Pomodoro } from "$lib/models/Pomodoro.js";
import {computeLevel} from '$lib/utils/UpdateTasks.js';
import { getNotificationDataForTasks } from "$lib/utils/notification.js";
import { timingStore } from '$lib/stores/timing.js'

export async function load(event) {
  console.log("zio pera1");
  if (event.locals.user === null) {
    redirect(302, "/login")
  }

  console.log(event.locals.user)


  console.log("Loading notifications for user:", event.locals.user.id);

  const notificationForPom = await Notifica.find({ destinatario: event.locals.user.id});

  console.log("Found notifications:", notificationForPom);
  console.log(event.locals.user._id)
  if (event.locals.user.virtualTime){
    await computeLevel(event.locals.user._id, event.locals.user.virtualTime);
  }
  else{
    await computeLevel(event.locals.user._id, new Date());
  }
  const notificationsForTasks = await getNotificationDataForTasks(event.locals.user._id);

  console.log('notification2:', notificationForPom);

  return { notificationForPom: JSON.parse(JSON.stringify(notificationForPom)), notificationTasks: notificationsForTasks };
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