// src/lib/server/scheduler.js

import cron from 'node-cron';
import { Evento } from '$lib/models/Event.js'; 
import { Notifica } from '$lib/models/Notification.js';
import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";

export function startScheduler() {
  console.log('Scheduler per le notifiche avviato.');
  
  cron.schedule('*/1 * * * *', async () => {
    const now = new Date();
    console.log(`\n🕒 Cron job in esecuzione: ${now.toLocaleTimeString('it-IT')}`);

  //   try {
  //     const eventsToNotify = await Evento.find({
  //       'notificationSettings.enabled': true,
  //       'notificationSettings.notifyAt': { $lte: now },
  //       'notificationSettings.processed': { $ne: true },
  //       'start': { $gt: now } // AGGIUNTO: Solo eventi che NON sono ancora iniziati
  //     });

  //     console.log(`📋 Eventi trovati: ${eventsToNotify.length}`);

  //     for (const event of eventsToNotify) {
  //       const { repeat, repeat_number, lastNotificationSentAt } = event.notificationSettings;

  //       console.log(`repeat number ${repeat_number} e lastNotificationSentAt: ${lastNotificationSentAt}`);

  //       let shouldNotify = false;

  //       // Determina se inviare la notifica
  //       if (!lastNotificationSentAt) {
  //         shouldNotify = true;
  //       } else {
  //         switch (repeat) {
  //           case 'minute':
  //             if (differenceInMinutes(now, lastNotificationSentAt) >= repeat_number) {
  //               shouldNotify = true;
  //             }
  //             break;
  //           case 'hour':
  //             if (differenceInHours(now, lastNotificationSentAt) >= repeat_number) {
  //               shouldNotify = true;
  //             }
  //             break;
  //           case 'day':
  //             if (differenceInDays(now, lastNotificationSentAt) >= repeat_number) {
  //               shouldNotify = true;
  //             }
  //             break;
  //         }
  //       }

  //       if (shouldNotify) {
  //         // Doppio controllo: verifica che l'evento non sia già iniziato
  //         if (event.start <= now) {
  //           console.log(`⏭️  Evento "${event.title}" già iniziato, marco come processato.`);
  //           await Evento.findByIdAndUpdate(event._id, {
  //             $set: { 'notificationSettings.processed': true }
  //           });
  //           continue;
  //         }

  //         const updateQuery = {
  //           _id: event._id,
  //           'notificationSettings.enabled': true,
  //           'notificationSettings.notifyAt': { $lte: now },
  //           'start': { $gt: now } // AGGIUNTO: Condizione anche qui per sicurezza
  //         };

  //         const updateData = repeat === 'none' 
  //           ? { 'notificationSettings.processed': true }
  //           : { 'notificationSettings.lastNotificationSentAt': now };

  //         if (!lastNotificationSentAt) {
  //           updateQuery['notificationSettings.lastNotificationSentAt'] = { $exists: false };
  //         } else {
  //           updateQuery['notificationSettings.lastNotificationSentAt'] = lastNotificationSentAt;
  //         }

  //         const updated = await Evento.findOneAndUpdate(
  //           updateQuery,
  //           { $set: updateData },
  //           { new: false }
  //         );

  //         if (updated) {
  //           console.log(`📩 Creazione notifica per l'evento: "${event.title}"`);
            
  //           await Notifica.create({
  //             destinatario: event.userID,
  //             mittente: null,
  //             tipo: 'EVENTO',
  //             riferimento: event._id,
  //           });
  //         } else {
  //           console.log(`⏭️  Evento "${event.title}" già processato da un'altra esecuzione.`);
  //         }
  //       }
  //     }

  //     if (eventsToNotify.length === 0) {
  //       console.log("DB controllato, nessuna notifica da inviare in questo minuto.");
  //     }
  //   } catch (error) {
  //     console.error('Errore durante il controllo delle notifiche degli eventi:', error);
  //   }
  // });
  });
}