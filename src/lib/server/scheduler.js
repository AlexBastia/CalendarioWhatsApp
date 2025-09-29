// src/lib/server/scheduler.js

import cron from 'node-cron';
import { Evento } from '$lib/models/Event.js'; 
import { Notifica } from '$lib/models/Notification.js';
import {differenceInMinutes, differenceInHours, differenceInDays} from "date-fns";

export function startScheduler() {
  console.log('Scheduler per le notifiche avviato.');
  
  cron.schedule('*/1 * * * *', async () => {
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60000);
    console.log(`\n🕒 Cron job in esecuzione: ${now.toLocaleTimeString('it-IT')}`);

try {
    const now = new Date();
    const eventsToNotify = await Evento.find({
      'notificationSettings.enabled': true,
      'notificationSettings.notifyAt': { $lte: now }, // Notifiche "scadute"
      'notificationSettings.processed': { $ne: true }  // E non ancora "ignorate"
    });

    for (const event of eventsToNotify) {
      const { repeat, repeat_number, lastNotificationSentAt } = event.notificationSettings;

      let shouldNotify = false;

      // --- NUOVA LOGICA DI CONTROLLO ---
      if (!lastNotificationSentAt) {
        shouldNotify = true;
      } else {
        switch (repeat) {
          case 'minute':
            if (differenceInMinutes(now, lastNotificationSentAt) >= repeat_number) {
              shouldNotify = true;
            }
            break;
          case 'hour':
            if (differenceInHours(now, lastNotificationSentAt) >= repeat_number) {
              shouldNotify = true;
            }
            break;
          case 'day':
            if (differenceInDays(now, lastNotificationSentAt) >= repeat_number) {
              shouldNotify = true;
            }
            break;
        }
      }

      if (shouldNotify) {
        console.log(`📩 Creazione notifica per l'evento: "${event.title}"`);
        await Notifica.create({
          destinatario: event.userID,
          mittente: null,
          tipo: 'EVENTO',
          riferimento: event._id,
        });

        if (repeat === 'none') {
          // Se la ripetizione è 'none', la marchiamo come processata e finisce qui.
          event.notificationSettings.processed = true;
        } else {
          // Altrimenti, aggiorniamo solo la data dell'ultima notifica inviata.
          event.notificationSettings.lastNotificationSentAt = now;
        }
        await event.save();
      }
    }

    if (eventsToNotify.length === 0) {
      console.log("DB controllato, nessuna notifica da inviare in questo minuto.");
    }
  } catch (error) {
      console.error('Errore durante il controllo delle notifiche degli eventi:', error);
    }
  });
}