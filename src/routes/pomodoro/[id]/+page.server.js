// /pomodoro/[id]/+server.js
import { Pomodoro } from '$lib/models/Pomodoro.js';
import { Evento } from '$lib/models/Event.js'; // Potrebbe servire per validazioni
import { Notifica } from '$lib/models/Notification.js';
import { User } from '$lib/models/User';
import { redirect, error, fail } from '@sveltejs/kit';

export async function load(event) {
  console.log(`zio pera2}`);
  if (!event.locals.user) {
    redirect(303, '/login');
  }

  const pomodoroId = event.params.id;
  console.log(`Caricamento Pomodoro [${pomodoroId}] per utente ${event.locals.user._id}`);

  try {
    console.log(`Eseguo findOne per Pomodoro [${pomodoroId}]`);
    const pomodoroDoc = await Pomodoro.findOne({ _id: pomodoroId })
      .populate('sharedUsers', 'username email _id')
      .lean();
    console.log('Pomodoro trovato:', pomodoroDoc);


    if (!pomodoroDoc) {
      throw error(404, { message: 'Pomodoro non trovato' });
    }

    console.log(`Eseguo LOAD per Pomodoro [${pomodoroId}] alle ${new Date().toLocaleTimeString()}`);


    return {
      pomodoro: JSON.parse(JSON.stringify(pomodoroDoc))
    };
  } catch (err) {
    console.error('Errore durante il caricamento del Pomodoro [ID]:', err);
    if (err.status) throw err;
    throw error(500, { message: 'Errore interno' });
  }
}

function minutesToISO(minutes) {
  if (!minutes && minutes !== 0) return null;

  const totalMinutes = Number(minutes);
  if (Number.isNaN(totalMinutes) || totalMinutes < 0) return null;

  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;

  const d = new Date(Date.UTC(1970, 0, 1, hh, mm, 0));

  if (isNaN(d.getTime())) return null;

  return d.toISOString();
}



export const actions = {
  removeUser: async ({ request, params, locals }) => {
    if (!locals.user) return fail(401, { message: 'Non autorizzato', error: true });

    const formData = await request.formData();
    const emailDest = formData.get('email');
    const idDest = await User.findOne({ email: emailDest }).select('_id');

    try {

      const notifica = await Notifica.deleteOne({ destinatario: idDest, tipo: 'CONDIVISIONE_POMODORO', riferimento: params.id, mittente: locals.user._id });

      if (!notifica) {
        return fail(400, { message: 'no notifica id', error: true });
      }
      console.log('Notifica cancellata:', notifica);
      // ritorniamo dati serializzabili utili al client (email e id)
      return { success: true, message: 'Notifica eliminata', notifica: JSON.parse(JSON.stringify(notifica)), email: emailDest };
    } catch (err) {
      console.error('Errore cancellazione notifica:', err);
      return fail(500, { message: 'Errore durante la cancellazione', error: true });
    }
  },

  addUser: async ({ request, params, locals }) => {
    if (!locals.user) return fail(401, { message: 'Non autorizzato', error: true });

    const formData = await request.formData();
    const email = formData.get('email');
    const nowIso = formData.get('now'); // aspettati ISO string dal client (es. toISOString)

    if (!email) return fail(400, { message: 'Email mancante', error: true });

    // parse della data inviata dal client (se presente), fallback a server time
    const dataNotifica = nowIso ? new Date(nowIso) : new Date();

    try {
      const user = await User.findOne({ email });
      if (!user) return fail(404, { message: 'Utente non trovato', error: true });
      if (user._id.equals(locals.user._id)) return fail(400, { message: 'Non puoi condividere con te stesso', error: true });

      const pomodoro = await Pomodoro.findById(params.id);
      if (!pomodoro) return fail(404, { message: 'Pomodoro non trovato', error: true });

      if (!pomodoro.userID.equals(locals.user._id)) return fail(403, { message: 'Non autorizzato', error: true });
      if (pomodoro.sharedUsers.some(id => id.equals(user._id))) return fail(403, { message: 'Già conviso', error: true });


      const existingNotification = await Notifica.findOne({ destinatario: user._id, tipo: 'CONDIVISIONE_POMODORO', riferimento: pomodoro._id, mittente: locals.user._id });
      // devo controllare se è già stata inviata una notifica con la stessa conf
      console.log('Controllo notifica esistente:', existingNotification);
      if (existingNotification) {
        return fail(409, { message: 'Notifica già inviata', error: true });
      }

      // crea la notifica (non aggiungiamo sharedUsers qui)
      const notifica = new Notifica({
        tipo: 'CONDIVISIONE_POMODORO',
        destinatario: user._id,
        riferimento: pomodoro._id,
        mittente: locals.user._id,
        letto: false,
        data: dataNotifica
      });

      const notificaSaved = await notifica.save();
      if (!notificaSaved) {
        return fail(500, { message: 'Errore nell\'invio della notifica', error: true });
      }

      // ritorniamo dati serializzabili utili al client (email e id)
      return {
        success: true,
        message: 'Notifica di condivisione inviata',
        notifica: JSON.parse(JSON.stringify(notificaSaved)),
        email: user.email,
        userId: String(user._id)
      };
    } catch (err) {
      console.error('Errore in addUser action:', err);
      return fail(500, { message: 'Errore interno', error: true });
    }
  },

  updatePomodoro: async ({ request, params, locals }) => {
    if (!locals.user) return fail(401, { message: 'Non autorizzato', error: true });
    const data = await request.formData();
    const id = params.id;

    const title = data.get('title') || '';
    const timeStudyStr = data.get('timeStudy');
    const timeBreakStr = data.get('timeBreak');
    const cycles = parseInt(data.get('cycles') || '0', 10);

    console.log(timeStudyStr)
    console.log(timeBreakStr)

    const timeStudy = minutesToISO(timeStudyStr);
    const timeBreak = minutesToISO(timeBreakStr);

    try {
      console.log('zio pera');
      const pomodoro = await Pomodoro.findById(id);
      if (!pomodoro) return fail(404, { message: 'Pomodoro non trovato', error: true });
      if (!pomodoro.userID.equals(locals.user._id)) return fail(403, { message: 'Non autorizzato', error: true });

      console.log('pomodoro prima: ', pomodoro)
      pomodoro.title = title;
      if (timeStudy) pomodoro.timeStudy = timeStudy;
      if (timeBreak) pomodoro.timeBreak = timeBreak;
      pomodoro.cycles = isNaN(cycles) ? pomodoro.cycles : cycles;
      console.log('pomodoro adesso: ', pomodoro)

      await pomodoro.save();

    } catch (err) {
      // Qui catturo SOLO errori del database, non il redirect
      console.error('Errore updatePomodoro:', err);
      return fail(500, { message: 'Errore interno', error: true });
    }
    throw redirect(303, `/pomodoro/${id}`);

  }
};
