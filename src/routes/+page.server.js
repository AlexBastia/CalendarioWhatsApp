import { redirect } from "@sveltejs/kit"
import { Notifica } from "$lib/models/Notification";

export async function load(event) {
  if (event.locals.user === null) {
    redirect(302, "/login")
  }

  const unreadNotifications = await Notifica.find({ destinatario: event.locals.user._id, letta: false });
  return { unreadNotifications: JSON.parse(JSON.stringify(unreadNotifications)) }; 
}

export const actions = {
  acceptPomodoro: async ({ request, locals }) => {
    const data = await request.formData();
    const pomodoroId = data.get("pomodoroId");
    const notificaId = data.get("notificaId");
    const userId = locals.user._id;

    const pomodoro = await Pomodoro.findById(pomodoroId);
    // devo controllare se l'utente sia in sheredUSer
    if (!pomodoro.sharedUsers.includes(userId)) {
      // il pomdooro non contiene già l'utente possiamo inserirlo in sharedUsers
      pomodoro.sharedUsers.push(userId);
      await Pomodoro.save(pomodoro);
    }
    
    // cancella notifica
    await Notifica.deleteOne({ _id: notificaId, destinatario: userId });
    
    return { success: true, messaggio: "Pomodoro accettato con successo" };
  },

  deleteNotification: async ({ request, locals }) => {
    const data = await request.formData();
    const notificaId = data.get("notificaId");
    const userId = locals.user._id;

    // cancella notifica
    await Notifica.deleteOne({ _id: notificaId, destinatario: userId });
    
    return { success: true, messaggio: "Notifica eliminata con successo" };
  }
}